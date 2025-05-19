const Board = require("./board")
const {genMoves} = require("./moves")

let gameBoard = null

function createBoard() {
    gameBoard = new Board
    console.log("New Board Created! ")
    return gameBoard.Board
}

function getMoves(index) {
    return genMoves(gameBoard, index)
}

function updateBoard(from, to) {

    gameBoard.movePiece(from, to)
    return gameBoard.Board
}

module.exports = {createBoard, getMoves, updateBoard}