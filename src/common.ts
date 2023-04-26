import { I2CAddressedBus } from '@johntalton/and-other-delights'
import { BitSmush } from '@johntalton/bitsmush'

import { Configuration, ID, Status, Temperature } from './types.js'
import { MANUFACTURE_ID, REGISTER } from './defs.js'

export class Common {
	static async reset(bus: I2CAddressedBus) {
		return bus.i2cWrite(Uint8Array.from([ REGISTER.RESET ]))
	}

	static async getId(bus: I2CAddressedBus): Promise<ID> {
		const ab = await bus.readI2cBlock(REGISTER.ID, 1)
		const view = new DataView(ab)

		const id = view.getUint8(0)

		const manufactureId = BitSmush.extractBits(id, 7, 5)
		const revisionId = BitSmush.extractBits(id, 2, 3)

		return {
			manufactureId,
			revisionId,
			matchedVendor: manufactureId === MANUFACTURE_ID
		}
	}

	static async getStatus(bus: I2CAddressedBus): Promise<Status> {
		const ab = await bus.readI2cBlock(REGISTER.STATUS, 1)
		const view = new DataView(ab)

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

	static async getConfiguration(bus: I2CAddressedBus): Promise<Configuration> {
		const ab = await bus.readI2cBlock(REGISTER.CONFIGURATION, 1)
		const view = new DataView(ab)

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

	static async setConfiguration(bus: I2CAddressedBus, config: Configuration): Promise<void> {
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

		const source = Uint8Array.from([ configuration ])
		return bus.writeI2cBlock(REGISTER.CONFIGURATION, source)
	}

	static async getSetpointHigh(bus: I2CAddressedBus): Promise<Temperature> {
		const ab = await bus.readI2cBlock(REGISTER.T_HIGH_MSB, 2)
		const view = new DataView(ab)
		return view.getUint16(0)
	}

	static async getSetpointLow(bus: I2CAddressedBus): Promise<Temperature> {
		const ab = await bus.readI2cBlock(REGISTER.T_LOW_MSB, 2)
		const view = new DataView(ab)
		return view.getUint16(0)
	}

	static async getSetpointCritical(bus: I2CAddressedBus): Promise<Temperature> {
		const ab = await bus.readI2cBlock(REGISTER.T_CRIT_MSB, 2)
		const view = new DataView(ab)
		return view.getUint16(0)
	}

	static async getSetpointHysteria(bus: I2CAddressedBus): Promise<Temperature> {
		const ab = await bus.readI2cBlock(REGISTER.T_HYST, 1)
		const view = new DataView(ab)
		return view.getUint8(0)
	}


	static async getTemperature(bus: I2CAddressedBus): Promise<Temperature> {
		const ab = await bus.readI2cBlock(REGISTER.TEMPERATURE_MSB, 2)
		const view = new DataView(ab)

		// const tempMSB = view.getUint8(0)
		const tempLSB = view.getUint8(1)

		// const sign = BitSmush.extractBits(tempMSB, 7, 1)

		// const flagLow = BitSmush.extractBits(tempLSB, 0, 1)
		// const flagHigh = BitSmush.extractBits(tempLSB, 1, 1)
		// const flagCrit = BitSmush.extractBits(tempLSB, 2, 1)

		const temperature = BitSmush.extractBits(tempLSB, 7, 5)

		return temperature
  }
}
