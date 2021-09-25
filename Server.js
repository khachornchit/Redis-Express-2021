const express = require('express')
const path = require('path')
const dotenv = require("dotenv")
const fetch = require('node-fetch')
const redis = require('redis')
const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379
const client = redis.createClient(REDIS_PORT)
const app = express()

dotenv.config()
app.use(express.json())

async function getRepository(req, res, next) {
    try {
        console.log('Fetching data...')
        const {username} = req.params
        const response = await fetch(`https://api.github.com/users/${username}`)
        const data = await response.json(response)
        const repos = data.public_repos
        client.setex(username, 3600, repos)
        res.send(setResponse(username, repos))
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

const setResponse = (username, repos) => {
    return `<h2>Github >> ${username} has ${repos} repositories!</h2>`
}

// Cache middleware
const cache = (req, res, next) => {
    const {username} = req.params;
    client.get(username, (err, data) => {
        if (err) throw err;

        if (data !== null) {
            res.send(setResponse(username, data))
        } else {
            next()
        }
    })
}

app.get('/repository/:username', cache, getRepository)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/api1', async (req, res) => {

    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    // const requests = await redis.incr(ip)
    // console.log(`Number of request made so far ${requests}`)

    return res.json({
        response: 'Ok1',
        callsInAMinute: 0
    })
})

app.post('/api2', async (req, res) => {
    return res.json({
        response: 'Ok2',
        callsInAMinute: 0
    })
})

app.post('/api3', async (req, res) => {
    return res.json({
        response: 'Ok3',
        callsInAMinute: 0
    })
})

app.listen(PORT, console.log(`Server start ${PORT} && redis ${REDIS_PORT}`))
