import { logger } from './logger.js';

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  label: string,
  delayMs = 2000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const wait = delayMs * attempt;
        logger.warn(`${label} failed (attempt ${attempt}/${maxRetries}), retrying in ${wait}ms`, {
          error: lastError.message,
        });
        await sleep(wait);
      }
    }
  }

  throw new Error(`${label} failed after ${maxRetries} attempts: ${lastError?.message}`);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
