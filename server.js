const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const users = {};

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('login')
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId)
    users[socket.id] = userName
    socket.to(roomId).broadcast.emit('user-connected', userId, userName);

    // messages
    socket.on('send-chat-message', (message) => {
      //send message to the same room
      //io.to(roomId).emit('createMessage', message)
      socket.broadcast.emit('chat-message', {message: message, userName: users[socket.id]} )
    });
    //bug, cannot find it
    socket.on('send-love-message', () => {
      //console.log("server: love-message")
      socket.broadcast.emit('love-message', users[socket.id] )
    }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId, users[socket.id])
      delete users[socket.id]
    })
  })
})

server.listen(process.env.PORT||3000)