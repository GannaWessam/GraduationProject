const WebSocket = require('ws');
const chattingService = require('./chattingService');
class WebSocketService {
  constructor() {
    this.onlineUsers = new Set();
    this.websocketServer = new WebSocket.Server({ port: 2000 });
    this.init();
  }
  init() {
    this.websocketServer.on('connection', (ws) => {
      console.log('Client connected');
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'register' && data.userId) {
            ws.userId = data.userId;
            this.onlineUsers.add(data.userId);
            console.log(this.onlineUsers);
            await chattingService.syncMessagesAfterOffline(data.userId);
            const result=await chattingService.getUsersWithCommonConversations(data.userId)
            this.notifySpecificClients({
              type:"online",
              receiverIds:result,
            },data.userId)
            console.log(`User ${data.userId} registered and now online`);
          }
        } catch (err) {
          console.error('Invalid message received:', message);
        }
      });

      
      ws.on('close', async() => {
        if (ws.userId) {
          this.onlineUsers.delete(ws.userId);
          const result=await chattingService.getUsersWithCommonConversations(ws.userId)
          this.notifySpecificClients({
            type:"offline",
            receiverIds:result,
          },ws.userId)
          console.log(`User ${ws.userId} disconnected`);
        }
      });
    });
    console.log('WebSocket server is running on ws://localhost:2000');
  }
  async notifyClients(data , identifier) {
    const message={data, id: identifier }
    this.websocketServer.clients.forEach(client => { //clints = kol elnas elly bt listen
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(message));//bttb3t ka string
        } catch (err) {
          console.error("Error sending to client:", err);
        }
      }
    });
  }
  async notifySpecificClients(data , conversationId) {
    const { receiverIds } = data;
    const message = { data, id: conversationId };
  
    this.websocketServer.clients.forEach(client => {
      try{  
        if (client.readyState === WebSocket.OPEN && receiverIds?.includes(client.userId)) {
          client.send(JSON.stringify(message));
        }
      } catch (err) {
        console.error("Error sending to client:", err);
      }
    });
    return true;
  }
}


module.exports = new WebSocketService();
