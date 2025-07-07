// server.js
const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// MQTT client connection
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com'); // public test broker

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

const CHAT_TOPIC = 'mqtt_chat_app/public';

app.post('/send', (req, res) => {
  const { user, message } = req.body;
  const payload = JSON.stringify({ user, message, timestamp: new Date() });
  mqttClient.publish(CHAT_TOPIC, payload);
  res.send({ success: true });
});

server.listen(3022, () => console.log('Server running on http://localhost:5000'));
