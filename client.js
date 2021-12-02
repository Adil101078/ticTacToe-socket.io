const io = require('socket.io-client');
const PORT = 5050
const socket = io(`http://127.0.0.1:${PORT}`);
const readCommand = require('readcommand');
const {log} = require('./helper')


  socket.on('connect', () => {
      log.success('connected to 127.0.0.1:5050')
      const id = socket.id;
      socket.emit('newUser', id);

    socket.on('isFirstUser', (count) => {
      if (count === 1) {
        log.info('You are player1. Wait for player2 to join.');
      } else if (count === 2) {
        log.info('You are player2. Let\'s begin the game.');
        socket.emit('startGame');
      } else {
        log.error('Sorry the room is full!');
      }
    });

    socket.on('gameOn', (msg) => {
      log.warn(msg);
    });
    

    socket.on('move', (currentId) => {
      if (currentId === id) {
        log.info('Please enter 1 to 9 to play: ');
        readCommand.read((err, args) => {
          socket.emit('play', args[0]);
         
        });
      } 
       else {
        log.warn('Waiting for another player\'s move!')
      }
    });

    socket.on('board', board => log.info(board));
    socket.on('gameboard', gameBoard => log.info(gameBoard));
    socket.on('invalid', () =>{ log.error('That was an invalid option!')});
    socket.on('usedspace', () => {log.error('Space already in use. Try again!')});
    socket.on('playerLeft', ()=>{
      
        log.win(`Your opponent has left the game...You won!!!`)
        return
      
    })
     socket.on('endgame', (name) => {
      if (name) {
        log.win(`Game won by ${name}`);
               
      }
       else {
         log.warn('game tied')
      }
    })
   
  });

  socket.on('disconnect', () => {
    log.error('You are disconnected from server!');
    socket.removeAllListeners('disconnect');

  });

