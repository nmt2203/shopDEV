'use strict';
const { createClient } = require('redis');
const { reservationInventory } = require('../models/repositories/inventory.repo');

// Tạo Redis client
const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Kết nối Redis
(async () => {
  await redisClient.connect();
})();

// Hàm lấy Lock
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // Thời gian chờ lấy lock

  for (let i = 0; i < retryTimes; i++) {
    // Tạo key, thằng nào giữ key được thì vào thanh toán
    const result = await redisClient.setNX(key, expireTime); // setNX tích hợp sẵn trong Redis 4.x+
    console.log("result: ", result);

    if (result) {
      // Thao tác với inventory
      const isReservation = await reservationInventory({ productId, quantity, cartId });
      if (isReservation.modifiedCount) {
        // Update thành công, thiết lập TTL cho key
        await redisClient.pExpire(key, expireTime); // pExpire tích hợp sẵn
        return key;
      }
      return null;
    } else {
      // Chờ 50ms rồi thử lại
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  // Hết retry mà không lấy được lock
  return null;
};

// Hàm giải phóng Lock
const releaseLock = async (lockKey) => {
  return await redisClient.del(lockKey); // del tích hợp sẵn
};

module.exports = { acquireLock, releaseLock };