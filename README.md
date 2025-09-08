# ADT 7410

[![npm Version](http://img.shields.io/npm/v/@johntalton/adt7410.svg)](https://www.npmjs.com/package/@johntalton/adt7410)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/adt7410)
![CI](https://github.com/johntalton/adt7410/workflows/CI/badge.svg)

Analog devices Temperature sensor with High / Low / Critical set points and interrupt lines.

## Operational Modes

The configuration of the ADT7410 allows for four distinct operational modes.

- Continuous:
- One Shot:
- 1 SPS:
- Shutdown:

Temperature configuration can set the device to 13-bit or 16-bit conversion mode.

A Low / High / Critical Alarm (set points) enable triggering of interrupts once configured.
