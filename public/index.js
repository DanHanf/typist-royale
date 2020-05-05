$(function() {
  var socket = io();

  var eliminated;

  // Initialize Variables
  var $window = $(window);
  var $usernameInput = $(".usernameInput"); // username input
  var $messages = $(".messages"); // messages area
  var $inputMessage = $(".inputMessage"); // input message

  var $readyPage = $(".ready.page"); // login page
  var $chatPage = $(".chat.page"); // chat page

  // set a username!
  var $currentInput = $inputMessage.focus();

  var socket = io();

  // click ready button
  $(".buttonReady").click(function() {
    name = $(".username").val();
    $readyPage.fadeOut();
    $chatPage.show();
    $readyPage.off("click");
    eliminated = false;
    $(".inputMessage")
      .prop("readonly", false)
      .prop("placeholder", "");
    $(".playerUsername").append("hello, " + name);
    socket.emit("join", { name: name });
  });

  socket.on('update', (lobby) => {

  })
});

/*
- Client is listening for lobby updates from server
- the Main Thing to be updated related to the lobby.players[]
- So, our next thing to work on is updating the client with player list updates 
*/
