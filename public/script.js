prevSquare = null
let currentBoard = null
const currentURL = "https://chessweb-98le.onrender.com/"
//const currentURL = "http://localhost:8080/"

function createBoard() {

    const columnName = {
        0 : 'A',
        1 : 'B',
        2 : 'C',
        3 : 'D',
        4 : 'E',
        5 : 'F',
        6 : 'G',
        7 : 'H'
    };

    let chessboard = document.getElementById("chessboard");

    for (let row = 7; row >= 0; row--) {
        const newRow = document.createElement('div');
        newRow.setAttribute('row', row);

        for (let column = 0; column <= 7; column++) {
            //Create all the attributes for a square
            const index = (row * 8) + column;
            const squareNotation = columnName[column] + String(row + 1);
            const newSquare = document.createElement('div');
            const color = ((column + row)%2 == 1)? 'white' : 'black';

            //Add all the created attributes to the square
            newSquare.setAttribute('index', index);
            newSquare.setAttribute('squareNotation', squareNotation);
            newSquare.setAttribute('column', column);
            newSquare.setAttribute('highlighted', 'False')
            newSquare.setAttribute('color', color);

            newRow.appendChild(newSquare);//Add the new square to the row
        }
        chessboard.appendChild(newRow); // Add the row to the board
    }
}

function resetBoard() {
    for (let index = 0; index <= 63; index ++){
        const square = document.querySelector(`[index="${index}"]`);
        if (square.children.length > 0) {
            const child = square.children[0]
            square.removeChild(child)
        }
    }
}

function setBoard(board) {
    currentBoard = board
    resetBoard()
    for (let index = 0; index <= 63; index ++){
        const piece = board[index]

        const pieceStyleDropDown = document.getElementById('pieceStyleDropDown')
        const pieceStylePath = pieceStyleDropDown.value

        if (piece) {
            const square = document.querySelector(`[index="${index}"]`);
            const img = document.createElement('img');
            img.src = `pieceImages/${pieceStylePath}/${piece}.png`;
            img.classList.add("pieceImage");
            square.appendChild(img);
        }
    }
}

function initGame() {

    createBoard()
    const start = performance.now();

    fetch(currentURL + "api/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => response.json())
    .then((data) => {
        const end = performance.now(); 
        console.log(`API call time to create board: ${end - start} milliseconds`);
        setBoard(data)})
    .catch((error) => console.error("Error:", error));

    const end = performance.now();
    
    
}

initGame()


//Add event listener to every square.
for (let index = 0; index <= 63; index++) {
    const square = document.querySelector(`[index="${index}"]`)
    square.addEventListener('click', (event) => {
        squarePressed(square);
    })
}

function squarePressed(square) {
    isSquareHighlighted = square.getAttribute('highlighted') == "True"? true : false
    if (square.children.length > 0 && !isSquareHighlighted) { //if div square has image its child length will be > 0
        const start = performance.now();
        const squareIndex = square.getAttribute('index');
        fetch(currentURL + "api/getMoves", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({'index' : squareIndex})
        })
        .then((response) => response.json())
        .then((data) => {
            const end = performance.now(); 
            console.log(`API call time generate moves: ${end - start} milliseconds`);
            console.log("legal moves", data);

            
            if(data['moves']) {data['moves'].forEach((index) => highlightSquare(index))}
            
        })
        .catch((error) => console.error("Error:", error));

        prevSquare = square
    }
    else if(prevSquare && isSquareHighlighted){
        let start = performance.now();
        let prevSquareIndex = prevSquare.getAttribute('index')
        let newSquareIndex  = square.getAttribute('index')
        fetch(currentURL + "/api/updateBoard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({'from' : prevSquareIndex, 'to' : newSquareIndex})
        })
        .then((response) => response.json())
        .then((data) => {
            let end = performance.now(); 
            console.log(`API call time get new board: ${end - start} milliseconds`);
            console.log(data)

            setBoard(data['Board']);
            let checkMateDiv = document.getElementById("checkmate")
            if (data['isCheckMate']) {checkMateDiv.textContent = "CHECKMATE"}
        })
        .catch((error) => console.error("Error:", error));

        start = performance.now();


        fetch(currentURL + "/api/AIMove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
        .then((response) => response.json())
        .then((data) => {
            end = performance.now(); 
            console.log(`API call time get new board: ${end - start} milliseconds`);
            console.log(data)

            setBoard(data['Board']);
            checkMateDiv = document.getElementById("checkmate")
            if (data['isCheckMate']) {checkMateDiv.textContent = "CHECKMATE"}
        })
        .catch((error) => console.error("Error:", error));
    }
    removeAllHighlights()
}

function highlightSquare(index){
    let square = document.querySelector(`[index="${index}"]`)
    square.setAttribute('highlighted', 'True')
}

function removeAllHighlights() {
    const squares = document.querySelectorAll(`[highlighted="True"]`)
    if (squares) {squares.forEach((square) => square.setAttribute('highlighted', 'False'))}
}

//remake board with different piece style of value change
const pieceStyleDropDown = document.getElementById('pieceStyleDropDown')
pieceStyleDropDown.addEventListener("change", () => {
        setBoard(currentBoard)
    }
)