const key = require('./key')

// Express
const express = require('express')
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json());

// Postgres
const { Pool } = require('pg')
const pgClient = new Pool({
    user: key.pgUser,
    host: key.pgHost,
    database: key.pgDatabase,
    password: key.pgPassword,
    port: key.pgPort
})
pgClient.on('error', () => console.log('Error'))
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err))

// Redis
const redis = require('redis')
const redisClient = redis.createClient({
    host: key.redisHost,
    port: key.redisPort,
    retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate();

// Express Routes
app.get('/', (req, res) => {
    res.send('Server OK')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values')
    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        res.status(422).send('Index should be less than 40')
    }

    redisClient.hset('values', index, 'no values yet')
    redisPublisher.publish('insert', index)

    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
    res.send({ working: true})
})

app.listen(5000, err => {
    console.log('server starts....')
})



