var cursorIndex = 0; // cursor index effects the background color of the Letter To Be Typed !
var wordLength = 0;

$(function() {
  var socket = io();
  var FADE_TIME = 150; //ms
  var TYPING_TIMER_LENGTH = 400; //ms
  var COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7"
  ];
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
    name = $(".nickname").val();
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
});
