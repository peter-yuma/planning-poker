const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let users = {};
let votes = {};
let votesRevealed = false;

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = {
      id: socket.id,
      name: username,
      vote: null
    };
    votes[socket.id] = null;

    io.emit('userUpdate', {
      users: Object.values(users),
      votes: votesRevealed ? votes : null,
      revealed: votesRevealed
    });

    console.log(`${username} joined the room`);
  });

  socket.on('vote', (value) => {
    if (users[socket.id]) {
      users[socket.id].vote = value;
      votes[socket.id] = value;

      io.emit('userUpdate', {
        users: Object.values(users),
        votes: votesRevealed ? votes : null,
        revealed: votesRevealed
      });
    }
  });

  socket.on('revealVotes', () => {
    votesRevealed = true;
    io.emit('userUpdate', {
      users: Object.values(users),
      votes: votes,
      revealed: true
    });
  });

  socket.on('reset', () => {
    Object.keys(users).forEach(id => {
      users[id].vote = null;
      votes[id] = null;
    });
    votesRevealed = false;

    io.emit('userUpdate', {
      users: Object.values(users),
      votes: null,
      revealed: false
    });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      console.log(`${users[socket.id].name} disconnected`);
      delete users[socket.id];
      delete votes[socket.id];

      io.emit('userUpdate', {
        users: Object.values(users),
        votes: votesRevealed ? votes : null,
        revealed: votesRevealed
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Planning Poker server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
