import Redis from 'ioredis';

let _client: Redis | null = null;
let _connectionFailed = false;

function getRedisUrl(): string | null {
  if (process.env.SCALINGO_REDIS_URL) {
    return process.env.SCALINGO_REDIS_URL;
  }
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return null;
}

function createClient(): Redis | null {
  const url = getRedisUrl();

  if (!url) {
    console.warn('[Redis] No REDIS_URL or SCALINGO_REDIS_URL configured');
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.error('[Redis] Max retries reached, giving up');
        _connectionFailed = true;
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      return targetErrors.some((e) => err.message.includes(e));
    },
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
    _connectionFailed = true;
  });

  client.on('connect', () => {
    _connectionFailed = false;
  });

  client.on('ready', () => {
    _connectionFailed = false;
  });

  return client;
}

export function getRedisClient(): Redis | null {
  if (_connectionFailed) {
    return null;
  }

  if (!_client) {
    _client = createClient();
  }

  return _client;
}

export function isRedisConfigured(): boolean {
  return getRedisUrl() !== null;
}

export function isRedisAvailable(): boolean {
  return _client !== null && !_connectionFailed && _client.status === 'ready';
}

export async function closeRedis(): Promise<void> {
  if (_client) {
    await _client.quit();
    _client = null;
    _connectionFailed = false;
  }
}

export const redisClient = new Proxy({} as Redis, {
  get(_, prop) {
    const client = getRedisClient();
    if (!client) {
      if (prop === 'then') return undefined;
      throw new Error('Redis client not available');
    }
    const value = client[prop as keyof Redis];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
