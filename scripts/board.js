import API from "./apiCall.js";

function setBoard(FEN) {

  const piece_FEN = FEN.split(" ")[0];
  const rows = piece_FEN.split("/");

  let index = 0;
  for (let row of rows) {
    for (let piece of row) {
      if (!isNaN(piece)) { //It is a number

        for (let i = 0; i<Number(piece); i++) {
          let square = document.getElementsByClassName(index)[0]
          square.classList.add("empty")
          index++
        }
      }
      else {
          let square = document.getElementsByClassName(index)[0]
          let piece_img = document.createElement('img')
          
          square.classList.add('piece');
          
          if (piece === piece.toUpperCase()) {
            piece = piece.toUpperCase() + "D";
          }
          else {
            piece = piece.toLowerCase() + "l"
          }
          
          piece_img.src = `../../images/pieces/${piece}.svg`
          square.appendChild(piece_img)
          index++
        
      }
  }
}
}


let chessboard = document.getElementById("chessBoard");
let gameStartFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

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
const pieces = document.getElementsByClassName('piece')
for (let piece of pieces){
  piece.addEventListener("click", API)
}