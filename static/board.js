import {getMoves, updateFen} from "./apiCall.js";

function isUpper(char) { //Helper function to see if a character is upperCase;
  return char === char.toUpperCase()? true : false;
}

function setBoard(fenString) {
  resetAllSqaures()
  const piecePlacement = fenString.split(" ")[0];  // Get only the piece layout from FEN
  const fenRows = piecePlacement.split("/");

  for (let boardRow = 7; boardRow >= 0; boardRow--) {
    const fenRow = fenRows[7 - boardRow];  // FEN starts from rank 8 (top), so reverse index
    let boardColumn = 0;

    for (let fenCol = 0; fenCol < fenRow.length; fenCol++) {
      const fenChar = fenRow[fenCol];
      const squareIndexBase = (boardRow * 8) + boardColumn;

      if (!isNaN(fenChar)) {
        const emptyCount = Number(fenChar);
        for (let i = 0; i < emptyCount; i++) {
          const square = document.getElementsByClassName(squareIndexBase + i)[0];
          if (square) {
            square.classList.add("empty");
          }
          boardColumn++;
        }
      } else {
        const square = document.getElementsByClassName(squareIndexBase)[0];
        if (square) {
          square.classList.add("piece");

          const pieceImage = document.createElement("img");
          let pieceCode = "";

          if (isUpper(fenChar)) {
            pieceCode = fenChar.toUpperCase() + "L";  // Light piece
          } else {
            pieceCode = fenChar.toLowerCase() + "d";  // Dark piece
          }

          pieceImage.src = `static/images/pieces/${pieceCode}.svg`;
          square.appendChild(pieceImage);
        }

        boardColumn++;
      }
    }
  }
}
let chessboard = document.getElementById("chessBoard");
const gameStartFen = "8/3p3p/2p2RPP/8/1K4p1/1pP1prP1/2k5/2N1R3 w - - 0 1"
let FEN = gameStartFen
//Add alternating empty light and dark squares
for (let row = 7; row >= 0; row--){ //Starting with A8 -> H8 then A7 -> H7 .... A1 -> H1;
    const newRow = document.createElement('div');
    newRow.classList.add("row");

    for (let column = 0; column <= 7; column++){
        const newSquare = document.createElement('div');

        const index = ((row  * 8) + column);
        
        newSquare.classList.add("square");
        newSquare.classList.add((row + column) % 2 == 0 ? "light" : "dark");
        newSquare.classList.add(index);
        newRow.appendChild(newSquare);
    }

    chessboard.appendChild(newRow);
}

setBoard(gameStartFen);

//Listen for user to click on a piece
const squares = document.getElementsByClassName('square')
for (let square of squares){
  square.addEventListener("click", () => squarePress(square))
}
let prevPiece = null

function squarePress(square) {
  // We can take 3 actions when a square on the chessboard is pressed:
  //  1) If the square has a piece and no squares are highlighted, find the legal moves and highlight the squares of the legal moves. Store piece in prevPiece.
  //  2) If the square has a piece but another square is highlighted, remove the prev highlights and hightlight the squares of the new legal_moves. Store piece in prevPiece.
  //  3) If a highlighted square is clicked, move the piece, update the fen by calling the python api. remove value of prevPiece.
  //  4) if an empty square is clicked and there is an highlight, remove all the highlights. remove value of prevPiece.

  let isBoardHighlighted = false //board contains highlighted squares
  let isPiece = false //square contains piece
  let isSquareHighlighted = false

  if (document.getElementsByClassName("highlighted").length != 0) {
    isBoardHighlighted = true
  }
  if (square.classList.contains("piece")) {
    isPiece = true
  }
  if (square.classList.contains("highlighted")) {
    isSquareHighlighted = true
  }

  const startTime = performance.now();

  if (!isBoardHighlighted && isPiece) {
    getMoves(square, FEN).then(moves => highlight(moves))
    prevPiece = square
    const endTime = performance.now();
  }
  else if (isBoardHighlighted && isPiece && !isSquareHighlighted){
    removeAllHightlights()
    getMoves(square, FEN).then(moves => highlight(moves))
    prevPiece = square
  }
  else if (isSquareHighlighted) {
    removeAllHightlights()

    const startIndex = prevPiece.classList[2]
    const targetIndex = square.classList[2]
    
    updateFen(startIndex, targetIndex, FEN).then(newFEN => {setBoard(newFEN), FEN = newFEN})
    prevPiece = null
  }
  else{
    removeAllHightlights()
    prevPiece = null
  }
  const endTime = performance.now();

  if ((!isBoardHighlighted && isPiece) | (isBoardHighlighted && isPiece && !isSquareHighlighted)) {
    console.log("Time taken from api_call: ", endTime - startTime)
  }

}
 
function removeAllHightlights(){
  let highlightedSquares = document.querySelectorAll(".highlighted");
    for (let square of highlightedSquares){
      square.classList.remove("highlighted")
    };
}

function highlight(moves) { //sets all squares with legal moves as highlighted
  for (let index of moves) {
    let square = document.getElementsByClassName(`${index}`)[0];
    square.classList.add("highlighted");
  }
}

function resetAllSqaures(){
  let highlightedSquares = document.querySelectorAll(".square");
    for (let square of highlightedSquares){
      if (square.classList.contains("piece")) {square.classList.remove("piece"); square.removeChild(square.firstElementChild)}
      if (square.classList.contains("empty")) {square.classList.remove("empty")}
    };
}