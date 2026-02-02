const EPOCH = 1420070400000n; // Discord epoch

const WORKER_ID_BITS = 5n;
const SEQUENCE_BITS = 12n;

const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;

const WORKER_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

export class SnowflakeGenerator {
  private lastTimestamp = 0n;
  private sequence = 0n;

  constructor(private readonly workerId: bigint) {
    if (workerId < 0n || workerId > MAX_WORKER_ID) {
      throw new Error("workerId fora do range permitido");
    }
  }

  private now(): bigint {
    return BigInt(Date.now());
  }

  private waitNextMillisecond(): bigint {
    let timestamp = this.now();
    while (timestamp <= this.lastTimestamp) {
      timestamp = this.now();
    }
    return timestamp;
  }

  generate(): string {
    let timestamp = this.now();

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillisecond();
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - EPOCH) << TIMESTAMP_SHIFT) |
      (this.workerId << WORKER_ID_SHIFT) |
      this.sequence
    ).toString();
  }
}


const WORKER_ID = BigInt(process.env.WORKER_ID ?? 0);

const generator = new SnowflakeGenerator(WORKER_ID);

export function generateSnowflakeId(): string {
  return generator.generate();
}
