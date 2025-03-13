const redisPubsubService = require('../services/redisPubsub.service');

class ProductTestService {
  purchaseProduct(productId, quantity){
    const order = {
      productId,
      quantity
    }
    redisPubsubService.publish('purchase_event', JSON.stringify(order))
  }
}

module.exports = new ProductTestService();