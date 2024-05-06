# ADT 7410

[![npm Version](http://img.shields.io/npm/v/@johntalton/adt7410.svg)](https://www.npmjs.com/package/@johntalton/adt7410)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/adt7410)
![CI](https://github.com/johntalton/adt7410/workflows/CI/badge.svg)
![GitHub](https://img.shields.io/github/license/johntalton/adt7410)
[![Downloads Per Month](http://img.shields.io/npm/dm/@johntalton/adt7410.svg)](https://www.npmjs.com/package/@johntalton/adt7410)
![GitHub last commit](https://img.shields.io/github/last-commit/johntalton/adt7410)

Analog devices Temperature sensor with High / Low / Critical setpoints and interrupt lines.

## Operational Modes

The configuration of the ADT7410 allows for four distinct operational modes.

- Continuous:
- One Shot:
- 1 SPS:
- Shutdown:

## Notes

### Note: Bulk reads

While some sensors can support a fuller `getProfile` (returning `id` / `status` / `configuration`, `setpoint`(s)) this convenience function is not practical to include as it implies multiple bus interactions (a single transaction) which must be managed by the caller.

This is due to the adt7410 not supporting muti-byte block reads.

### Note: Fast reads

While bulk reads are not supported, 16bit reads and 8/16bit poll-reads are supported. Thus, once the register is selected, reads can call simpler / faster reads.  Potentially allowing for faster temperature data access.
