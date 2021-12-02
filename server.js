const app = require('express')();
const { log } = require('./helper');
const server	  = require('http').createServer(app);
const io	  = require('socket.io')(server,{ cors:{ origin:'*'}});
const PORT	  = 5050

server.listen(PORT, ()=>{
	log.success(`Server started at 127.0.0.1:${PORT}`)
});

let players = [];
let activePlayer;
let winner;
let endGame = false;
const board = `
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |
`;
const startGameMsg = `
---------------------------
   Game has been started!
-----------Rules------------
You can use 1 to 9 to select your position.
----------------------------${board}----------------------------
`;
let game = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

//method to place symbol when a player enter any number between 1 to 9
const drawGameBoard = () => `
| ${game[0]} | ${game[1]} | ${game[2]} |
| ${game[3]} | ${game[4]} | ${game[5]} |
| ${game[6]} | ${game[7]} | ${game[8]} |
`;

//method to turn moves
const switchPlayer = () => 
 activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];

//method to assign symbol to the player
const placeSymbol = () =>
 activePlayer === players[0] ? 'x' : 'o';

//method to check when the game should ends
const checkGame = () => {
  const finish = game.filter(x => x === 'x' || x === 'o');
  if (finish.length === 9) {
    endGame = true;
  }
}

//method to check winning conditions
const checkValue = (x, y, z) => {
  if (x === 'x' && y === 'x' && z === 'x') {
    return true;
  }
  if (x === 'o' && y === 'o' && z === 'o') {
    return true;
  }
};

//method to check winning status
const gameStatus = () => {
  if (checkValue(game[0], game[4], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[0], game[3], game[6])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[0], game[1], game[2])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[1], game[4], game[7])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[2], game[4], game[6])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[2], game[5], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[3], game[4], game[5])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[6], game[7], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  }
};


//when a new player connected to the server
io.on('connection', (socket) => {
	log.info(`Player connected with ID: ${socket.id}`)
	socket.on('newUser', (id) => {

    //assign player1 or player2 according to join
    players.push({ name: `player${io.engine.clientsCount}`, id })
  });

  socket.emit('isFirstUser', io.engine.clientsCount);

  //game starts after successful connection between 2 players
  socket.on('startGame', (name) => {
    activePlayer = players[0];
    io.emit('gameOn', startGameMsg);
    io.emit('gameOn', `${players[0].name} move first!`);
    io.emit('gameStart', true);
    io.emit('move', activePlayer.id);
  });

  //if player enters 'r' in console then exit the server
  socket.on('play', (move) => {
  	if (move === 'r') {
		socket.broadcast.emit('playerLeft',{msg: 'player left'})
    io.emit('disconnect')
    players = [];
    game = [];
		return
	}
	
   //method to check valid move
    let no = Math.floor(parseInt(move, 10));
    if (no > 0 && no < 10) {
      if (game[no - 1] !== 'x' && game[no - 1] !== 'o') {
        game[no - 1] = placeSymbol();
        checkGame();
        gameStatus();

        //if a player wins or game ended
        if (endGame) {
          const board = drawGameBoard();
          io.emit('gameboard', board);
          io.emit('endgame', winner);
          io.emit('disconnect');
          players = [];
          game = [];
        } else {
          switchPlayer();
          const board = drawGameBoard();
          io.emit('gameboard', board);
          io.emit('move', activePlayer.id);
        }
      } else {
        socket.emit('usedspace');
        const board = drawGameBoard();
        socket.emit('gameboard', board);
        socket.emit('move', activePlayer.id);
        return;
      }
    } else {
      socket.emit('invalid');
      io.emit('move', activePlayer.id);
      return;
    }
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected!')
  });
});
