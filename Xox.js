  
      const sp = document.getElementById("single");
      const mp = document.getElementById("multi");
      const board = document.querySelector(".board");
      const cells = document.querySelectorAll(".cell");
      const status = document.querySelector(".status");
      const resetbtn = document.querySelector(".reset");
      const mode = document.getElementById('mode');
      const container = document.querySelector('.container');

      mode.addEventListener('click', change);
      sp.addEventListener('click', singlePlayerMode);
      mp.addEventListener('click', multiPlayerMode);

      let currentPlayer = 'X';
      let gameState = ['', '', '', '', '', '', '', '', ''];
      let gameActive = true;
      let singlePlayer = false;
      const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      cells.forEach(cell => cell.addEventListener('click', cellClick));
      resetbtn.addEventListener('click', resetGame);

      function change() {
        container.classList.toggle('light-mode');
      }

      function singlePlayerMode() {
        singlePlayer = true;
        resetGame();
        status.innerText = "Player X's turn";
      }

      function multiPlayerMode() {
        singlePlayer = false;
        resetGame();
        status.innerText = "Player X's turn";
      }

      function cellClick(event) {
        const clickedCell = event.target;
        const ind = parseInt(clickedCell.getAttribute('ind'));

        if (gameState[ind] !== '' || !gameActive || (singlePlayer && currentPlayer === 'O')) return;

        update(clickedCell, ind, currentPlayer);
        result();

        if (gameActive) {
          currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
          status.innerText = `Player ${currentPlayer}'s turn`;

          if (singlePlayer && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
          }
        }
      }

      function update(cell, i, player) {
        gameState[i] = player;
        cell.textContent = player;
        cell.classList.add(player);
      }

      function result() {
        let roundWon = false;
        let winningCombo = [];

        for (let condition of winningConditions) {
          const [a, b, c] = condition;

          if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            winningCombo = [a, b, c]; 
            break;
          }
        }

        if (roundWon) {
          gameActive = false;
          highlight(winningCombo);
          status.innerText = `${gameState[winningCombo[0]]} wins!`;  
          return;
        }

        if (!gameState.includes('')) {
          gameActive = false;
          status.innerText = 'DRAW....!';
        }
      }

      function highlight(indices) {
        indices.forEach(index => {
          const cell = document.querySelector(`.cell[ind='${index}']`);
          cell.classList.add('winning');
        });
      }

      function aiMove() {
        const bestMove = minimax(gameState, 'O');
        const cell = document.querySelector(`.cell[ind='${bestMove.index}']`);

        update(cell, bestMove.index, 'O');
        result();

        if (gameActive) {
          currentPlayer = 'X';
          status.innerText = `Player X's turn`;
        }
      }

      function minimax(board, player) {
        const availableMoves = getAvailableMoves(board);

        if (checkWin(board, 'X')) {
          return { score: -10 };
        } else if (checkWin(board, 'O')) {
          return { score: 10 };
        } else if (availableMoves.length === 0) {
          return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableMoves.length; i++) {
          const move = availableMoves[i];
          const newBoard = board.slice();
          newBoard[move] = player;

          const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
          moves.push({ index: move, score: result.score });
        }

        let bestMove;

        if (player === 'O') {
          let bestScore = -Infinity;
          for (const move of moves) {
            if (move.score > bestScore) {
              bestScore = move.score;
              bestMove = move;
            }
          }
        } else {
          let bestScore = Infinity;
          for (const move of moves) {
            if (move.score < bestScore) {
              bestScore = move.score;
              bestMove = move;
            }
          }
        }

        return bestMove;
      }

      function getAvailableMoves(board) {
        return board.reduce((acc, curr, index) => {
          if (curr === '') acc.push(index);
          return acc;
        }, []);
      }

      function checkWin(board, player) {
        return winningConditions.some(([a, b, c]) => {
          return board[a] === player && board[b] === player && board[c] === player;
        });
      }

      function resetGame() {
        gameActive = true;
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';

        cells.forEach(cell => {
          cell.innerText = '';
          cell.classList.remove('X', 'O', 'winning');
        });

        status.innerText = "Player X's turn";
      }
    