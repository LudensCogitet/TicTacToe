// Converts an angle from degrees to radians. Used when drawing the Os.
function toRadians(angle) {
  return angle * (Math.PI / 180);
}

// Global variables
var UIActive = true;          // Is the dialogue box open on the screen? (If so, don't allow moves on the board.)
var computerPlayer = true;    // Are we playing against the computer?
var p1Mark = "O";             // Which mark is player 1 using?
var p2Mark = "X";             // Which mark is player 2 using?
var p2Move = false;           // Is it the second player's turn?
var timesPlayed = 0;          // How many moves have been made? (We use this to determine when there has been a draw.)

// This is a constructor.
// talkAI displays messages “from” the computer in certain circumstances.
// Those circumstances are determined inside the “this.notice” function,
// which is called elsewhere in the script with the proper parameter when certain events take place.

function talkAI(targetDiv) {
  var state = {
    firstOpponentTwoInARow: false,
    lastMoveTimestamp: 0,
    firstLongMoveDelay: false,
    peanutGallery: ["Nice move.~300~ Definitly in the top 9.",
                    "Are you sure that's the way you want to go?",
                    "Oh, come on, let me play!~300~ I promise I won't beat you unless your play is subpar."]
  };

  // ConsoleWriter displays text to a target Div with a delay effect. See https://codepen.io/LudensCogitet/pen/WRQJQg for details of the consoleWriter object.
  var speechConsole = new consoleWriter(targetDiv);

  this.notice = function(event) {
    switch (event) {
      case "start up":
        speechConsole.clearConsole("Hello, human. Would you like to play a game?", "fast");
        break;
      case "opponent two in a row":
        if (state.firstOpponentTwoInARow == false) {
          speechConsole.stopAndClear("This is futile, you realize.~200~N Winning this game is predicated upon the inattention of one's opponent.~300~ I am literally a Tic-Tac-Toe playing machine.~200~ Nothing gets by me.~500~N Don't feel bad, though.~200~ I lack the capacity to love, innovate, or even perceive my surroundings.~300~N So~200~.~200~.~200~.~500~ you've got that going for you.");
          state.firstOpponentTwoInARow = true;
        }
        break;
      case "play with computer":
        speechConsole.stopAndClear("Great! How about Global Thermonuclear War?~1000~NJust kidding. That wouldn't be any fun, since you'd be dead before you knew I'd won.~500~NTic-Tac-Toe will be fine.", "fast");
        break;
      case "don't play with computer":
        speechConsole.stopAndClear("I see, you brought a friend. Fine. Don't mind me. It's not as though I have feelings.~500~N (I don't.~250~ Really.~250~ I'm a computer.)", "fast");
        break;
      case "choose mark":
        speechConsole.stopAndClear("Ah, good choice.~100~ Although completely lacking in strategic import, " + p1Mark + "s do have a certain aesthetic quality.", "fast");
        break;
      case "computer wins":
        speechConsole.stopAndClear("Haha! I won! Move over Deep Blue and AlphaGo.")
        break;
      case "player moves":
        if (computerPlayer == true) {
          if (state.lastMoveTimestamp == 0) {
            state.lastMoveTimestamp = Date.now();
          } else {
            // If it's been three seconds since the player's last move and we haven't said this before, say it now.
            if (Date.now() - state.lastMoveTimestamp > 3000) {
              if (state.firstLongMoveDelay == false) {
                speechConsole.stopAndClear("Do you know how long that took in computer years?~500~ Several of them. I've had more than one birthday since you last moved.", "fast");
                state.firstLongMoveDelay = true;
              }
            }
            state.lastMoveTimestamp = 0;
          }
        }
        else {
          // If the computer is not playing, there's a 50/50 chance that it will make some kind of comment whenever a player moves.
          // We remove comments once they've been made so that we don't repeat ourselves.
          if(Math.random() < 0.5){
            if(state.peanutGallery.length > 0){
            var index = Math.floor(Math.random()*state.peanutGallery.length);
            var rand = state.peanutGallery.indexOf(index);
            var quip = state.peanutGallery.splice(rand,1)[0];
            speechConsole.write(quip,"fast");
            }
          }
        }
        break;
      case "draw":
        speechConsole.stopAndClear("A draw. Strange game, the sign of mastery is that no one ever wins.");
        break;
    }
  }
}

var talker = new talkAI("#console");

// This is a constructor.
// The graphics object keeps all the drawing routines under a single heading
// and allows us to choose the size of the squares we're drawing on to.
// This object uses the div ids from the grid array (see below) and assumes a div called "indicator",
// which displays which mark is placed next.
function graphics(size = 100){
  this.clearAll = function(){
    for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      document.getElementById(grid[i][j]).getContext("2d").clearRect(0, 0, size, size);
     }
    }
    document.getElementById("indicator").getContext("2d").clearRect(0, 0, size, size);
  };

  this.drawX = function(square, animTime = -1) {
  var context = document.getElementById(square).getContext("2d");

  function fullX() {
    context.clearRect(0, 0, size, size);
    context.beginPath();
    context.lineWidth = 4;
    context.moveTo(20, 20);
    context.lineTo(size -20, size -20);
    context.moveTo(size -20, 20);
    context.lineTo(20, size -20);
    context.stroke();
    context.closePath();
  }

  if (animTime > 0) {
    var halfTime = animTime / 2;
    var targetTime = (Date.now() + halfTime);

    var x = 20;
    var y = 20;

    function loop() {
      var now = Date.now();
      var lineLength = (size-40) - (size-40) / halfTime * (targetTime - now);
      var lineLengthX = lineLength;
      if (x != 20)
        lineLengthX = -lineLength;

      context.clearRect(0, 0, size, size);

      if (x != 20) {
        context.beginPath();
        context.lineWidth = 4;
        context.moveTo(20, 20);
        context.lineTo(size -20, size -20);
        context.stroke();
        context.closePath();
      }

      context.beginPath();
      context.lineWidth = 4;
      context.moveTo(x, y);
      context.lineTo(x + lineLengthX, y + lineLength);
      context.stroke();
      context.closePath();

      if (lineLength >= (size-40) || lineLength <= -(size-40)) {
        if (x == 20) {
          x = size -20;
          targetTime += halfTime;
          lineLength = 0;
          setTimeout(loop, 1);
        } else
          fullX();
      } else
        setTimeout(loop, 1);
    }
    setTimeout(loop, 1);
  } else if (animTime == -1) {
    fullX();
  }
};

this.drawO = function(square, animTime = -1) {
  var context = document.getElementById(square).getContext("2d");

  function fullCircle() {
    context.clearRect(0, 0, size, size);
    context.beginPath();
    context.lineWidth = 4;
    context.arc(size/2, size/2, (size*0.35), 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
  }

  if (animTime > 0) {
    var targetTime = (Date.now() + animTime);

    function loop() {
      var now = Date.now();
      var angle = -(360 / animTime) * (targetTime - now);
      context.clearRect(0, 0, size, size);
      context.beginPath();
      context.lineWidth = 4;
      context.arc(size/2, size/2, (size*0.35), toRadians(270), toRadians(angle + 270));
      context.stroke();
      context.closePath();

      if (targetTime - now <= 0)
        fullCircle();
      else
        setTimeout(loop, 1);
    }
    setTimeout(loop, 1);
  } else if (animTime == -1) {
    fullCircle();
  }
};

this.draw = function(mark, square, animTime = -1) {
  if (mark == "X")
    this.drawX(square, animTime);
  else if (mark == "O")
    this.drawO(square, animTime);
};
}

var graphics = new graphics();

// This object keeps track of the current state of the squares on the board.
// The three possible states are 'O', 'X', and 'empty'.
var squares = {
  "topLeft": "empty",
  "topMid": "empty",
  "topRight": "empty",
  "midLeft": "empty",
  "midMid": "empty",
  "midRight": "empty",
  "botLeft": "empty",
  "botMid": "empty",
  "botRight": "empty"
};

// This array provides a kind of overlay onto the data in 'squares',
// allowing us to iterate over the information in 'squares' as though it were a 3x3 board.
var grid = [
  ["topLeft", "topMid", "topRight"],
  ["midLeft", "midMid", "midRight"],
  ["botLeft", "botMid", "botRight"]
];

function makeMove(player, square) {
  if (player == "X") {
    graphics.drawX(square, 500);
    squares[square] = "X";
    graphics.drawO("indicator");
  } else {
    graphics.drawO(square, 500);
    squares[square] = "O";
    graphics.drawX("indicator");
  }
}

// checkBoard() returns a row, column, or diagonal set of three values from the 'squares' object.
// The type parameter may be either 'row', 'column', or 'diagonal'.
// The number parameter may be 0, 1, or 2 for 'row' or 'column'.
// Only 0 or 1 are valid for 'diagonal'. 0 is top-left to bottom-right diagonal, 1 is the top-right to bottom-left diagonal.
// The return value is an array of three 2 element arrays. Element 0 is the name of the property of 'squares' and element 1 is its value.
function checkBoard(type, number) {
  var set = [];
  if (type == "row") {
    for (var i = 0; i < 3; i++) {
      set.push([grid[number][i], squares[grid[number][i]]]);
    }
  } else if (type == "column") {
    for (var i = 0; i < 3; i++) {
      set.push([grid[i][number], squares[grid[i][number]]]);
    }
  } else if (type == "diagonal") {
    var column;
    var change;
    if (number == 0) {
      column = 0;
      change = 1;
    } else if (number == 1) {
      column = 2;
      change = -1;
    }
    for (var i = 0; i < 3; i++) {
      set.push([grid[i][column], squares[grid[i][column]]]);
      column += change;
    }
  }
  return set;
}

// rotateBoard() moves the values of the grid array as though the game board had been rotated clockwise a given number of times.
// This is used to simulate variation in the AIs first move when the player takes the center position.
// Otherwise the AI would always take the top-left corner.
function rotateBoard(times) {
  for (var i = 0; i < times; i++) {
    var newBoard = [];
    for (var d = 0; d < 3; d++) {
      var set = checkBoard("column", d);
      var newRow = [];
      for (var j = 2; j > -1; j--) {
        newRow.push(set[j][0]);
      }
      newBoard.push(newRow);
    }
    grid = newBoard;
  }
}

// findOnBoard() is used by the AI to search for a particular configuration within the rows, columns and diagonals of the board.
// Valid what parameters are 'X', 'O', and 'empty'.
// howMany may be 1, 2, or 3.
// excluding is an optional parameter that tells the function to only return a result if a row, column, or diagonal includes what * howMany
// while also EXCLUDING the mark passed in.
// noMoreThan tells the function how many of the excluding marks may appear in a valid return set. This can be 0,
// meaning that no instance of the excluding mark may appear.
// For example: findOnBoard('X',2,'O',0) means "find a row, column, or diagonal with 2 Xs and 0 Os in it",
// meaning, of course, 2 Xs in a row with an empty space.
function findOnBoard(what, howMany, excluding = "", noMoreThan = 0) {
  var types = ["row", "column", "diagonal"];

  for (var i = 0; i < 3; i++) {
    for (var d = 0; d < 3; d++) {
      var whatCount = 0;
      var excludeCount = 0;

      var set = checkBoard(types[i], d);
      if (set == null)
        continue;

      for (var j = 0; j < set.length; j++) {
        if (set[j][1] == what)
          whatCount++;
        else if (set[j][1] == excluding)
          excludeCount++;
      }
      if (whatCount == howMany && excludeCount <= noMoreThan) {

        return set;
      }
    }
  }
  return null;
}

// Checks whether any endgame conditions have been reached. Those conditions are:
// Either player has 3 of their marks on the board, or
// 9 moves have been made, meaning a draw has occurred.
function checkEndGame() {
  var endGame = findOnBoard(p2Mark, 3);
  if (endGame == null)
    endGame = findOnBoard(p1Mark, 3);

  if (endGame != null || timesPlayed >= 9) {
    if (endGame != null) {
      for (var i = 0; i < endGame.length; i++) {
        $("#" + endGame[i][0]).parent().addClass("red");
      }
    } else {
      talker.notice("draw");
    }

    UIActive = true;
    $("#UI").show();
    $("#screen3").children().show();
    return true;
  }
  return false;
}

var firstMove = true;

// This rather messy function is the core of the computer opponent.
// It evaluates a series of findOnBoard() calls, only moving on to the next if the former does not return a result.
// The order is:
// Two of the computer player's marks
// Two of the human player's marks
// The middle square is empty
// One of the computer player's marks
// 3 empty squares
// 2 empty squares
// 1 empty square
function moveAI() {
  function checkEmpty(val) {
    return val[1] == "empty";
  }

    timesPlayed++;
    if (firstMove == true) {
      rotateBoard(Math.floor(Math.random() * 3));
      firstMove = false;
    }
    var looking = findOnBoard(p2Mark, 2, p1Mark, 0);

    if (looking != null) {
      talker.notice("computer wins");
      makeMove(p2Mark, looking.find(checkEmpty)[0]);
    } else {
      looking = findOnBoard(p1Mark, 2, p2Mark, 0);
      if (looking != null) {
        talker.notice("opponent two in a row");
        makeMove(p2Mark, looking.find(checkEmpty)[0]);
      } else {
        if (squares["midMid"] == "empty") {
          makeMove(p2Mark, "midMid");
        } else {
          looking = findOnBoard(p2Mark, 1, p1Mark, 0);

          if (looking != null) {
            looking.reverse();
            makeMove(p2Mark, looking.find(checkEmpty)[0]);
          } else {
            looking = findOnBoard("empty", 3);

            if (looking != null) {
              makeMove(p2Mark, looking.find(checkEmpty)[0]);
            } else {
              looking = findOnBoard("empty", 2);

              if (looking != null) {
                makeMove(p2Mark, looking.find(checkEmpty)[0]);
              } else {
                looking = findOnBoard("empty", 1);

                if (looking != null) {
                  makeMove(p2Mark, looking.find(checkEmpty)[0]);
                }
              }
            }
          }
        }
      }
    }

  checkEndGame();
  p2Move = false;
}

// This clears everything, graphically and logically, and prepares for a new game.
function reset() {
  graphics.clearAll();
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      $("#" + grid[i][j]).parent().removeClass("red");
      squares[grid[i][j]] = "empty";
      p2Move = false;
    }
  }
  timesPlayed = 0;
  $("#screen3").children().hide();
  $("#screen1").children().show();
  talker.notice("start up");
}

$(document).ready(function() {
  talker.notice("start up");

  // Set up event listeners for the dialogue box buttons.
  // screen1 links to screen2 links to screen2_1.
  // screen3 only appears when the game is over and then links to screen1 through reset().
  $(".UIButton.screenBtn1").click(function() {
    var value = $(this).html();
    if (value == "YES") {
      computerPlayer = true;
      talker.notice("play with computer");
    } else if (value == "NO") {
      computerPlayer = false;
      talker.notice("don't play with computer");
    }
    $("#screen1").children().hide();
    $("#screen2").children().show();
  });

  $(".UIButton.screenBtn2").click(function() {
    var value = $(this).html();
    if (value == "X") {
      p1Mark = "X";
      p2Mark = "O"
    } else if (value == "O") {
      p1Mark = "O";
      p2Mark = "X";
    }
    talker.notice("choose mark");
    $("#screen2").children().hide();
    $("#screen2_1").children().show();
  });

  $(".UIButton.screenBtn2_1").click(function() {
    var value = $(this).html();
    if (value == "player 1") {
      p2Move = false;
      graphics.draw(p1Mark, "indicator");
    } else if (value == "player 2") {
      p2Move = true;
      graphics.draw(p2Mark, "indicator");
      if (computerPlayer == true)
        setTimeout(moveAI, 500);
    }
    $("#screen2_1").children().hide();
    $("#UI").hide();
    UIActive = false;
  });

  $(".UIButton.screenBtn3").click(function() {
    reset();
    UIActive = true;
  });

  $(".canvas").click(function() {
    if (UIActive == false) {
      if (squares[this.id] == "empty") {
        talker.notice("player moves");
        if (p2Move == false) {
          makeMove(p1Mark, this.id);
          p2Move = true;
          timesPlayed++;
          if (computerPlayer == true) {
            setTimeout(moveAI, 500);
          } else {
            checkEndGame();
          }
        } else if (computerPlayer == false) {
          makeMove(p2Mark, this.id);
          p2Move = false;
          timesPlayed++;
          checkEndGame();
        }
      }
    }
  });
});
