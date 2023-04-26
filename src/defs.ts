export const MANUFACTURE_ID = 0b11001

export const REGISTER = {
  TEMPERATURE_MSB: 0x00, // Temperature value most significant byte 0x00
  TEMPERATURE_LSB: 0x01, // Temperature value least significant byte 0x00
  STATUS: 0x02, // Status 0x00
  CONFIGURATION: 0x03, // Configuration 0x00
  T_HIGH_MSB: 0x04, // THIGH setpoint most significant byte 0x20 (64°C)
  T_HIGH_LSB: 0x05, // THIGH setpoint least significant byte 0x00 (64°C)
  T_LOW_MSB: 0x06, // TLOW setpoint most significant byte 0x05 (10°C)
  T_LOW_LSB: 0x07, // TLOW setpoint least significant byte 0x00 (10°C)
  T_CRIT_MSB: 0x08, // TCRIT setpoint most significant byte 0x49 (147°C)
  T_CRIT_LSB: 0x09, // TCRIT setpoint least significant byte 0x80 (147°C)
  T_HYST: 0x0A, // THYST setpoint 0x05 (5°C)
  ID: 0x0B, // ID 0xCX
  // NAME: 0x0C, // Reserved 0xXX
  // NAME: 0x0D, // Reserved 0xXX
  // NAME: 0x2E, // Reserved 0xXX
  RESET: 0x2F // Software reset 0xXX
}

export const OPERATION_MODE = {
  CONTINUOUS: 0b00,
  ONE_SHOT: 0b01,
  ONE_SPS: 0b10,
  SHUTDOWN: 0b11
}

export const RESOLUTION = {
  THIRTEEN: 0, // 0.0625°C
  SIXTEEN: 1 // 0.0078°C
}