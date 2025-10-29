import redisClient from "../redis"


export function getOrSetRedisCache(
  key: string,
  cb: () => Promise<any>,
  ttl = 3600, // default TTL of 1 hour
  wantToUseRedis: boolean = true,
): Promise<any> {
  if (!wantToUseRedis) {
    return cb()
  }

  return new Promise(async (resolve, reject) => {
    try {
      const cachedData = await redisClient.get(key)
      console.log('🚀 ~ getOrSetRedisCache ~ cachedData:', cachedData)
      if (cachedData) {
        return resolve(JSON.parse(cachedData))
      }

      const freshData = await cb()
      await redisClient.setex(key, ttl, JSON.stringify(freshData))
      resolve(freshData)
    } catch (error) {
      reject(error)
    }
  })
}
