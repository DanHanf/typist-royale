const words = require("words.json");
const express = require("express");
const app = express();
const port = 3000;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const games = [];

// CONSTANTS

const MAXPLAYERS = 100;
const DELTA = 200;

// ASSETS

app.use("/public", express.static("public"));
app.set("view engine", "pug");
app.get("/", function(req, res) {
  res.render("index", {
    title: "typist royale",
    message: "welcome to typist royale!"
  });
});
server.listen(port, () => console.log(`now listening on port ${port}!`));

// USER CONNECTIONS

io.on("connection", socket => {
  // are there games available?
  var available = games.filter(game => {
    return game.players.length < MAXPLAYERS - 1;
  });

  if (available.length === 0) {
    // create a game
    var game = {
      players: [],
      eliminated: 0,
      wordList: wordList(500),
      lobbyCountdown: 30000, // go longer if rooms are too small
      gameTimer: 0,
      wordTime: 10000
    };

    games.push(game);
    available.push(game);
  }

  // join a game
  var game = available[0];

  var player = {
    name: message.name,
    current: 0
  };

  game.players.push(player);
  player.id = game.players.length - 1;

  // subscribe to messages

  socket.on("disconnect", socket => {
    game.players.splice(player.id, 1);
  });

  socket.on("word", message => {});
});

// GAME LOOP

setInterval(() => {
  for (let game of games) {
    // update game

    if (game.players.length >= MAXPLAYERS || game.lobbyCountdown <= 0) {
      game.gameTimer += DELTA;

      if (game.eliminated >= game.players.length - 1) {
        // game over
      } else {
        // update players

        for (let player of game.players) {
        }
      }
    } else {
      game.lobbyCountdown -= DELTA;
    }
  }
}, DELTA);

// UTILITY

function wordList(n) {
  var words = [];
  for (var i = 0; i < n; i++) {
    words.push(chance.word());
  }
  return words;
}