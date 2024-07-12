document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const player1Type = urlParams.get('player1');
    const player2Type = urlParams.get('player2');
    // const gameplay = document.getElementById('gameplay');
    const p1avatar = document.getElementById('p1avatar');
    const p2avatar = document.getElementById('p2avatar');
    
    function initBoard() {

        // gameplay.addEventListener("touchstart",(e)=>{e.preventDefault();});
        // gameplay.addEventListener("touchmove",(e)=>{e.preventDefault();});

        const playerRows = rows < 6 ? 1 : 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);

                if (row < playerRows) {
                    createPiece(cell, "player1");
                } else if (row >= rows - playerRows) {
                    createPiece(cell, "player2");
                }

                cell.addEventListener("dragover", handleDragOver);
                cell.addEventListener("drop", handleDrop);
                cell.addEventListener("touchmove", handleTouchMove);
                cell.addEventListener("touchend", handleTouchEnd);
            }
        }

        // Add additional pieces for the AI player in row 3 if level > 4
        if (player2Type === "ai" && rows > 6 && level > 4) {
            const numExtraPieces = level - 5;
            const cells = document.querySelectorAll('.cell');
            const line3Cells = [...cells].filter(cell => cell.dataset.row === '5' && !cell.firstChild);
            const shuffledCells = shuffleArray(line3Cells);
            for (let i = 0; i < numExtraPieces && i < shuffledCells.length; i++) {
                createPiece(shuffledCells[i], "player2");
            }
        }

        if(player1Type == "ai")
        {
            p1avatar.classList.add('ai-avatar');
        }
        else
        {
            p1avatar.classList.add('avatar');
        }

        if(player2Type == "ai")
        {
            p2avatar.classList.add('ai-avatar');
        }
        else
        {
            p2avatar.classList.add('avatar');
        }

        createTeleports();
        updateTurnDisplay();
    }


    function updateTurnDisplay() {

        // If player1, display "Player 1's turn", else display "Player 2's turn"
        turnDisplay.textContent = currentPlayer === "player1" ? "Player 1's turn" : "Player 2's turn";

        let player1Count = document.querySelectorAll('.player1').length;
        let player2Count = document.querySelectorAll('.player2').length;

        // Count also freely movable pieces
        player1Count += document.querySelectorAll('.player1.freely-movable').length;
        player2Count += document.querySelectorAll('.player2.freely-movable').length;

        player1CountElement.textContent = `Player 1: ${player1Count}`;
        player2CountElement.textContent = `Player 2: ${player2Count}`;
    }

    function createPiece(cell, player) {
        const piece = document.createElement("div");
        piece.classList.add("piece", player);
        piece.draggable = true;
        cell.appendChild(piece);

        piece.addEventListener("dragstart", handleDragStart);
        piece.addEventListener("dragend", () => { selectedPiece = null; });
        piece.addEventListener("touchstart", handleTouchStart);
    }

    function handleDragStart(e) {
        const piece = e.target;
        if (piece.classList.contains(currentPlayer)) {
            selectedPiece = piece;
    
            // Set the data being dragged
            e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    
            // Calculate the offset of the cursor relative to the piece
            const offsetX = e.clientX - piece.getBoundingClientRect().left;
            const offsetY = e.clientY - piece.getBoundingClientRect().top;
    
            // Set the offset in the dataTransfer object
            e.dataTransfer.setDragImage(piece, offsetX, offsetY);
        } else {
            e.preventDefault();
        }
    }
    

    function handleTouchStart(e) {
        const piece = e.target;
        if (piece.classList.contains(currentPlayer)) {
            selectedPiece = piece;
        }
    }

    function handleDragOver(e) {
        // Allow drop events to occur
        e.preventDefault();
    }

    function handleDrop(e) {
        // Prevent default drop behavior
        e.preventDefault();
    
        const targetCell = e.target.closest('.cell');
        if (selectedPiece) {
            const startCell = selectedPiece.parentElement;
            const startRow = parseInt(startCell.dataset.row);
            const startCol = parseInt(startCell.dataset.col);
            const startTeleport = teleports.find(tp => tp.row === startRow && tp.col === startCol);
    
            const targetRow = parseInt(targetCell.dataset.row);
            const targetCol = parseInt(targetCell.dataset.col);
            const targetTeleport = teleports.find(tp => tp.row === targetRow && tp.col === targetCol);
    
            const endMove = startTeleport && targetTeleport && startTeleport.color === targetTeleport.color;
            movePieceToTarget(selectedPiece, targetCell, endMove);
        }
    }
    

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY).closest(".cell");
        if (selectedPiece && targetCell) {
            const startCell = selectedPiece.parentElement;
            const startRow = parseInt(startCell.dataset.row);
            const startCol = parseInt(startCell.dataset.col);
            const startTeleport = teleports.find(tp => tp.row === startRow && tp.col === startCol);

            const targetRow = parseInt(targetCell.dataset.row);
            const targetCol = parseInt(targetCell.dataset.col);
            const targetTeleport = teleports.find(tp => tp.row === targetRow && tp.col === targetCol);

            const endMove = startTeleport && targetTeleport && startTeleport.color === targetTeleport.color;
            movePieceToTarget(selectedPiece, targetCell, endMove);
        }
    }

    function handleTouchEnd(e) {
        if (!selectingTeleport) {
            selectedPiece = null;
        }
    }

    function movePieceToTarget(piece, targetCell, endMove) {
        console.log("Moving piece to target cell");
        console.log(piece, targetCell);
        var audio1 = document.getElementById("myAudio2");
        var playButtons1 = document.querySelectorAll(".cell");
    
        playButtons1.forEach(function (button) {
          button.addEventListener("dragend", function () {
            if (audio1.paused) {
              audio1.play();
            } else {
              /* stop the audio if you want*/
              //  audio1.pause();
              audio1.currentTime = 0;
            }
          });
        });

        if (isValidMove(piece.parentElement, targetCell)) {
            console.log("Valid move");
            if (targetCell.firstChild && !targetCell.firstChild.classList.contains(currentPlayer)) {
                targetCell.removeChild(targetCell.firstChild);
            }
            targetCell.appendChild(piece);
            if (!endMove) {
                handleSpecialMove(piece, targetCell);
            }
            selectedPiece = null;
            setTimeout(() => {
                // Check if the game is over
                const isGameOver = checkGameOver();
                if (isGameOver) {
                    // Display the game over message and winner on screen
                    // const winner = lastPlayer === "player1" ? "Player 1" : "Player 2";
                    // alert(`Game over! ${winner} wins!`);

                    const winner = currentPlayer === "player1" ? "Player 1" : "Player 2";
                    gameOver(winner);

                    return;
                }
                switchPlayer(); // Delay to ensure move completion       
            }, 100); // Short delay to ensure DOM updates
        } else {
            console.log("Invalid move");
        }
    }
    (function ($) {
        $('.restart').click(function() {
            // var gameoverui = document.getElementById("game-over");
            // gameoverui.style.display = 'none';
            $('#game-over').hide();
            setTimeout(()=>{
                restartGame();

            },200)
        });
        $('.menu').click(function() {
            // var gameoverui = document.getElementById("game-over");
            // gameoverui.style.display = 'none';
            $('#game-over').hide();
            showMenu();
        });
        $('.resume').click(function() {
            $('#pause').hide();
            $('#instruction').hide();
            $('#gameplay').css('opacity', '1');
        });
        $('.pause').click(function() {
            $('#pause').show();
            $('#gameplay').css('opacity', '0.5');
        });
        $('.instructionbtnclss').click(function() {
            $('#instruction').show();
            $('#gameplay').css('opacity', '0.5');
        });

    })(jQuery);

    function restartGame(){
        setTimeout(()=>{
            window.location.href = 'game.html?player1=' + player1Type + '&player2=' + player2Type + '&level=' + level;

        },0)
    }

    function showMenu(){
        setTimeout(()=>{
            window.location.href = 'index.html';

        },200)
    }

    function gameOver(_winner) {
        var gameoverui = document.getElementById("game-over");
        gameoverui.style.display = 'block';

        var gameplayui = document.getElementById("gameplay");
        gameplayui.style.display = 'none';

        document.getElementById("winner").textContent=`${_winner}` + " wins!";

    }

    function handleSpecialMove(piece, targetCell) {
        const row = parseInt(targetCell.dataset.row);
        if ((currentPlayer === "player1" && row === rows-1) || (currentPlayer === "player2" && row === 0)) {
            specialPieces.add(piece);
            piece.classList.add("freely-movable");
        }
    
        const col = parseInt(targetCell.dataset.col);
        const teleport = teleports.find(tp => tp.row === row && tp.col === col);
        if (teleport) {
            console.log("Teleporting piece");
            console.log(piece, teleport);
            console.log(row, col);
            const startCell = piece.parentElement;
            const startRow = parseInt(startCell.dataset.row);
            const startCol = parseInt(startCell.dataset.col);
            const startTeleport = teleports.find(tp => tp.row === startRow && tp.col === startCol);
            if (!startTeleport || startTeleport.color !== teleport.color || currentPlayer !== lastPlayer) {
                handleTeleport(piece, teleport);
            }
        }
    }


    function switchPlayer() {
        console.log("Switching player  " + currentPlayer + " to " + (currentPlayer === "player1" ? "player2" : "player1"));
        lastPlayer = currentPlayer;
        currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
        updateTurnDisplay();
    
        const isCurrentPlayerAI = (currentPlayer === "player1" && player1Type === 'ai') || (currentPlayer === "player2" && player2Type === 'ai');
    
        if (isCurrentPlayerAI) {
            console.log(`${currentPlayer} (AI) turn`);
            setTimeout(() => {
                const aiMove = getBestMove(currentPlayer); // Return coordinates of the best move (x1, y1, x2, y2)
                console.log("AI move received: ", aiMove);

                // if move is null, then the game is over
                if (!aiMove) {
                    // const winner = lastPlayer === "player1" ? "Player 1" : "Player 2";
                    // alert(`Game over! ${winner} wins!`);

                    const winner = currentPlayer === "player1" ? "Player 1" : "Player 2";
                    gameOver(winner);
                    return;
                }

                const startCell = document.querySelector(`.cell[data-row="${aiMove.x1}"][data-col="${aiMove.y1}"]`);
                const piece = startCell.firstChild;
                const targetCell = document.querySelector(`.cell[data-row="${aiMove.x2}"][data-col="${aiMove.y2}"]`);
                
                // Set the endMove flag to true if the move involves teleportation
                const startTeleport = teleports.find(tp => tp.row === aiMove.x1 && tp.col === aiMove.y1);
                const targetTeleport = teleports.find(tp => tp.row === aiMove.x2 && tp.col === aiMove.y2);
                const endMove = startTeleport && targetTeleport && startTeleport.color === targetTeleport.color;

                movePieceToTarget(piece, targetCell, endMove);
            }, 500); // 500ms delay to simulate AI thinking time and prevent immediate recursive call
        }
    }
    
    function createTeleports() {
        // const TeleportCells = [...document.querySelectorAll('.cell:not(.player1):not(.player2)')].filter(cell => !cell.firstChild);
        const allCells = [...document.querySelectorAll('.cell')];
        const TeleportCells = allCells.filter(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            return row !== 0 && row !== rows-1;
        });
        const shuffledCells = shuffleArray(TeleportCells);

        for (const config of teleportConfigurations) {
            for (let i = 0; i < config.numTeleports; i++) {
                const teleport = { cells: [], color: getRandomColor() };

                for (let j = 0; j < config.numCells; j++) {
                    const cell = shuffledCells.pop();
                    cell.style.backgroundColor = teleport.color;
                    teleport.cells.push(cell);
                    teleports.push({ row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col), color: teleport.color });
                }
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function handleTeleport(piece, teleport) {
        selectingTeleport = true;
        disableDragAndDrop();

        const availableTargets = teleports.filter(tp => tp.color === teleport.color && (tp.row !== teleport.row || tp.col !== teleport.col));
        const filteredTargets = availableTargets.filter(target => {
            const targetCell = document.querySelector(`.cell[data-row="${target.row}"][data-col="${target.col}"]`);
            return !targetCell.firstChild || !targetCell.firstChild.classList.contains(currentPlayer);
        });

        if (filteredTargets.length === 1) {
            handleTargetCell(document.querySelector(`.cell[data-row="${filteredTargets[0].row}"][data-col="${filteredTargets[0].col}"]`), piece);
            enableDragAndDrop();
            selectingTeleport = false;
        } else if (filteredTargets.length > 1) {
            filteredTargets.forEach(target => {
                const cell = document.querySelector(`.cell[data-row="${target.row}"][data-col="${target.col}"]`);
                cell.classList.add('teleport-choice');
                const handleClick = () => {
                    handleTargetCell(cell, piece);
                    filteredTargets.forEach(t => {
                        const targetCell = document.querySelector(`.cell[data-row="${t.row}"][data-col="${t.col}"]`);
                        targetCell.classList.remove('teleport-choice');
                        targetCell.removeEventListener('click', handleClick);
                    });
                    enableDragAndDrop();
                    selectingTeleport = false;
                };
                cell.addEventListener('click', handleClick);
            });
        } else {
            enableDragAndDrop();
            selectingTeleport = false;
        }
    }

    function handleTargetCell(targetCell, piece) {
        // Check if the target cell contains an opponent's piece
        const opponentPlayer = getOpponentPlayer(currentPlayer);
        const isOpponentPiece = targetCell.firstChild && targetCell.firstChild.classList.contains(opponentPlayer);
        // Check if the target cell is not empty and the piece is not freely movable
        if (isOpponentPiece && !targetCell.firstChild.classList.contains("freely-movable")) {
            targetCell.removeChild(targetCell.firstChild); // Capture the opponent's piece
        }
        // Remove any existing piece from the target cell
        if (targetCell.firstChild) {
            targetCell.removeChild(targetCell.firstChild);
        }
        // Move the piece to the target cell
        movePiece(piece, parseInt(targetCell.dataset.row), parseInt(targetCell.dataset.col));
  
        // Enable drag and drop after teleportation
        enableDragAndDrop();

        // Reset the selectingTeleport flag
        selectingTeleport = false;
    }

    function movePiece(piece, row, col) {
        const targetCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        targetCell.appendChild(piece);
    }

    function getOpponentPlayer(player) {
        return player === "player1" ? "player2" : "player1";
    }

    function disableDragAndDrop() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.removeEventListener('dragover', handleDragOver);
            cell.removeEventListener('drop', handleDrop);
        });
    }

    function enableDragAndDrop() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDrop);
        });
    }


    function getRandomColor() {
        const color = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
        return color;
    }

    initBoard();
});
// ********************audio sound */
// *****************Audio for page game***********************************/
// button circle of th game audio (players)
document.addEventListener("DOMContentLoaded", function () {
    // player1 and player 2 when you click on it
    var cells = document.querySelectorAll(".cell");
    var audio3 = document.getElementById("myAudio3");
  
    cells.forEach(function (button) {
      button.addEventListener("click", function () {
        if (audio3.paused) {
          audio3.play();
        } else {
          /* stop the audio if you want*/
          //  audio2.pause();
          audio3.currentTime = 0;
        }
      });
    });
  });
  // audio sound for page game.js 1
  var audio1 = document.getElementById("myAudio1");
  var playButtons1 = document.querySelectorAll(".playButton");
  
  playButtons1.forEach(function (button) {
    button.addEventListener("click", function () {
      if (audio1.paused) {
        audio1.play();
      } else {
        /* stop the audio if you want*/
        //  audio1.pause();
        audio1.currentTime = 0;
      }
    });
  });
  // audio sound for page game.js 2
  var audio2 = document.getElementById("myAudio2");
  var playButtons2 = document.querySelectorAll(".playButtonOptions");
  
  playButtons2.forEach(function (button) {
    button.addEventListener("click", function () {
      if (audio2.paused) {
        audio2.play();
      } else {
        /* stop the audio if you want*/
        //  audio2.pause();
        audio2.currentTime = 0;
      }
    });
  });
  