import retry from './retry';

describe('retry utility', () => {
  it('should succeed on first attempt without retrying', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await retry(mockFn, { retries: 3 });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry failed attempts and eventually succeed', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('Recovered');

    const onFailedAttempt = jest.fn();

    const promise = retry(mockFn, {
      retries: 3,
      onFailedAttempt,
      delay: 100,
    });

    const result = await promise;

    expect(result).toBe('Recovered');
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(onFailedAttempt).toHaveBeenCalledTimes(2);
  });

  it('should throw error after exceeding retries', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
    const onFailedAttempt = jest.fn();

    const promise = retry(mockFn, {
      retries: 2,
      onFailedAttempt,
      delay: 100,
    });

    await expect(promise).rejects.toThrow('Always fails');
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(onFailedAttempt).toHaveBeenCalledTimes(2);
  });
});
