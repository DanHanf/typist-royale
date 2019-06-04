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

  // Initialize Variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // username input
  var $messages = $('.messages'); // messages area
  var $inputMessage = $('.inputMessage'); // input message

  var $readyPage = $('.ready.page'); // login page
  var $chatPage = $('.chat.page'); // chat page

  // set a username!
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $inputMessage.focus();

  var socket = io();

  function addParticipantsMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
      message += 'there is 1 participant';
    }
    else {
      message += 'there are ' + data.numUsers + ' participants';
    }
    log(message);
  }

  // log message
  function log (message, options) {
    console.log(message)
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  function sendLetter(key) {
    key = cleanInput($inputMessage.val());
    $inputMessage.val('');
    //console.log('key = '+key)
    if(key === 'Meta' || key === '') {
      console.log('meta')
      //return
    }
    else {
      console.log(key);
      socket.emit('typed letter', {key:key, cursorIndex:cursorIndex, wordLength:wordLength})
    }
  }

  // adds visual chat message to message list

  // adds a message element to the message and scrolls to the bottom
  // el - the element to add as a message
  // options.fade - if an element should fade in (default true)
  // options.prepend - if the element should prepend all other messages (default false)
  function addMessageElement(el, options) {
    var $el = $(el);
    console.log($el)
    if (!options) {
      options = {};
    }
    if(typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if(typeof options.prepend === 'undefined') {
      options.prepend = false;
    }
    if(options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if(options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // prevents input from having injected markup
  function cleanInput(input) {
    return $('<div/>').text(input).text();
  }

  // updates typing event
  function updateTyping() {
    if (connected) {
      if(!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();
      setTimeout(function() {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
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
    sendLetter(event.key)
  });
  // click ready button
  $('.buttonReady').click(function() {
      //console.log('click')
      $readyPage.fadeOut();
      $chatPage.show();
      $readyPage.off('click');
      //socket.emit('look for room')
    })

  $inputMessage.on('input', function() {
    updateTyping();
  });

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

  // reviece new word
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



