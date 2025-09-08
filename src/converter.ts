import { I2CBufferSource } from '@johntalton/and-other-delights'
import { BitSmush } from '@johntalton/bitsmush'

import {
	Configuration,
	ConfigurationBits,
	ID, Status,
	Temperature,
	TemperatureStatus
} from './types.js'
import { MANUFACTURE_ID } from './defs.js'

export const BIT_SET = 1
export const BIT_UNSET = 0
export const RESOLUTION_FACTOR_PER_LSB = 128 // 1 / 128 ~ 0.0078 (per spec)
export const HYSTERIA_MASK = 0b1111
export const FAULT_Q_MASK = 0b11
export const MODE_MASK = 0b11

export const RESOLUTION_13 = 13
export const RESOLUTION_16 = 16

export class Converter {
	static _decodeByte(buffer: I2CBufferSource): number {
		const u8 = ArrayBuffer.isView(buffer) ?
			new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) :
			new Uint8Array(buffer)

		return u8[0]
	}

	static decodeId(buffer: I2CBufferSource): ID {
		const id = Converter._decodeByte(buffer)

		const manufactureId = BitSmush.extractBits(id, 7, 5)
		const revisionId = BitSmush.extractBits(id, 2, 3)

		return {
			manufactureId,
			revisionId,
			matchedVendor: manufactureId === MANUFACTURE_ID
		}
	}

	static decodeStatus(buffer: I2CBufferSource): Status {
		const status = Converter._decodeByte(buffer)

		const Tlow = BitSmush.extractBits(status, 4, 1)
		const Thigh = BitSmush.extractBits(status, 5, 1)
		const Tcrit = BitSmush.extractBits(status, 6, 1)
		const notRDY = BitSmush.extractBits(status, 7, 1)

		const high = Thigh === BIT_SET
		const low = Tlow === BIT_SET
		const critical = Tcrit === BIT_SET
		const ready = !(notRDY === BIT_SET)

		return {
			high, low, critical, ready
		}
	}

	static #decodeConfiguration(buffer: I2CBufferSource): ConfigurationBits {

		const configuration = Converter._decodeByte(buffer)

		const faultQueue = BitSmush.extractBits(configuration, 1, 2)
		const CTPolarity = BitSmush.extractBits(configuration, 2, 1)
		const INTPolarity = BitSmush.extractBits(configuration, 3, 1)
		const INTCTMode = BitSmush.extractBits(configuration, 4, 1)
		const operationMode = BitSmush.extractBits(configuration, 6, 2)
		const resolution = BitSmush.extractBits(configuration, 7, 1)

		return {
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			operationMode,
			resolution
		}
	}

	static decodeConfiguration(buffer: I2CBufferSource): Configuration {
		const {
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			operationMode,
			resolution
		} = Converter.#decodeConfiguration(buffer)

		return {
			faultQueueLength: faultQueue + 1,
			polarityCTActiveHigh: CTPolarity === BIT_SET,
			polarityINTActiveHigh: INTPolarity === BIT_SET,
			comparison: INTCTMode === BIT_SET,
			mode: operationMode,
			resolution: resolution === BIT_SET ? RESOLUTION_16 : RESOLUTION_13
		}
	}

	static decodeTemperature(source: I2CBufferSource, mode16: boolean): TemperatureStatus {
		if(mode16) {
			const temperatureC = Converter.#decodeTemperature(source, false)
			return {
				temperatureC
			}
		}

		const u8 = ArrayBuffer.isView(source) ?
			new Uint8Array(source.buffer, source.byteOffset, source.byteLength) :
			new Uint8Array(source)

		const [ _msb, lsb ] = u8

		const lowFlag = BitSmush.extractBits(lsb, 0, 1)
		const highFlag = BitSmush.extractBits(lsb, 1, 1)
		const criticalFlag = BitSmush.extractBits(lsb, 2, 1)

		const temperatureC = Converter.#decodeTemperature(source, true)

		return {
			temperatureC,
			low: lowFlag === BIT_SET,
			high: highFlag === BIT_SET,
			critical: criticalFlag === BIT_SET
		}
	}


	static #decodeTemperature(source: I2CBufferSource, mask13: boolean): Temperature {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const raw16 = view.getInt16(0, false)
		const mask = mask13 ? ~0b111 : ~0 // careful mask on 16 bit signed
		const value = raw16 & mask

		// reintroduce floating point by shifting down
		return value / RESOLUTION_FACTOR_PER_LSB
	}

	static decodeSetPointHigh(buffer: I2CBufferSource) {
		return Converter.#decodeTemperature(buffer, false)
	}

	static decodeSetPointLow(buffer: I2CBufferSource) {
		return Converter.#decodeTemperature(buffer, false)
	}

	static decodeSetPointCritical(buffer: I2CBufferSource) {
		return Converter.#decodeTemperature(buffer, false)
	}

	static decodeSetPointHysteria(buffer: I2CBufferSource): number {
		return Converter._decodeByte(buffer) & HYSTERIA_MASK
	}

	static #encodeConfiguration({
		faultQueue = 0,
		CTPolarity = 0,
		INTPolarity = 0,
		INTCTMode = 0,
		operationMode = 0,
		resolution = 0
	}: ConfigurationBits): ArrayBuffer {

		const configuration = BitSmush.smushBits([
			[1, 2],
			[2, 1],
			[3, 1],
			[4, 1],
			[6, 2],
			[7, 1],
		], [
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			operationMode,
			resolution
		])

		const u8 = Uint8Array.from([ configuration ])
		return u8.buffer
	}

	static encodeConfiguration({
		faultQueueLength = 1,
		polarityCTActiveHigh = false,
		polarityINTActiveHigh = false,
		comparison = false,
		mode = 0b00,
		resolution = RESOLUTION_13
	}: Configuration) {
		return Converter.#encodeConfiguration({
			faultQueue: Math.min(Math.max(0, faultQueueLength - 1), FAULT_Q_MASK),
			CTPolarity: polarityCTActiveHigh ? BIT_SET : BIT_UNSET,
			INTPolarity: polarityINTActiveHigh ? BIT_SET : BIT_UNSET,
			INTCTMode: comparison ? BIT_SET : BIT_UNSET,
			operationMode: mode & MODE_MASK,
			resolution: resolution === RESOLUTION_16 ? BIT_SET : BIT_UNSET
		})
	}

	static encodeTemperature(temp: Temperature, into: I2CBufferSource = new ArrayBuffer(2)): I2CBufferSource {
		// floating point C temp into integer by shifting up by seven (making the msb the whole number part)
		const value = Math.round(temp * RESOLUTION_FACTOR_PER_LSB)

		const dv = ArrayBuffer.isView(into) ?
			new DataView(into.buffer, into.byteOffset, into.byteLength) :
			new DataView(into)

		// device is BE
		dv.setInt16(0, value, false)

		return dv.buffer
	}

	static encodeSetPointHysteria(offset: number): I2CBufferSource {
		return Uint8Array.from([ offset ])
	}
}

