export type Temperature = number

export type SimpleStatus = {
	low: boolean,
	high: boolean,
	critical: boolean
}

export type Status = SimpleStatus & {
	ready: boolean
}

export type TemperatureStatus = {
	temperatureC: Temperature
} & Partial<Status>

export type ConfigurationBits = {
	faultQueue: number,
	CTPolarity: number,
	INTPolarity: number,
	INTCTMode: number,
	operationMode: number,
	resolution: number
}

export type Configuration = {
	faultQueueLength: number,
	polarityCTActiveHigh: boolean,
	polarityINTActiveHigh: boolean,
	comparison: boolean,
	mode: number
	resolution: 13 | 16
}

export type ID = {
	manufactureId: number,
	revisionId: number
	matchedVendor: boolean
}
