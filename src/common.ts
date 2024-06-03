import { I2CAddressedBus } from '@johntalton/and-other-delights'

import { Configuration, ID, Status, Temperature, TemperatureStatus } from './types.js'
import { REGISTER } from './defs.js'
import { Converter } from './converter.js'

const BYTE_LENGTH_ONE = 1
const BYTE_LENGTH_TWO = 2

export class Common {
	static async reset(bus: I2CAddressedBus) {
		return bus.i2cWrite(Uint8Array.from([ REGISTER.RESET ]))
	}

	static async getId(bus: I2CAddressedBus): Promise<ID> {
		const buffer = await bus.readI2cBlock(REGISTER.ID, BYTE_LENGTH_ONE)
		return Converter.decodeId(buffer)
	}

	static async getStatus(bus: I2CAddressedBus): Promise<Status> {
		const buffer = await bus.readI2cBlock(REGISTER.STATUS, BYTE_LENGTH_ONE)
		return Converter.decodeStatus(buffer)
	}

	static async getConfiguration(bus: I2CAddressedBus): Promise<Configuration> {
		const buffer = await bus.readI2cBlock(REGISTER.CONFIGURATION, BYTE_LENGTH_ONE)
		return Converter.decodeConfiguration(buffer)
	}

	static async setConfiguration(bus: I2CAddressedBus, config: Configuration): Promise<void> {
		const buffer = Converter.encodeConfiguration(config)
		return bus.writeI2cBlock(REGISTER.CONFIGURATION, buffer)
	}

	static async getSetPointHigh(bus: I2CAddressedBus): Promise<Temperature> {
		const buffer = await bus.readI2cBlock(REGISTER.T_HIGH_MSB, BYTE_LENGTH_TWO)
		return Converter.decodeSetPointHigh(buffer)
	}

	static async getSetPointLow(bus: I2CAddressedBus): Promise<Temperature> {
		const buffer = await bus.readI2cBlock(REGISTER.T_LOW_MSB, BYTE_LENGTH_TWO)
		return Converter.decodeSetPointLow(buffer)
	}

	static async getSetPointCritical(bus: I2CAddressedBus): Promise<Temperature> {
		const buffer = await bus.readI2cBlock(REGISTER.T_CRIT_MSB, BYTE_LENGTH_TWO)
		return Converter.decodeSetPointCritical(buffer)
	}

	static async getSetPointHysteria(bus: I2CAddressedBus): Promise<Temperature> {
		const buffer = await bus.readI2cBlock(REGISTER.T_HYST, BYTE_LENGTH_ONE)
		return Converter.decodeSetPointHysteria(buffer)
	}

	static async setSetPointHigh(bus: I2CAddressedBus, high: Temperature): Promise<void> {
		const buffer = Converter.encodeTemperature(high)
		return bus.writeI2cBlock(REGISTER.T_HIGH_MSB, buffer)
	}

	static async setSetPointLow(bus: I2CAddressedBus, low: Temperature): Promise<void> {
		const buffer = Converter.encodeTemperature(low)
		return bus.writeI2cBlock(REGISTER.T_LOW_MSB, buffer)
	}

	static async setSetPointCritical(bus: I2CAddressedBus, critical: Temperature): Promise<void> {
		const buffer = Converter.encodeTemperature(critical)
		return bus.writeI2cBlock(REGISTER.T_CRIT_MSB, buffer)
	}

	static async setSetPointHysteria(bus: I2CAddressedBus, hysteria: number): Promise<void> {
		const buffer = Converter.encodeSetPointHysteria(hysteria)
		return bus.writeI2cBlock(REGISTER.T_HYST, buffer)
	}

	static async getTemperature(bus: I2CAddressedBus, mode16: boolean): Promise<TemperatureStatus> {
		const buffer = await bus.readI2cBlock(REGISTER.TEMPERATURE_MSB, BYTE_LENGTH_TWO)
		return Converter.decodeTemperature(buffer, mode16)
  }
}
