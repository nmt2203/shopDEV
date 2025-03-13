'use strict';
const amqp = require('amqplib');

async  function consumerOrderedMessage() {
  const connection = await amqp.connect('amqp://guest:12345@localhost')
  const channel = await connection.createChannel();

  const queueName = 'ordered-queued-message';
  await channel.assertQueue(queueName, {
    durable: true
  })

  //Set prefetch: mỗi tác vụ chỉ thực hiện 1 cái tại 1 thời điểm => đảm bảo xử lý ms lần lượt
  channel.prefetch(1);

  channel.consume(queueName, (msg) => {
    const message = msg.content.toString()

    setTimeout(() => {
      console.log('processed', message);
      channel.ack(msg);
    }, Math.random() * 1000);
  })
}

consumerOrderedMessage().catch(console.error);