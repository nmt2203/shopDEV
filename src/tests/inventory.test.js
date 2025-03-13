const redisPubsubService = require("../services/redisPubsub.service");

class InventoryTestService {
  constructor() {
    redisPubsubService.subscribe('purchase_event', (message) => {
      console.log("----------message: ", message);
      InventoryTestService.updateInventory(message);
    })
  }

  static updateInventory(productId, quantity) {
    console.log(12113131);
  }
}

module.exports = InventoryTestService;