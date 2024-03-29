import { I2CBufferSource } from '@johntalton/and-other-delights'
import { BitSmush } from '@johntalton/bitsmush'

import { Configuration, ID, Status, Temperature } from './types.js'
import { MANUFACTURE_ID } from './defs.js'

const TWO_COMP = {
	SIXTEEN: { offset: 65536, divisor: 128 },
	THIRTEEN: { offset: 8192, divisor: 16 }
}

export class Converter {
	static parseId(source: I2CBufferSource): ID {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const id = view.getUint8(0)

		const manufactureId = BitSmush.extractBits(id, 7, 5)
		const revisionId = BitSmush.extractBits(id, 2, 3)

		return {
			manufactureId,
			revisionId,
			matchedVendor: manufactureId === MANUFACTURE_ID
		}
	}

	static parseStatus(source: I2CBufferSource): Status {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const status = view.getUint8(0)

		const Tlow = BitSmush.extractBits(status, 4, 1)
		const Thigh = BitSmush.extractBits(status, 5, 1)
		const Tcrit = BitSmush.extractBits(status, 6, 1)
		const notRDY = BitSmush.extractBits(status, 7, 1)

		const high = Thigh === 1
		const low = Tlow === 1
		const critical = Tcrit === 1
		const ready = !(notRDY === 1)

		return {
			high, low, critical, ready
		}
	}

	static parseConfiguration(source: I2CBufferSource): Configuration {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const configuration = view.getUint8(0)

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

	static parseTemperature(source: I2CBufferSource): Temperature {
		function parseTemperature13(msb: number, lsb: number) {
			const sign = BitSmush.extractBits(msb, 7, 1)

			const flagLow = BitSmush.extractBits(lsb, 0, 1)
			const flagHigh = BitSmush.extractBits(lsb, 1, 1)
			const flagCrit = BitSmush.extractBits(lsb, 2, 1)

			const partMSB = BitSmush.extractBits(msb, 6, 7)
			const partLSB = BitSmush.extractBits(lsb, 7, 5)

			const offset = sign === 1 ? 0x1fff : 0
			const temperatureC = ((partMSB << 5 | partLSB) - offset) / 16

			return {
				temperatureC,
				flags: {
					low: flagLow === 1,
					high: flagHigh === 1,
					critical: flagCrit === 1
				}
			}
		}

		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const tempMSB = view.getUint8(0)
		const tempLSB = view.getUint8(1)

		const t13 = parseTemperature13(tempMSB, tempLSB)
		console.log(tempMSB, tempLSB, t13)
		return t13.temperatureC
	}

	static #raw16toC(raw16: number, options: { offset: number, divisor: number }): Temperature {
		const { offset, divisor } = options
		const negativeSign = (raw16 & 0x8000) === 0x8000
		const appliedOffset = negativeSign ? offset : 0
		return (raw16 - appliedOffset) / divisor
	}

	static parseSetpointTemperature(source: I2CBufferSource): Temperature {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		const raw16 = view.getUint16(0)
		return Converter.#raw16toC(raw16, TWO_COMP.SIXTEEN)
	}

	static parseSetpointHigh(source: I2CBufferSource) {
		return Converter.parseSetpointTemperature(source)
	}

	static parseSetpointLow(source: I2CBufferSource) {
		return Converter.parseSetpointTemperature(source)
	}

	static parseSetpointCritical(source: I2CBufferSource) {
		return Converter.parseSetpointTemperature(source)
	}

	static parseSetpointHysteria(source: I2CBufferSource): number {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		return view.getUint8(0)
	}

	static fromConfiguration(config: Configuration): ArrayBuffer {
		const {
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			operationMode,
			resolution
		} = config

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

	static fromSetpointTemperature(temp: Temperature): ArrayBuffer {

		const value = temp

		const u16 = Uint16Array.from([ value ])
		return u16.buffer
	}

	static fromSetpointHysteria(offset: number): ArrayBuffer {

		const value = offset

		const u8 = Uint8Array.from([ value ])
		return u8.buffer
	}
}
