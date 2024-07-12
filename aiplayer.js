function getBestMove(loccurrentPlayer) {
    const board = getBoardState();
    depth = maxdepth  
    // if player is player1, depth is 1
    if (loccurrentPlayer === "player1") {
        depth = maxdepth-1;
    }
    const bestMove = minimax(board, 0, depth, loccurrentPlayer, true, -Infinity, Infinity, rows, cols);

    // If the best move is not null, return it
    if (bestMove.move !== null) {
        return bestMove.move;
    }

    return null; // Return null if no best move found
}

function getValidMoves(row, col, board, loccurrentPlayer) {
    const moves = [];
    const directions = [
        { row: -1, col: 1 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: -1, col: -1 },
        { row: 0, col: -1 },
        { row: 1, col: -1 }
    ];

    for (const direction of directions) {
        let newRow = row + direction.row;
        let newCol = col + direction.col;

        // If you are in a teleport cell, you can move to any other teleport cell of the same color
        const isteleport = teleports.find(tp => tp.row === row && tp.col === col);
        if (isteleport) {
            const teleportColor = isteleport.color;
            const teleportsWithSameColor = teleports.filter(tp => tp.color === teleportColor && (tp.row !== row || tp.col !== col));
            for (const tp of teleportsWithSameColor) {
                moves.push({ row: tp.row, col: tp.col });
            }
        }

        // For regular pieces, iterate only once
        if (!isFreelyMovingPiece(board, row, col)) {
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (isValidMoveForBoard(board, row, col, newRow, newCol, loccurrentPlayer)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        } else {
            // For freely moving pieces, iterate until an invalid move is encountered
            while (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (isValidMoveForBoard(board, row, col, newRow, newCol, loccurrentPlayer)) {
                    moves.push({ row: newRow, col: newCol });
                    if (board[newRow][newCol]) {
                        break; // Break the loop if a capturing move is found
                    }
                } else {
                    break; // Break the loop if the move is not valid
                }
                newRow += direction.row;
                newCol += direction.col;
            }
        }
    }

    return moves;
}


function getBoardState() {
    const board = [];
    const cells = document.querySelectorAll(".cell");
    for (let row = 0; row < rows; row++) {
        board[row] = [];
        for (let col = 0; col < cols; col++) {
            const cell = cells[row * cols + col];
            const piece = cell.querySelector(".piece");
            if (piece) {
                if (piece.classList.contains('freely-movable')) {
                    board[row][col] = piece.classList[1] + '-freely-movable';
                } else {
                    board[row][col] = piece.classList[1];
                }
            } else {
                board[row][col] = null;
            }
        }
    }
    return board;
}

function minimax(board, depth, maxDepth, loccurrentPlayer, isMaximizing, alpha, beta, rows, cols) {
    const result = getMiniMaxScore(board);
    const gameOver = checkGameOver(board);

    if (depth >= maxDepth || gameOver) {
        return { score: result, move: null }; // Return score only, with no move
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = null;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = board[row][col];
            if (cell && cell.startsWith(loccurrentPlayer)) {
                const validMoves = getValidMoves(row, col, board, loccurrentPlayer);
                const isteleportsource = teleports.find(tp => tp.row === row && tp.col === col); // Teleport of source cell
                const teleportColorsource = isteleportsource ? isteleportsource.color : null;

                if (validMoves.length === 0) continue;

                for (const move of validMoves) {
                    const targetRow = move.row;
                    const targetCol = move.col;

                    const newBoard = JSON.parse(JSON.stringify(board));
                    newBoard[row][col] = null;
                    newBoard[targetRow][targetCol] = cell;  // Preserve freely-movable status

                    const isteleport = teleports.find(tp => tp.row === targetRow && tp.col === targetCol); // Teleport of target cell
                    const teleportColor = isteleport ? isteleport.color : null;

                    if (isteleport && (!isteleportsource || teleportColor !== teleportColorsource)) {
                        const teleportDestination = teleports.find(tp => tp.color === isteleport.color && (isteleport.row !== row || isteleport.col !== col));
                        newBoard[teleportDestination.row][teleportDestination.col] = cell;  // Preserve freely-movable status
                        newBoard[targetRow][targetCol] = null;  
                    }

                    if ((loccurrentPlayer === "player1" && targetRow === rows - 1) || (loccurrentPlayer === "player2" && targetRow === 0)) {
                        newBoard[targetRow][targetCol] = loccurrentPlayer + '-freely-movable';
                    }

                    const nextPlayer = loccurrentPlayer === "player1" ? "player2" : "player1";
                    const { score } = minimax(newBoard, depth + 1, maxDepth, nextPlayer, !isMaximizing, alpha, beta, rows, cols);

                    if (isMaximizing) {
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = { x1: row, y1: col, x2: targetRow, y2: targetCol };
                        }
                        alpha = Math.max(alpha, score);
                        if (beta <= alpha) {
                            return { score: bestScore, move: bestMove };
                        }
                    } else {
                        if (score < bestScore) {
                            bestScore = score;
                            bestMove = { x1: row, y1: col, x2: targetRow, y2: targetCol };
                        }
                        beta = Math.min(beta, score);
                        if (beta <= alpha) {
                            return { score: bestScore, move: bestMove };
                        }
                    }
                }
            }
        }
    }

    return { score: bestScore, move: bestMove };
}


function getMiniMaxScore(board) {
    let score1 = 0;
    let score2 = 0;
    let freelyMoving1 = 0;
    let freelyMoving2 = 0;
    let totpieces1 = 0
    let totpieces2 = 0

    // create a random, integer, number between 0 and 2
    const random = Math.floor(Math.random() * 3);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];

            if (!cell) continue;

            if (cell.startsWith('player1')) {
                score1 -= 10;
                totpieces1 += 1
                if (isFreelyMovingPiece(board, i, j)) {
                    freelyMoving1++;
                    score1 -= 30;
                } else {
                    score1 -= (i-1); // Encourage advancing towards the opponent's side
                }
            } else if (cell.startsWith('player2')) {
                score2 += 10;
                totpieces2 += 1
                if (isFreelyMovingPiece(board, i, j)) {
                    freelyMoving2++;
                    score2 += 30;
                } else {
                    score2 += (rows - i) - 1; // Encourage advancing towards the opponent's side
                }
            }
        }
    }

    if (freelyMoving1 >= 3) {
        score1 = -99999;
    }

    if (freelyMoving2 >= 3) {
        score2 = 99999;
    }

    if (totpieces2 === 0) {
        score1 = -99999;
    }

    if (totpieces1 === 0) {
        score2 = 99999;
    }

    // Invert the score signs if the current player is player1
    if (currentPlayer === 'player1') {
        score1 *= -1;
        score2 *= -1;
    }

    return score2 + score1 + random;
}


function isValidMoveForBoard(board, startRow, startCol, targetRow, targetCol, loccurrentPlayer) {
    const opponentPlayer = loccurrentPlayer === 'player1' ? 'player2' : 'player1';
    return (
        board[targetRow][targetCol] === null ||
        board[targetRow][targetCol].startsWith(opponentPlayer)
    );
}
