# ADT 7410

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