import { I2CAddressedBus } from '@johntalton/and-other-delights'
import { Common } from './common.js'
import { Configuration, Temperature } from './types.js'

export class ADT7410 {
  #bus

	static from(bus: I2CAddressedBus) {
		return new ADT7410(bus)
	}

	constructor(bus: I2CAddressedBus) { this.#bus = bus }

	get name() { return this.#bus.name }

	async reset() { return Common.reset(this.#bus) }

	async getId() { return Common.getId(this.#bus) }

	async getStatus() { return Common.getStatus(this.#bus) }

	async getConfiguration() { return Common.getConfiguration(this.#bus) }

	async setConfiguration(config: Configuration) { return Common.setConfiguration(this.#bus, config) }

	async getSetpointHigh() { return Common.getSetpointHigh(this.#bus) }
	async getSetpointLow() { return Common.getSetpointLow(this.#bus) }
	async getSetpointCritical() { return Common.getSetpointCritical(this.#bus) }
	async getSetpointHysteria() { return Common.getSetpointHysteria(this.#bus) }

	async getTemperature(): Promise<Temperature> {
		return Common.getTemperature(this.#bus)
	}
}