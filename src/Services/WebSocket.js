const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = new WebSocket.Server({ port: 2000 });
    this.init();
  }
  init() {
    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      this.ws = ws;
      ws.on('close', () => {
        console.log('Client disconnected');
        this.ws = null;
      });
    });
    console.log('WebSocket server is running on ws://localhost:2000');
  }
  async notifyClients(data , identifier) {
    const message={data, id: identifier }
    this.wss.clients.forEach(client => { //clints = kol elnas elly bt listen
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(message));//bttb3t ka string
        } catch (err) {
          console.error("Error sending to client:", err);
        }
      }
    });
  }
  // ws.addEventListener('message', event => {
  //   try {
  //     const receivedData = JSON.parse(event.data); //htstlm el string trg3o json
  //     console.log('Received JSON:', receivedData);
  //   } catch (error) {
  //     console.error('Error parsing JSON:', error);
  //     console.log('Received data was:', event.data);
  //   }
  // });
}
module.exports = new WebSocketService();
