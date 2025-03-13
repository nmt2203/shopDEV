const amqp = require('amqplib');
const message = 'new a product:: title accc';

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel();

    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true
    })

    //send message
    channel.sendToQueue(queueName, Buffer.from(message))
    console.log(`[x] Sent '${message}'`)

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log("error: ", error);
    
  }
}

runProducer().catch(console.error)