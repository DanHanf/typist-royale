const dictionary = require("./words.json");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Chance = require("chance");

// CONSTANTS

const PORT = 3000;
const MAXPLAYERS = 100;
const DELTA = 200;
const chance = new Chance();

// STATE

const games = [];

// ASSETS

app.use("/public", express.static("public"));
app.set("view engine", "pug");
app.get("/", function(req, res) {
  res.render("index", {
    title: "typist royale",
    message: "welcome to typist royale!"
  });
});
server.listen(PORT, () => console.log(`now listening on port ${PORT}!`));

// USER CONNECTIONS

io.on("connection", socket => {
  // subscribe to messages

  // join a server
  socket.on("join", message => {
    // are there games available?
    let available = games.filter(game => {
      return game.players.length < MAXPLAYERS - 1 && game.started === false;
    });

    if (available.length === 0) {
      // create a game
      let game = {
        id: games.length + 1,
        players: [],
        eliminated: 0,
        wordList: wordList(50),
        lobbyCountdown: 30000, // go longer if rooms are too small
        gameTimer: 0,
        wordTime: 10000,
        started: false
      };

      games.push(game);
      available.push(game);
    }

    // join a game
    let game = available[0];

    let player = {
      name: message.name,
      current: 0, // current word index
      gameId: game.id,
      eliminated: false
    };

    game.players.push(player);
    player.id = game.players.length - 1;

    // join game socket room
    socket.join(game.id, () => {
      io.to(game.id).emit(game);
    });
  });

  // player failed
  socket.on("fail", player => {
    games[player.gameId].eliminated++;
    games[player.gameId].players[player.id].eliminated = true;
  });

  // player next
  socket.on("next", player => {
    games[player.gameId].players[player.id].current++;
  });

  socket.on("disconnect", socket => {
    //game.players.splice(player.id, 1);
    console.log("player disconnected");
  });
});

// GAME LOOP

setInterval(() => {
  for (let game of games) {
    // update game
    if (game.players.length >= MAXPLAYERS || game.lobbyCountdown <= 0) {
      // start game
      if (game.started === false) {
        game.started = true;

        io.to(game.id).emit("start", game);
      }

      game.gameTimer += DELTA;

      if (game.eliminated >= game.players.length - 1) {
        // game over
      } else {
        // update players

        for (let player of game.players) {
          // update player
        }
      }
    } else {
      game.lobbyCountdown -= DELTA;
    }

    io.to(game.id).emit(game);
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
