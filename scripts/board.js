let chessboard = document.getElementById("chessBoard");
let gameStartFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

for (let row = 0; row <= 7; row++){
    const newRow =document.createElement('div');
    newRow.classList.add("row");

    for (let column = 0; column <= 7; column++){
        const newSquare = document.createElement('div');

        const index = 63 - ((row  * 8) + column)
        
        newSquare.classList.add("square")
        newSquare.classList.add((row + column) % 2 == 0 ? "light" : "dark");
        newSquare.classList.add(index);
        newRow.appendChild(newSquare);
    }

    chessboard.appendChild(newRow);
}



function setBoard(FEN) {
  const board = [];
  const rows = FEN.split(' ')[0].split('/');

  for (let row of rows) {
    const boardRow = [];
    for (let char of row) {
      if (isNaN(char)) {
        boardRow.push(char); 
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          boardRow.push(null);
        }
      }
    }
    board.push(boardRow);
    }

    let index = 0
    let temp = document.getElementsByClassName('0')[0]
    console.log(temp.classList)
    for (let row of board) {
        for (let piece of row) {
            let square = document.getElementsByClassName(String(index))[0]
            console.log(index, `{String(index)`)
            if (piece != null){
                square.classList.add(piece)
            }
            else {
                square.classList.add('empty')
            }
            index++
        }
    }
}


setBoard(gameStartFen);