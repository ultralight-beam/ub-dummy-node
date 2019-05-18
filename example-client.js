const WebSocket = require('ws');

const ws = new WebSocket('ws://172.20.5.112:8000', {
  perMessageDeflate: false
});

ws.on('open', function open() {
  console.log('[WS_CLIENT] SENDING :: sending..')
  ws.send('I am client - Greg');
});

ws.on('message', function incoming(data) {
  console.log('[WS_CLIENT] RECEIVED :: ', data.toString('utf8'));
});
