const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn-display");
let colorIndex = 0;
const colors = ["#FFA500", "#008000", "#800080", "#808000", "#00FFFF", "#FF00FF", "#800000", "#008080", "#000080", "#808080", "#C0C0C0", "#FFFF00"];

// Get level from url
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");


const rows = 8;
const cols = 8;

const player1CountElement = document.getElementById('player1-count');
const player2CountElement = document.getElementById('player2-count');

// If level> 4, set maxdepth to 4, else to level
let maxdepth = level > 4 ? 4 : level;
console.log("maxdepth", maxdepth);

window.rows = rows; // or any value you want
window.cols = cols; // or any value you want
let selectedPiece = null;
let currentPlayer = "player1";
const specialPieces = new Set();
const teleports = [];
let selectingTeleport = false;
let lastPlayer = null;
const teleportConfigurations = [
    { numCells: 2, numTeleports: 12 }
];

function hasPiecesBetween(startRow, startCol, targetRow, targetCol) {
    const rowDirection = Math.sign(targetRow - startRow);
    const colDirection = Math.sign(targetCol - startCol);
    let row = startRow + rowDirection;
    let col = startCol + colDirection;

    while (row !== targetRow || col !== targetCol) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell && cell.firstChild) {
            return true;
        }
        row += rowDirection;
        col += colDirection;
    }
    return false;
}

function isValidMove(startCell, targetCell, loccurrentPlayer = currentPlayer) {

    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);

    const rowDiff = Math.abs(startRow - targetRow);
    const colDiff = Math.abs(startCol - targetCol);

    // If start and target cells are the same, return false
    if (rowDiff === 0 && colDiff === 0) {
        return false;
    }

    if (rowDiff <= 1 && colDiff <= 1 && (!targetCell.firstChild || !targetCell.firstChild.classList.contains(loccurrentPlayer))) {
        return true;
    }

    const piece = startCell.firstChild;

    if (piece && specialPieces.has(piece) && (!targetCell.firstChild || !targetCell.firstChild.classList.contains(loccurrentPlayer)) && !hasPiecesBetween(startRow, startCol, targetRow, targetCol)) {
        return true;
    }

    // Check if the piece is on a teleport and the target is another teleport of the same color
    const startTeleport = teleports.find(tp => tp.row === startRow && tp.col === startCol);
    const targetTeleport = teleports.find(tp => tp.row === targetRow && tp.col === targetCol);
    if (startTeleport && targetTeleport && startTeleport.color === targetTeleport.color) {
        return true;
    }

    return false;
}


function checkGameOver() {
    const opponentPlayer = currentPlayer === "player1" ? "player2" : "player1";
    const opponentPieces = document.querySelectorAll(`.piece.${opponentPlayer}`).length;
    const freelyMovingPieces = getFreelyMovingPieces(currentPlayer);

    if (opponentPieces === 0 || freelyMovingPieces >= 3) {
        return true;
    }
    return false;
}

// Function to get the number of freely moving pieces for a given player
function getFreelyMovingPieces(player) {
    return document.querySelectorAll(`.piece.${player}.freely-movable`).length;
}

function isFreelyMovingPiece(board, row, col) {
    const cell = board[row] && board[row][col];
    return cell && cell.endsWith('-freely-movable');
}
