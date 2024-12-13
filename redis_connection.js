// שירות האחראי על יצירת וניהול החיבור של צד הלקוח עם הרדיס

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

// יצירת חיבור עם הרדיס
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


// הגדרת נקודת קצה השולפת את המידע מהרדיס ומנגישה אותו ללקוח בדף הגרף
app.get('/data', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'];
        const jdata = await client.get(userIp+"#random");
        const data = await JSON.parse(jdata);
        const arrdata= await client.get(userIp+"#dataarr");
        const jarrdata= await JSON.parse(arrdata);
        res.json({ data, jarrdata });
    } catch (err) {
        console.error('Error fetching from Redis:', err);
        res.status(500).send('Server error');
    }
});

// הגדרת נקודת קצה השולפת את המידע מהרדיס ומנגישה אותו ללקוח בדף המפה
app.get('/datamap', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'];
        const jdata = await client.get(userIp+"#maprandom");
        const data = await JSON.parse(jdata);
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