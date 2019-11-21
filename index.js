const express = require("express"),
  app = express(),
  port = 3000,
  server = require("http").createServer(app),
  io = require("socket.io")(server),
  words = require("./words.json");

app.use("/public", express.static("public"));
app.set("view engine", "pug");

app.get("/", function(req, res) {
  res.render("index", {
    title: "typist royale",
    message: "welcome to typist royale!"
  });
});

server.listen(port, () => console.log(`now listening on port ${port}!`));

// Room
var sockets = [];
var round = Infinity;
var reset = false;
var word = "";
var game = {};
var match = {};
var rounds = 5;
var numPlayers = 0;
var maxPlayersPerRoom = 10;
var rooms = [0000, 0001];
var word = getRandomWord();

function play() {
  // decide game
  var timeRemaining = 5000;
  // get random word ('.word').val(words[Math.floor(Math.random()*words.length)]);
  setTimeout(() => {
    round++;
    play();
  }, timeRemaining);
}
play();

io.on("connection", function(socket) {
  console.log("user connected");
  sockets.push(socket);
  io.emit("new word", word);
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("typed letter", function(data) {
    console.log(data);
    var letter = data.key;
    var cursorIndex = data.cursorIndex;
    var wordLength = data.wordLength;
    //console.log('letter: '+letter)
    if (letter === word[0]) {
      word = word.slice(1);
      io.emit("correct letter");
      //console.log(cursorIndex, wordLength)
      if (cursorIndex === wordLength - 1) {
        word = getRandomWord();
        resetWord();
      }
    } else {
      io.emit("wrong letter");
    }
  });
});

function getRandomWord() {
  var randomWord = words[Math.floor(Math.random() * words.length)];
  return randomWord;
}

/* 
function wordList (n) {
  var words = []
  for (var i = 0; i < n; i++) {
    var word = words[Math.round(Math.random() * words.length)]
    words.push(word)
  }
  return words
}
*/

function resetWord() {
  io.emit("new word", word);
}

io.on("look for room", function() {
  console.log("hello");
  rooms.forEach(function(room) {
    if (room.numPlayers < maxPlayersPerRoom) {
      joinRoom(room);
    } else createNewGameRoom();
  });
});
