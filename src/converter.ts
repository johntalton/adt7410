import { I2CBufferSource } from '@johntalton/and-other-delights'
import { BitSmush } from '@johntalton/bitsmush'

import { Configuration, ID, Status, Temperature } from './types.js'
import { MANUFACTURE_ID } from './defs.js'

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
		const RDY = BitSmush.extractBits(status, 7, 1)

		const high = Thigh === 1
		const low = Tlow === 1
		const critical = Tcrit === 1
		const ready = RDY === 1

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
		const OperationMode = BitSmush.extractBits(configuration, 6, 2)
		const resolution = BitSmush.extractBits(configuration, 7, 1)

		return {
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			OperationMode,
			resolution
		}
	}


	static parseTemperature(source: I2CBufferSource): Temperature {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)


		// const tempMSB = view.getUint8(0)
		const tempLSB = view.getUint8(1)

		// const sign = BitSmush.extractBits(tempMSB, 7, 1)

		// const flagLow = BitSmush.extractBits(tempLSB, 0, 1)
		// const flagHigh = BitSmush.extractBits(tempLSB, 1, 1)
		// const flagCrit = BitSmush.extractBits(tempLSB, 2, 1)

		const temperature = BitSmush.extractBits(tempLSB, 7, 5)

		return temperature
	}

	static parseSetpointHigh(source: I2CBufferSource) {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		return view.getUint16(0)
	}

	static parseSetpointLow(source: I2CBufferSource) {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		return view.getUint16(0)
	}

	static parseSetpointCritical(source: I2CBufferSource) {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		return view.getUint16(0)
	}

	static parseSetpointHysteria(source: I2CBufferSource) {
		const view = ArrayBuffer.isView(source) ?
			new DataView(source.buffer, source.byteOffset, source.byteLength) :
			new DataView(source)

		return view.getUint8(0)
	}

	static fromConfiguration(config: Configuration) {
		const {
			faultQueue,
			CTPolarity,
			INTPolarity,
			INTCTMode,
			OperationMode,
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
			OperationMode,
			resolution
		])

		const u8 = Uint8Array.from([ configuration ])

		return u8.buffer
	}
}
