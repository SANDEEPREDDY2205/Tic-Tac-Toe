document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameContainer = document.getElementById('game-container');
    const twoPlayerBtn = document.getElementById('two-player-btn');
    const vsComputerBtn = document.getElementById('vs-computer-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const nameInputs = document.getElementById('name-inputs');
    
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    
    const scoreboard = {
        p1Name: document.getElementById('player1-name'),
        p2Name: document.getElementById('player2-name'),
        p1Wins: document.getElementById('p1-wins'),
        p2Wins: document.getElementById('p2-wins'),
        drawCount: document.getElementById('draw-count'),
        player1ScoreDiv: document.getElementById('player1-score'),
        player2ScoreDiv: document.getElementById('player2-score')
    };

    const turnIndicator = document.getElementById('turn-indicator');
    
    const resultModal = document.getElementById('result-modal');
    const resultMessage = document.getElementById('result-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Game State
    let state = {
        gameMode: null,
        players: { p1: 'Player 1', p2: 'Player 2' },
        scores: { p1: 0, p2: 0, draws: 0 },
        currentPlayer: 'X',
        board: ['', '', '', '', '', '', '', '', ''],
        gameActive: true
    };

    // Winning Combinations
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    // --- Event Listeners ---
    twoPlayerBtn.addEventListener('click', () => setupNameInputs('two-player'));
    vsComputerBtn.addEventListener('click', () => setupNameInputs('vs-computer'));
    startGameBtn.addEventListener('click', startGame);
    board.addEventListener('click', handleCellClick);
    playAgainBtn.addEventListener('click', playAgain);
    resetBtn.addEventListener('click', resetGame);

    // --- Welcome Screen Logic ---

    function setupNameInputs(mode) {
        state.gameMode = mode;
        nameInputs.innerHTML = ''; // Clear previous inputs
        
        const input1 = document.createElement('input');
        input1.type = 'text';
        input1.placeholder = 'Enter Your Name';
        input1.id = 'player1-input';
        nameInputs.appendChild(input1);
        
        if (mode === 'two-player') {
            const input2 = document.createElement('input');
            input2.type = 'text';
            input2.placeholder = "Enter Player 2's Name";
            input2.id = 'player2-input';
            nameInputs.appendChild(input2);
        }
        
        startGameBtn.classList.remove('hidden');
    }

    function startGame() {
        const p1Input = document.getElementById('player1-input');
        state.players.p1 = p1Input.value.trim() || 'Player 1';
        
        if (state.gameMode === 'two-player') {
            const p2Input = document.getElementById('player2-input');
            state.players.p2 = p2Input.value.trim() || 'Player 2';
        } else {
            state.players.p2 = 'Computer';
        }

        // Randomly decide who starts
        state.currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        
        welcomeScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        updateScoreboard();
        updateTurnIndicator();
    }
    
    // --- Game Logic ---

    function handleCellClick(e) {
        const clickedCell = e.target;
        const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (state.board[cellIndex] !== '' || !state.gameActive) {
            return;
        }

        placeMark(cellIndex, state.currentPlayer);

        if (checkWin(state.currentPlayer)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapPlayer();
            if (state.gameMode === 'vs-computer' && state.currentPlayer === 'O') {
                handleComputerTurn();
            }
        }
    }

    function placeMark(cellIndex, player) {
        state.board[cellIndex] = player;
        cells[cellIndex].classList.add(player.toLowerCase());
        cells[cellIndex].style.pointerEvents = 'none';
    }

    function swapPlayer() {
        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }

    function checkWin(player) {
        return winConditions.some(combination => {
            return combination.every(index => {
                return state.board[index] === player;
            });
        });
    }

    function isDraw() {
        return state.board.every(cell => cell !== '');
    }

    function endGame(draw) {
        state.gameActive = false;
        
        // Highlight winning cells
        const winner = state.currentPlayer;
        if (!draw) {
            winConditions.forEach(combination => {
                if (combination.every(index => state.board[index] === winner)) {
                    combination.forEach(index => cells[index].classList.add('winning-cell'));
                }
            });
        }
        
        setTimeout(() => {
            if (draw) {
                resultMessage.textContent = "It's a Draw!";
                state.scores.draws++;
            } else {
                const winnerName = state.currentPlayer === 'X' ? state.players.p1 : state.players.p2;
                resultMessage.textContent = `${winnerName} Wins!`;
                state.currentPlayer === 'X' ? state.scores.p1++ : state.scores.p2++;
            }
            updateScoreboard();
            resultModal.classList.remove('hidden');
        }, 500); // Wait for the animation
    }

    function playAgain() {
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.gameActive = true;
        // Randomly decide who starts next round
        state.currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winning-cell');
            cell.style.pointerEvents = 'auto';
        });
        
        resultModal.classList.add('hidden');
        updateTurnIndicator();

        if (state.gameMode === 'vs-computer' && state.currentPlayer === 'O') {
             setTimeout(handleComputerTurn, 500);
        }
    }

    function resetGame() {
        location.reload(); // The simplest way to reset everything to initial state
    }
    
    // --- UI Updates ---

    function updateScoreboard() {
        scoreboard.p1Name.textContent = state.players.p1;
        scoreboard.p2Name.textContent = state.players.p2;
        scoreboard.p1Wins.textContent = state.scores.p1;
        scoreboard.p2Wins.textContent = state.scores.p2;
        scoreboard.drawCount.textContent = state.scores.draws;
    }

    function updateTurnIndicator() {
        const currentName = state.currentPlayer === 'X' ? state.players.p1 : state.players.p2;
        turnIndicator.textContent = `${currentName}'s Turn (${state.currentPlayer})`;
        
        // Active player highlight on scoreboard
        scoreboard.player1ScoreDiv.classList.toggle('active-player', state.currentPlayer === 'X');
        scoreboard.player2ScoreDiv.classList.toggle('active-player', state.currentPlayer === 'O');
    }

    // --- Computer AI Logic (Hard) ---
    function handleComputerTurn() {
        state.gameActive = false; // Disable player clicks during computer's turn
        turnIndicator.textContent = "Computer is thinking...";

        setTimeout(() => {
            const bestMove = findBestMove();
            placeMark(bestMove, 'O');
            state.gameActive = true;

            if (checkWin('O')) {
                endGame(false);
            } else if (isDraw()) {
                endGame(true);
            } else {
                swapPlayer();
            }
        }, 1000); // Simulate thinking time
    }

    function findBestMove() {
        // Minimax algorithm for unbeatable AI
        let bestVal = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (state.board[i] === '') {
                state.board[i] = 'O'; // Computer's mark
                let moveVal = minimax(0, false);
                state.board[i] = ''; // Undo move

                if (moveVal > bestVal) {
                    move = i;
                    bestVal = moveVal;
                }
            }
        }
        return move;
    }

    function minimax(depth, isMaximizing) {
        let score = evaluateBoard();

        if (score === 10) return score - depth; // Computer wins
        if (score === -10) return score + depth; // Player wins
        if (isDraw()) return 0;

        if (isMaximizing) {
            let best = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (state.board[i] === '') {
                    state.board[i] = 'O';
                    best = Math.max(best, minimax(depth + 1, !isMaximizing));
                    state.board[i] = '';
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < 9; i++) {
                if (state.board[i] === '') {
                    state.board[i] = 'X';
                    best = Math.min(best, minimax(depth + 1, !isMaximizing));
                    state.board[i] = '';
                }
            }
            return best;
        }
    }

    function evaluateBoard() {
        // Check rows, columns, and diagonals for a win
        for (let i = 0; i < winConditions.length; i++) {
            const [a, b, c] = winConditions[i];
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                if (state.board[a] === 'O') return 10; // Computer wins
                if (state.board[a] === 'X') return -10; // Player wins
            }
        }
        return 0; // No winner yet
    }
});