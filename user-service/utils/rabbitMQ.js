const amqp = require('amqplib')

const EXCHANGE_NAME = "campaign_exchange";
const ROUTING_KEY = "campaign_email";
const QUEUE_NAME = "campaign_email";

module.exports.producer = async (emailData) => {
    try{
        const connection = await amqp.connect(process.env.RABBITMQ_URL)
        const channel = await connection.createChannel()
    
        await channel.assertExchange(EXCHANGE_NAME, 'direct', {durable:true})
        await channel.assertQueue(QUEUE_NAME, {durable:true})
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY)
    
        channel.publish(
            EXCHANGE_NAME,
            ROUTING_KEY,
            Buffer.from(JSON.stringify(emailData)),
            { persistent: true}
        )
    
    // console.log('Email job queued: ', emailData.to)
    // console.log("Publishing:", { exchange: EXCHANGE_NAME, queue: QUEUE_NAME, routingKey: ROUTING_KEY, email: emailData.to })

        await channel.close()
        await connection.close()

    }catch(err){
        throw new Error(`Error in producer: ${err.message}`)
    }
}

module.exports.consumer = async (sendMail) => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL)
    const channel  = await connection.createChannel()

    await channel.assertExchange(EXCHANGE_NAME, 'direct', {durable:true})
    await channel.assertQueue(QUEUE_NAME,{durable:true})
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY)
    channel.prefetch(5)
    console.log('Waiting for messages from queue: ', QUEUE_NAME)

    channel.consume(
        QUEUE_NAME,
        async (msg) => {
            if(!msg) return

            try{
                const data = JSON.parse(msg.content.toString())
                console.log(data, 'data from consumer')
                await sendMail(data)
                channel.ack(msg)
            }catch(err){
                console.log(err, 'cosumer error ', err.message)
                channel.nack(msg, false, false)
            }
        }
    )
    console.log("Consumer configuration:", { exchange: EXCHANGE_NAME, queue: QUEUE_NAME, routingKey: ROUTING_KEY })

}