import { I2CAddressedBus } from '@johntalton/and-other-delights'

import { Configuration, ID, ParseCB, Status, Temperature } from './types.js'
import { REGISTER } from './defs.js'
import { Converter } from './converter.js'

async function get<T>(bus: I2CAddressedBus, reg: number, length: number, parse: ParseCB<T>) {
	const ab = await bus.readI2cBlock(reg, length)
	return parse(ab)
}

export class Common {
	static async reset(bus: I2CAddressedBus) {
		return bus.i2cWrite(Uint8Array.from([ REGISTER.RESET ]))
	}

	static async getId(bus: I2CAddressedBus): Promise<ID> {
		return get(bus, REGISTER.ID, 1, Converter.parseId)
	}

	static async getStatus(bus: I2CAddressedBus): Promise<Status> {
		return get(bus,REGISTER.STATUS, 1, Converter.parseStatus)
	}

	static async getConfiguration(bus: I2CAddressedBus): Promise<Configuration> {
		return get(bus, REGISTER.CONFIGURATION, 1, Converter.parseConfiguration)
	}

	static async setConfiguration(bus: I2CAddressedBus, config: Configuration): Promise<void> {
		const source = Converter.fromConfiguration(config)
		return bus.writeI2cBlock(REGISTER.CONFIGURATION, source)
	}

	static async getSetpointHigh(bus: I2CAddressedBus): Promise<Temperature> {
		return get(bus, REGISTER.T_HIGH_MSB, 2, Converter.parseSetpointHigh)
	}

	static async getSetpointLow(bus: I2CAddressedBus): Promise<Temperature> {
		return get(bus, REGISTER.T_LOW_MSB, 2, Converter.parseSetpointLow)
	}

	static async getSetpointCritical(bus: I2CAddressedBus): Promise<Temperature> {
		return get(bus, REGISTER.T_CRIT_MSB, 2, Converter.parseSetpointCritical)
	}

	static async getSetpointHysteria(bus: I2CAddressedBus): Promise<Temperature> {
		return get(bus, REGISTER.T_HYST, 1, Converter.parseSetpointHysteria)
	}

	static async getTemperature(bus: I2CAddressedBus): Promise<Temperature> {
		return get(bus, REGISTER.TEMPERATURE_MSB, 2, Converter.parseTemperature)
  }
}
