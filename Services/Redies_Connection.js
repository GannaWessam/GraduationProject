const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL });
    this.client.on('error', (err) => console.error('Redis Error:', err));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
      console.log('Connected to Redis');
    }
  }
  

  async set(key, value, expiryInSeconds = null) {
    if (expiryInSeconds) {
      await this.client.setEx(key, expiryInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key) {
    const res=await this.client.get(key);
    if (res) return res;
    else return null;
  }

  async del(key) {
    const res = await this.client.get(key);
    if(res){
      await this.client.del(key)
      return true
    }
    else return false
    
  }

  async disconnect() {
    await this.client.quit();
  }
}

module.exports = RedisService;
