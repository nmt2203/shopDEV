const amqp = require('amqplib');

const runConsumer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel();

    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true
    })

    //send message
    channel.consume(queueName, (message) => {
      console.log(`received message: ${message.content.toString()}`);
    }, {
      noAck: true
    })

  } catch (error) {
    console.log("error: ", error);
    
  }
}

runConsumer().catch(console.error)