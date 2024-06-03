import { I2CAddressedBus } from '@johntalton/and-other-delights'
import { Common } from './common.js'
import { Configuration, TemperatureStatus } from './types.js'

export class ADT7410 {
  #bus
	static from(bus: I2CAddressedBus) { return new ADT7410(bus) }
	constructor(bus: I2CAddressedBus) { this.#bus = bus }

	get name() { return this.#bus.name }

	async reset() { return Common.reset(this.#bus) }

	async getId() { return Common.getId(this.#bus) }
	async getStatus() { return Common.getStatus(this.#bus) }

	async getConfiguration() { return Common.getConfiguration(this.#bus) }
	async setConfiguration(config: Configuration) { return Common.setConfiguration(this.#bus, config) }

	async getSetPointHigh() { return Common.getSetPointHigh(this.#bus) }
	async getSetPointLow() { return Common.getSetPointLow(this.#bus) }
	async getSetPointCritical() { return Common.getSetPointCritical(this.#bus) }
	async getSetPointHysteria() { return Common.getSetPointHysteria(this.#bus) }

	async setSetPointHigh(value: number) { return Common.setSetPointHigh(this.#bus, value) }
	async setSetPointLow(value: number) { return Common.setSetPointLow(this.#bus, value) }
	async setSetPointCritical(value: number) { return Common.setSetPointCritical(this.#bus, value) }
	async setSetPointHysteria(value: number) { return Common.setSetPointHysteria(this.#bus, value) }

	//
	async getTemperature(mode16: boolean = false): Promise<TemperatureStatus> {
		return Common.getTemperature(this.#bus, mode16)
	}
}
