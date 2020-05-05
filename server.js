const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Chance = require("chance");
const dictionary = require("./words.json");

// CONSTANTS

const PORT = 3000;
const MAXPLAYERS = 100;
const DELTA = 500;
const chance = new Chance();

// STATE

const lobbies = [];

// ASSETS

app.use("/", express.static(path.join(__dirname, "./public")));

server.listen(PORT, () => console.log(`listening on ${PORT}!`));

// USER CONNECTIONS

io.on("connection", socket => {
  // subscribe to messages

  // join a server
  socket.on("join", message => {
    // are there lobbies available?
    let available = lobbies.filter(lobby => {
      return lobby.players.length < MAXPLAYERS - 1 && lobby.started === false;
    });

    if (available.length === 0) {
      // create a lobby
      let lobby = {
        id: lobbies.length + 1,
        players: [],
        eliminated: 0,
        wordList: wordList(50),
        lobbyCountdown: 30000, // go longer if rooms are too small
        roundTimer: 0,
        wordTime: 10000,
        started: false
      };

      lobbies.push(lobby);
      available.push(lobby);
    }

    // join a lobby
    let lobby = available[0];

    let player = {
      name: message.name,
      current: 0, // current word index
      lobbyId: lobby.id,
      eliminated: false
    };

    lobby.players.push(player);
    player.id = lobby.players.length - 1;

    // join lobby socket room
    socket.join(lobby.id, () => {
      io.to(lobby.id).emit('update', lobby);
    });
  });

  // player failed
  socket.on("fail", player => {
    lobbies[player.lobbyId].eliminated++;
    lobbies[player.lobbyId].players[player.id].eliminated = true;
  });

  // player next
  socket.on("next", player => {
    lobbies[player.lobbyId].players[player.id].current++;
  });

  socket.on("disconnect", socket => {
    //lobby.players.splice(player.id, 1);
    console.log("player disconnected");
  });
});

// lobby LOOP

setInterval(() => {
  for (let lobby of lobbies) {
    // update lobby
    if (lobby.players.length >= MAXPLAYERS || lobby.lobbyCountdown <= 0) {
      // start lobby
      if (lobby.started === false) {
        lobby.started = true;

        io.to(lobby.id).emit("start", lobby);
      }

      lobby.roundTimer += DELTA;

      if (lobby.eliminated >= lobby.players.length - 1) {
        // lobby over
      } else {
        // update players

        for (let player of lobby.players) {
          // update player
        }
      }
    } else {
      lobby.lobbyCountdown -= DELTA;
    }

    io.to(lobby.id).emit('update', lobby);
  }
}, DELTA);

// UTILITY

function wordList(n) {
  let words = [];
  for (let i = 0; i < n; i++) {
    words.push(
      dictionary[chance.integer({ min: 0, max: dictionary.length - 1 })]
    );
  }
  return words;
}
