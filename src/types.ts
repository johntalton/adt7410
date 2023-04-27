import { I2CBufferSource } from "@johntalton/and-other-delights"

export type Temperature = number

export type Configuration = {
  faultQueue: number,
  CTPolarity: number,
  INTPolarity: number,
  INTCTMode: number,
  OperationMode: number,
  resolution: number
}
export type ID = {
  manufactureId: number,
  revisionId: number
  matchedVendor: boolean
}

export type Status = {
  low: boolean,
  high: boolean,
  critical: boolean,
  ready: boolean
}

export type ParseCB<T> = (source: I2CBufferSource) => T
