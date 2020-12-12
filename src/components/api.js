import openSocket from 'socket.io-client';
const  socket = openSocket( 'https://jkudatingchat.herokuapp.com');

function subscribeToNewMessage(cb) {
  socket.on('new message', msg => cb(null, msg));
  //socket.emit('subscribeToTimer', 1000);
}

function login(username,counterpart) {
    socket.emit("add user", username, counterpart);
}

function sendNewMessage(msg) {
    socket.emit("new message", msg)
}

export { subscribeToNewMessage, sendNewMessage, login };