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
// const mqttClient = mqtt.connect('mqtt://broker.hivemq.com'); // public test broker
const mqttClient = mqtt.connect('mqtt://10.12.0.11')

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});


mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

const CHAT_TOPIC = 'mqtt_chat_app/public';

app.post('/send', (req, res) => {
  const { user, message } = req.body;
  const payload = JSON.stringify({ user, message, timestamp: new Date() });
  mqttClient.publish(CHAT_TOPIC, payload);
  console.log(`publishing new topic: ${CHAT_TOPIC} with payload: ${payload?.toString()}`)
  res.send({ success: true });
});

// SearchngoApp req for machine-status
app.get("/machine-status", (req, res) => {
  const { umid, mac_id } = req?.query;
  mqttClient.publish(`/${umid}/${mac_id}/machine_status`);
});

// ESP Response with machine status
app.post('/machine-status', (req, res) => {
  console.log(req.body);
  // passing machine status through Expo Token
});

// SearchngoApp req for start-wash
app.post('/start-wash', (req, res) => {
  const userId = 'abcd', mode = 1, umid = 'A100', macId = 'bc:dd:c2:55:3b:23', packageId = 'somepackage';
  mqttClient.publish(`/${umid}/${macId}/start_wash`, { userId, mode, packageId });
})

// Esp Respond with Wash Start Status
app.post('/wash-start-response', ( req, res )=> {
  console.log(req.body)
})

app.get('/test-esp', (req, res) => {
  const { msg } = req.query;
  mqttClient.publish('/esp_test/public', msg);
})

server.listen(3022, () => console.log('Server running on http://10.12.0.11:3022'));

