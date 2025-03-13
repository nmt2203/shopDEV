const Redis = require('redis');

class RedisPubsubService {
  constructor() {
    this.subscriber = Redis.createClient();
    this.publisher = Redis.createClient();

    // Handle connection errors
    this.subscriber.on('error', (err) => console.error('Subscriber Error:', err));
    this.publisher.on('error', (err) => console.error('Publisher Error:', err));

    // Connect clients
    this.subscriber.connect().catch((err) => console.error('Failed to connect subscriber:', err));
    this.publisher.connect().catch((err) => console.error('Failed to connect publisher:', err));
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if(err) {
          reject(err);
        }else {
          resolve(reply);
        }
      })
    })
  }
  subscribe(channel, callback) {
    this.subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error('Subscribe Error:', err);
      }
    });
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(message); // Pass the actual message
      }
    });
  }
}
module.exports = new RedisPubsubService();