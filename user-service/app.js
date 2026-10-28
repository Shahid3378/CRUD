require("dotenv").config()

const express = require('express')
const { rateLimit } = require('express-rate-limit')
const session = require('express-session')
const { RedisStore } = require('connect-redis')

const userRouters = require("./src/routes/userRoute")
const templateRouters = require("./src/routes/templateRoutes")
const sendMailRoutes = require("./src/routes/sendMailRoutes")

const resdisClient = require("./connections/redisConnection")
const { dbConnection_1, dbConnection_2 } = require("./connections/DBConnection")

// dbConnection()

const app = express()
const PORT = 3000

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});

// Apply the rate limiting middleware globally
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 10000
}))

app.use(session({
    store: new RedisStore({
        client:resdisClient
    }),
    secret: "mySecretKey",
    resave:false,
    saveUninitialized: false,
}))

app.post('/', (req, res) => {
    res.json({
        message : "Hello World"
    })
})

app.use('/', userRouters)
app.use('/', templateRouters)
app.use('/', sendMailRoutes)

// app.use('/', userRouters, templateRouters, sendMailRoutes)
async function startSever(){
    try{
        const [db1, db2] = await Promise.all([
            await dbConnection_1(),
            await dbConnection_2()
        ])
        console.log('Monogo db connected')

        app.listen(PORT, () => {
            console.log(`Server is running on port : ${PORT}`)
        })

    }catch(error){
        console.log(`User service startup failed:`, error.message)
    }
}

startSever()

module.exports = app