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
const num_room_guests = {}

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
    //recording username with userid
    users[socket.id] = userName
    //count room guests
    if(num_room_guests[roomId] === undefined){
      num_room_guests[roomId] = 1
    }else{
      num_room_guests[roomId] = num_room_guests[roomId] + 1
    }

    socket.on('veritfy-hostOguest',()=>{
      socket.to(roomId).broadcast.emit('show-video', num_room_guests[roomId])
      console.log("show-video")
    })
    
    //connnecting with other user's video
    socket.to(roomId).broadcast.emit('user-connected', userId, userName);
  
    // messages
    socket.on('send-chat-message', (message) => {
      //send message to the same room
      //io.to(roomId).emit('createMessage', message)
      //socket.broadcast.emit('chat-message', {message: message, userName: users[socket.id]} )
      socket.to(roomId).broadcast.emit('chat-message', message, users[socket.id])
    });
  
    socket.on('send-love-message', () => {
      socket.to(roomId).broadcast.emit('love-message', users[socket.id] )
    }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId, users[socket.id])
      delete users[socket.id]
      if(num_room_guests[roomId] === 1){
        delete num_room_guests[roomId]
      }else{
        num_room_guests[roomId] = num_room_guests[roomId] - 1
      }
    })
  })
})

server.listen(process.env.PORT||3000)