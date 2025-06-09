/**
 * Retry options.
 *
 * @param retries - Number of retry attempts.
 * @param onFailedAttempt - Retry failed callback fn.
 * @param delay - Initial delay in ms (default: 500).
 * @param factor - Backoff factor (default: 2).
 */
interface RetryOptions {
  retries: number;
  onFailedAttempt?: (error: Error, attempt: number, retriesLeft: number) => Promise<void>;
  delay?: number;
  factor?: number;
}

/**
 * Retry a function with exponential backoff.
 *
 * @param fn - The async function to retry.
 * @param options - The retry options.
 */
export default async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, onFailedAttempt, delay = 500, factor = 2 } = options;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const retriesLeft = retries - attempt;

      if (attempt > retries) {
        throw error;
      }

      console.log({ error: error.message, attempt, retriesLeft }, 'Retrying');

      if (onFailedAttempt) {
        await onFailedAttempt(error as Error, attempt, retriesLeft);
      }

      if (delay > 0) {
        const backoff = delay * Math.pow(factor, attempt);
        await new Promise((resolve) => {
          setTimeout(resolve, backoff);
        });
      }
    }
  }

  throw new Error('Exhausted all retries');
}
