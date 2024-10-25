import { createClient } from 'redis';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let userIp;

fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        userIp = data.ip;
    })
    .catch(error => {
        console.error("Error fetching IP address:", error);
    });

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
(async () => {
    await client.connect();
    console.log('Connected to Redis');
})();



app.get('/data', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'] || req.ip;
        console.log('Client IP:', userIp);
        const keys = await client.keys(`*${userIp}#random*`);
        console.log(jdata);
        const data = await Promise.all(jdata.map(item => JSON.parse(item)[0]));
        console.log(data);
        const arrdata= await client.get(userIp+"#dataarr");
        console.log(arrdata);
        const jarrdata= await JSON.parse(arrdata);
        console.log(jarrdata);
        res.json({ data, jarrdata });
    } catch (err) {
        console.error('Error fetching from Redis:', err);
        res.status(500).send('Server error');
    }
});

app.get('/datamap', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'] || req.ip;
        console.log('Client IP:', userIp);
        const keys = await client.keys(`*${userIp}#maprandom*`);
        const jdata = await Promise.all(keys.map((id) => client.get(id)));
        const data = await Promise.all(jdata.map(item => JSON.parse(item)[0]));
        const arrdata= await client.get(userIp+"#dataarrmap");
        const jarrdata= await JSON.parse(arrdata);
        res.json({ data,jarrdata });
    } catch (err) {
        console.error('Error fetching from Redis:', err);
        res.status(500).send('Server error');
    }
});

const PORT = 6379;
app.listen(PORT, () => {
    console.log(`redis running on port ${PORT}`);
});
export default app; 
