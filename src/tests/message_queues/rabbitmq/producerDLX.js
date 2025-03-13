const amqp = require('amqplib');
const message = 'new a product:: title accc';

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel();

    const notificationExchange = 'notificationExchange'; //noti thuoc loai direct
    const notiQueue = 'notificationQueueProcess'; //assertQueue
    const notificationExchangeDLX = 'notificationExchangeDLX'; //noti thuoc loai direct
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'; //assertQueue

    //1. create exchange
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true //server khoi dong lai thi van con mss
    });

    //2.create queue
    const queueResult = await channel.assertQueue(notiQueue,{
      exclusive: false, // = false: cho phep cac ket noi khac truy cap vao cung 1 luc hang doi
      deadLetterExchange: notificationExchangeDLX, // neu bi loi thi đẩy đi sang queue khác
      deadLetterRoutingKey: notificationRoutingKeyDLX
    })

    //3.bind queue
    // những message dc publish của notificationExchange sẽ dc định tuyến đến notiQueue; 
    // deadLetterExchange đến deadLetterRoutingKey
    
    await channel.bindQueue(queueResult.queue, notificationExchange);

    //4.send message
    const msg = 'send a notification::: new PRODUCT';
    console.log(`producer message: ${msg}`);
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '10000' //mini giay
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log("error: ", error);
    
  }
}

runProducer().catch(console.error)