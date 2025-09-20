const piecesUnicode = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let board = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const boardElement = document.getElementById('chessboard');
const whitePlayer = document.getElementById('white-player');
const blackPlayer = document.getElementById('black-player');
const gameStatus = document.getElementById('game-status');
const statusMessage = document.getElementById('status-message');
const newGameBtn = document.getElementById('new-game-btn');
const flipBoardBtn = document.getElementById('flip-board-btn');
const undoBtn = document.getElementById('undo-btn');

let selectedSquare = null;
let possibleMoves = [];
let turn = 'white';
let boardFlipped = false;
let gameOver = false;
let moveHistory = [];

function createBoard() {
  boardElement.innerHTML = '';

  const rows = boardFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const cols = boardFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  for (let row of rows) {
    for (let col of cols) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      
      square.id = `sq-${row}-${col}`;
      square.dataset.row = row;
      square.dataset.col = col;

      // Add coordinates (only on edge squares)
      if ((!boardFlipped && col === 0) || (boardFlipped && col === 7)) {
        const rank = document.createElement('span');
        rank.className = 'coordinates rank';
        rank.textContent = boardFlipped ? row + 1 : 8 - row;
        square.appendChild(rank);
      }
      
      if ((!boardFlipped && row === 7) || (boardFlipped && row === 0)) {
        const file = document.createElement('span');
        file.className = 'coordinates file';
        file.textContent = String.fromCharCode(97 + (boardFlipped ? 7 - col : col));
        square.appendChild(file);
      }

      const piece = board[row][col];
      if (piece) {
        square.textContent = piecesUnicode[piece];
        square.style.textShadow = piece === piece.toUpperCase() ? 
          '1px 1px 2px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(255,255,255,0.3)';
      }
      square.dataset.piece = piece || '';

      // Highlight possible moves
      if (possibleMoves.some(move => move.row === row && move.col === col)) {
        square.classList.add('possible-move');
      }

      square.addEventListener('click', onSquareClick);
      boardElement.appendChild(square);
    }
  }
  
  // Highlight selected square
  if (selectedSquare) {
    const { row, col } = selectedSquare;
    const square = document.querySelector(`#sq-${row}-${col}`);
    if (square) square.classList.add('highlight');
  }
  
  updateTurnIndicator();
  checkGameStatus();
}

function onSquareClick(e) {
  if (gameOver) return;
  
  const sq = e.currentTarget;
  const row = +sq.dataset.row;
  const col = +sq.dataset.col;
  const piece = board[row][col];

  if (!selectedSquare) {
    if (piece && isTurnPiece(piece)) {
      selectedSquare = { row, col };
      possibleMoves = getPossibleMoves(piece, row, col);
      createBoard();
    }
  } else {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = board[fromRow][fromCol];

    if (row === fromRow && col === fromCol) {
      selectedSquare = null;
      possibleMoves = [];
      createBoard();
      return;
    }

    if (piece && isTurnPiece(piece)) {
      selectedSquare = { row, col };
      possibleMoves = getPossibleMoves(piece, row, col);
      createBoard();
      return;
    }

    if (isLegalMove(movingPiece, fromRow, fromCol, row, col)) {
      if (!wouldBeInCheck(movingPiece, fromRow, fromCol, row, col, turn)) {
        // Save current state to history before making the move
        moveHistory.push({
          board: JSON.parse(JSON.stringify(board)),
          turn: turn,
          selectedSquare: selectedSquare ? {...selectedSquare} : null,
          possibleMoves: [...possibleMoves]
        });
        
        movePiece(fromRow, fromCol, row, col);
        selectedSquare = null;
        possibleMoves = [];
        switchTurn();
        createBoard();
      } else {
        statusMessage.textContent = "Can't leave king in check!";
        setTimeout(() => updateGameStatus(), 1500);
      }
    } else {
      statusMessage.textContent = "Illegal move!";
      setTimeout(() => updateGameStatus(), 1500);
    }
  }
}

function getPossibleMoves(piece, row, col) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isLegalMove(piece, row, col, r, c) && 
          !wouldBeInCheck(piece, row, col, r, c, turn)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

function isTurnPiece(piece) {
  return (turn === 'white') ? (piece === piece.toUpperCase()) : (piece === piece.toLowerCase());
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  // Check for pawn promotion
  if (board[fromRow][fromCol].toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
    board[toRow][toCol] = (turn === 'white') ? 'Q' : 'q';
  } else {
    board[toRow][toCol] = board[fromRow][fromCol];
  }
  board[fromRow][fromCol] = '';
}

function switchTurn() {
  turn = (turn === 'white') ? 'black' : 'white';
  updateTurnIndicator();
}

function updateTurnIndicator() {
  if (turn === 'white') {
    whitePlayer.classList.add('active-player');
    blackPlayer.classList.remove('active-player');
  } else {
    blackPlayer.classList.add('active-player');
    whitePlayer.classList.remove('active-player');
  }
}

function isLegalMove(piece, fromRow, fromCol, toRow, toCol) {
  if (!piece) return false;
  
  const isWhite = piece === piece.toUpperCase();
  const dir = isWhite ? -1 : 1;
  const target = board[toRow][toCol];
  if (target && ((target === target.toUpperCase()) === isWhite)) return false;

  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  switch(piece.toLowerCase()) {
    case 'p':
      if (dc === 0) {
        if (dr === dir && !target) return true;
        const startRow = isWhite ? 6 : 1;
        if (fromRow === startRow && dr === 2*dir && !target && !board[fromRow + dir][fromCol]) return true;
      } else if (Math.abs(dc) === 1 && dr === dir && target) {
        return true;
      }
      return false;

    case 'r':
      if (dr === 0 && dc !== 0) return isClearPath(fromRow, fromCol, toRow, toCol);
      if (dc === 0 && dr !== 0) return isClearPath(fromRow, fromCol, toRow, toCol);
      return false;

    case 'n':
      return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

    case 'b':
      if (Math.abs(dr) === Math.abs(dc)) return isClearPath(fromRow, fromCol, toRow, toCol);
      return false;

    case 'q':
      if (dr === 0 || dc === 0) return isClearPath(fromRow, fromCol, toRow, toCol);
      if (Math.abs(dr) === Math.abs(dc)) return isClearPath(fromRow, fromCol, toRow, toCol);
      return false;

    case 'k':
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

    default:
      return false;
  }
}

function isClearPath(fromRow, fromCol, toRow, toCol) {
  const dr = Math.sign(toRow - fromRow);
  const dc = Math.sign(toCol - fromCol);
  let r = fromRow + dr;
  let c = fromCol + dc;

  while (r !== toRow || c !== toCol) {
    if (board[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
}

function findKing(color) {
  const kingChar = (color === 'white') ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) return { r, c };
    }
  }
  return null;
}

function isSquareAttacked(row, col, attackerColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && ((attackerColor === 'white') ? (piece === piece.toUpperCase()) : (piece === piece.toLowerCase()))) {
        if (isLegalMove(piece, r, c, row, col)) {
          if (piece.toLowerCase() === 'p') {
            const dir = (piece === piece.toUpperCase()) ? -1 : 1;
            if (row === r + dir && (col === c + 1 || col === c - 1)) return true;
          } else {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function inCheck(color) {
  const kingPos = findKing(color);
  if (!kingPos) return true;
  const opponent = (color === 'white') ? 'black' : 'white';
  return isSquareAttacked(kingPos.r, kingPos.c, opponent);
}

function wouldBeInCheck(piece, fromRow, fromCol, toRow, toCol, color) {
  const backupFrom = board[fromRow][fromCol];
  const backupTo = board[toRow][toCol];

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = '';

  const check = inCheck(color);

  board[fromRow][fromCol] = backupFrom;
  board[toRow][toCol] = backupTo;

  return check;
}

function hasAnyLegalMove(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && ((color === 'white') ? (piece === piece.toUpperCase()) : (piece === piece.toLowerCase()))) {
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (isLegalMove(piece, r, c, tr, tc)) {
              if (!wouldBeInCheck(piece, r, c, tr, tc, color)) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function updateGameStatus() {
  statusMessage.textContent = '';
  
  if (isCheckmateOrStalemate()) {
    if (inCheck(turn)) {
      gameOver = true;
      gameStatus.innerHTML = `<div>CHECKMATE!</div><div class="status-message">${turn === 'white' ? 'Black' : 'White'} wins!</div>`;
      gameStatus.className = 'game-status status-checkmate';
      highlightCheckmatedKing();
    } else {
      gameOver = true;
      gameStatus.innerHTML = '<div>STALEMATE!</div><div class="status-message">Game drawn</div>';
      gameStatus.className = 'game-status status-normal';
    }
  } else if (inCheck(turn)) {
    gameStatus.innerHTML = '<div>CHECK!</div><div class="status-message">King is under attack</div>';
    gameStatus.className = 'game-status status-check';
    highlightCheckedKing();
  } else {
    gameStatus.innerHTML = '<div>Game in progress</div><div class="status-message">Make your move</div>';
    gameStatus.className = 'game-status status-normal';
  }
}

function highlightCheckedKing() {
  const kingColor = turn;
  const kingPos = findKing(kingColor);
  if (kingPos) {
    const kingSquare = document.querySelector(`#sq-${kingPos.r}-${kingPos.c}`);
    if (kingSquare) kingSquare.classList.add('king-in-check');
  }
}

function highlightCheckmatedKing() {
  const kingColor = turn;
  const kingPos = findKing(kingColor);
  if (kingPos) {
    const kingSquare = document.querySelector(`#sq-${kingPos.r}-${kingPos.c}`);
    if (kingSquare) {
      kingSquare.classList.remove('king-in-check');
      kingSquare.classList.add('king-checkmate');
    }
  }
}
let promotionPending = null;
function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const isWhite = piece === piece.toUpperCase();

  // Check for pawn promotion
  if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
    promotionPending = { fromRow, fromCol, toRow, toCol, color: isWhite ? 'white' : 'black' };
    showPromotionModal(isWhite ? 'white' : 'black');
    return;
  }

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = '';
}
function showPromotionModal(color) {
  document.getElementById('promotion-modal').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function hidePromotionModal() {
  document.getElementById('promotion-modal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

function promote(choice) {
  if (!promotionPending) return;

  const { fromRow, fromCol, toRow, toCol, color } = promotionPending;
  board[toRow][toCol] = (color === 'white') ? choice.toUpperCase() : choice.toLowerCase();
  board[fromRow][fromCol] = '';

  promotionPending = null;
  hidePromotionModal();
  switchTurn();
  createBoard();
}

function isCheckmateOrStalemate() {
  return !hasAnyLegalMove(turn);
}

function checkGameStatus() {
  if (isCheckmateOrStalemate()) {
    if (inCheck(turn)) {
      gameOver = true;
      gameStatus.innerHTML = `<div>CHECKMATE!</div><div class="status-message">${turn === 'white' ? 'Black' : 'White'} wins!</div>`;
      gameStatus.className = 'game-status status-checkmate';
      highlightCheckmatedKing();
    } else {
      gameOver = true;
      gameStatus.innerHTML = '<div>STALEMATE!</div><div class="status-message">Game drawn</div>';
      gameStatus.className = 'game-status status-normal';
    }
  } else if (inCheck(turn)) {
    gameStatus.innerHTML = '<div>CHECK!</div><div class="status-message">King is under attack</div>';
    gameStatus.className = 'game-status status-check';
    highlightCheckedKing();
  } else {
    gameStatus.innerHTML = '<div>Game in progress</div><div class="status-message">Make your move</div>';
    gameStatus.className = 'game-status status-normal';
  }
}

function resetGame() {
  board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
  turn = 'white';
  selectedSquare = null;
  possibleMoves = [];
  gameOver = false;
  moveHistory = [];
  createBoard();
}

function flipBoard() {
  boardFlipped = !boardFlipped;
  createBoard();
}

function undoMove() {
  if (moveHistory.length === 0) return;
  
  const lastState = moveHistory.pop();
  board = lastState.board;
  turn = lastState.turn;
  selectedSquare = lastState.selectedSquare;
  possibleMoves = lastState.possibleMoves;
  gameOver = false;
  
  createBoard();
}

// Event listeners
newGameBtn.addEventListener('click', resetGame);
flipBoardBtn.addEventListener('click', flipBoard);
undoBtn.addEventListener('click', undoMove);

// Initialize the game
createBoard();
