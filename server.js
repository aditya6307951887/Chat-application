const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userleave, getRoomUsers } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'CharCord Bot';
//run when client connects
io.on('connection', socket => {

     socket.on('joinroom', ({ username, room }) => {
          const user = userJoin(socket.id, username, room);
          socket.join(user.room);
          //welcome current user

          socket.emit('message', formatMessage(botName, 'welcome to chatcord!'));
          //broadcast when userr connect
          socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined a chat`));


          //send users and info
          io.to(user.room).emit('roomusers',{
               room:user.room,
               users:getRoomUsers(user.room)
          });
     })


     //listen for chat message
     socket.on('chatMessage', msg => {
          const user = getCurrentUser(socket.id);
          io.to(user.room).emit('message', formatMessage(user.username, msg));
     });
     //runs when client disconnects
     socket.on('disconnect', () => {

          const user = userleave(socket.id);
          console.log(user);
          if (user) {
               io.to(users.room).emit('message', formatMessage(botName, `${user.username}a user has left the chat`));

               
          //send users and info again when they dissconnect
          io.to(user.room).emit('roomusers',{
               room:user.room,
               users:getRoomUsers(user.room)
          });
          }
     })
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));