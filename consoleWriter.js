// This is a constructor.
// The consoleWriter object targets a div to be written to and keeps a queue of current messages to be written
// (first in, first out).
// This is the object that a user will interact with.
function consoleWriter(targetDiv, numMessagesToSave = 3) {
  var messagesWritten = 0;
  var queue = [];
  var timeoutID = null;

  // This is a constructor.
  // the writer object is internal to the consoleWriter and is never touched by the user.
  // It is essentially a wrapper for the write() function, which is a wrapper for a loop() function called using
  // setTimeout().
  // The purpose of this wrapper is so that these objects can be stored in consoleWriter's queue for later activation.
  function writer(text, speed, callback = null) {
    var wait = false;
    this.write = function() {
     if(messagesWritten > numMessagesToSave){
                  clearConsole();
      }
      var waitUntil = -1;
      var textArr = text.split("");
      var i = 0;

      if (speed == "slow")
        speed = 100;
      else
        speed = 60;

      function loop() {
        if (wait == true) {
          if (Date.now() >= waitUntil && waitUntil != -1) {
            wait = false;
            waitUntil = -1;
            timeoutID = setTimeout(loop, 1);
          } else {
            timeoutID = setTimeout(loop, 1);
          }
        } else if (textArr[i] == '~') {
          var comString = text.slice(i + 1);
          var endOfCom = comString.indexOf('~');
          comString = comString.slice(0, endOfCom);
          i += comString.length + 2;

          if (textArr[i] == "N") {
            i++;
            $("#console").append("<p>");
          }

          wait = true;
          waitUntil = Date.now() + parseInt(comString);
          timeoutID = setTimeout(loop, 1);
        } else {
          $("#console").append(textArr[i])
          i++;
          if (i < textArr.length)
           timeoutID = setTimeout(loop, speed)
          else {
            $("#console").append("<p>");
              if(queue.length > 1) {
                queue[1].write();
              }
              queue.shift();
            if (callback != null){
              callback();
            }
          }
        }
      }
      timeoutID = setTimeout(loop, speed);
    }
  }

  function write(text, speed, callback = null){
    queue.push(new writer(text,speed,callback));
    messagesWritten++;
    if(queue.length == 1){
      queue[0].write();
    }
  }

  this.write = write;

  function clearConsole(text = null, speed = "fast", callback = null) {
    $(targetDiv).html("");
    messagesWritten = 0;
    if(text != null)
      {
        write(text,speed);
      }
    if (callback != null)
      callback();
  }

  this.clearConsole = clearConsole;

  this.stopAndClear = function(text = null, speed = "fast", callback = null){
    clearTimeout(timeoutID);
    timeoutID = 0;
    queue = [];
    messagesWritten = 0;

    clearConsole(text,speed,callback);
  }
}
