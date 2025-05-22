const Board = require("./board")
const {legalMoves} = require("./moves")

let gameBoard = null

function createBoard() {
    gameBoard = new Board
    console.log("New Board Created! ")
    return gameBoard.Board
}

function getMoves(index) {
    return legalMoves(gameBoard, index)
}

function getAIMoves() {
    gameBoard.playAIMove()
    return gameBoard
}

function updateBoard(from, to) {
    gameBoard.movePiece(from, to, callAIMove = true )
    return gameBoard
}

module.exports = {createBoard, getMoves, updateBoard, getAIMoves}