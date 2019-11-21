var cursorIndex = 0 // cursor index effects the background color of the Letter To Be Typed !
var wordLength = 0


$(function(){
  var socket = io();
  var FADE_TIME = 150 //ms
  var TYPING_TIMER_LENGTH = 400 //ms
  var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
   '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
   '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
   ];
   var eliminated;

  // Initialize Variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // username input
  var $messages = $('.messages'); // messages area
  var $inputMessage = $('.inputMessage'); // input message

  var $readyPage = $('.ready.page'); // login page
  var $chatPage = $('.chat.page'); // chat page

  // set a username!
  var name
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $inputMessage.focus();

  var socket = io();

  function sendLetter(key) {
    $inputMessage.val('');
    if(key === 'Meta' || key === '') {
      console.log('meta')
    }
    else {
      console.log(key);
      //socket.emit('typed letter', {key:key, cursorIndex:cursorIndex, wordLength:wordLength})
    }
  }

  // keyboard events
  $window.keydown(function(event) {
    //autofocus the current input when a key is typed
    if(!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // when the user hits enter
    if (event.which === 13) {
      return
    }
    // typing & sending letters
    if(!eliminated && document.activeElement === $('.inputMessage')[0]) {
      sendLetter(event.key)
    }
  });
  // click ready button
  $('.buttonReady').click(function() {
      name = $('.nickname').val();
      $readyPage.fadeOut();
      $chatPage.show();
      $readyPage.off('click');
      eliminated = false;
      $('.inputMessage').prop('readonly', false).prop('placeholder','');
      $('.playerUsername').append('hello, '+ name);
      socket.emit("join", {name: name})
    })

  // click events
  // focus input when clicking anyhere on the login page
  $readyPage.click(function () {
    $currentInput.focus();
  });

  // focus input when clicking on the message input's border
  $inputMessage.click(function() {
    $inputMessage.focus();
  });

  // socket events

  // recieve new word
  socket.on('new word', function(data) {
    wordLength = data.length;
    $('.wordItem').text('')
    data = data.split('')
    //console.log(data)
    data.forEach(function(letter, index) {
      $('.wordItem').append('<span class="'+index+'">'+letter+'</span>')
    });
    resetCursor()
    //log(data)
  });

  // typed wrong letter
  socket.on('wrong letter', function(wordLength) {
    var word = $('.wordItem').text()
    //console.log('incorrect! '+word, word[letterIndex])
    //var letterIndex = (word.length - wordLength)
    $('.'+cursorIndex).addClass('red')
    $('.inputMessage').prop('readonly', true).prop('placeholder','You Have Been Eliminated')
    sendLetter('')
    eliminated = true;
  });

  socket.on('correct letter', function() {
    var word = $('.wordItem').text()
    $('.'+(cursorIndex)).addClass('black')
    advanceCursor()
  })
});

function advanceCursor() {
  cursorIndex++
  var removeUnderlineIndex = cursorIndex-1
  $('.'+removeUnderlineIndex).addClass('correctlyTypedLetter')
  $('.'+cursorIndex).addClass('cursorIndex')
}

function resetCursor() {
  cursorIndex = 0;
  $('.'+cursorIndex).addClass('cursorIndex')
}



