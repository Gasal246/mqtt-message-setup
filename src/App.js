import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const mqttUrl = 'wss://broker.hivemq.com:8884/mqtt'; // MQTT over WebSocket
const topic = 'mqtt_chat_app/public';

function App() {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 100));

  useEffect(() => {
    const mqttClient = mqtt.connect(mqttUrl);
    setClient(mqttClient);

    mqttClient.on('connect', () => {
      mqttClient.subscribe(topic, (err) => {
        if (!err) console.log('Subscribed to topic:', topic);
      });
    });

    mqttClient.on('message', (t, message) => {
      if (t === topic) {
        const msg = JSON.parse(message.toString());
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    fetch('http://localhost:3022/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, message: msgInput, time: new Date().toLocaleTimeString() }),
    });
    setMsgInput('');
  };

  return (
    <div style={styles.container}>
      <h2>MQTT Chat App</h2>
      <div style={styles.username}>Logged in as: <strong>{username}</strong></div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => {
          const isSelf = msg.user === username;
          return (
            <div
              key={i}
              style={{
                ...styles.messageWrapper,
                justifyContent: isSelf ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  backgroundColor: isSelf ? '#007bff' : '#e4e6eb',
                  color: isSelf ? '#fff' : '#000',
                  textAlign: isSelf ? 'right' : 'left',
                }}
              >
                <div style={styles.msgUser}>{msg.user}</div>
                <div>{msg.message}</div>
                <div style={styles.msgTime}>{msg.time || ''}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.inputSection}>
        <input
          type="text"
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: 'sans-serif',
    maxWidth: 600,
    margin: '0 auto',
  },
  username: {
    marginBottom: 10,
    fontSize: 16,
  },
  chatBox: {
    maxHeight: 400,
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: '#f9f9f9',
  },
  messageWrapper: {
    display: 'flex',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
  },
  msgUser: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.6,
  },
  inputSection: {
    marginTop: 15,
    display: 'flex',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
  },
  button: {
    padding: '10px 20px',
    marginLeft: 10,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

export default App;
