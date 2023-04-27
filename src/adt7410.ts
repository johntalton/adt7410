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

	async setSetpointHigh(value: number) { return Common.setSetpointHigh(this.#bus, value) }
	async setSetpointLow(value: number) { return Common.setSetpointLow(this.#bus, value) }
	async setSetpointCritical(value: number) { return Common.setSetpointCritical(this.#bus, value) }
	async setSetpointHysteria(value: number) { return Common.setSetpointHysteria(this.#bus, value) }


	async getTemperature(): Promise<Temperature> {
		return Common.getTemperature(this.#bus)
	}
}
