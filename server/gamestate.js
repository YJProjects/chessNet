const {Board} = require("./board")

let gameBoard = null

function createBoard() {
    gameBoard = new Board()
    console.log("New Board Created! ")
    return gameBoard.getPieceBoard()
}

function getPlayerMoves(index) {
    start = performance.now();

    const moves = gameBoard.playerMoves(BigInt(index))

    end = performance.now();
    console.log(`Time get piece moves: ${end - start} milliseconds`);

    return moves
}

function getAIMoves() {
    gameBoard.playAIMove()
    return gameBoard
}

function updateBoard(from, to) {
    gameBoard.updateBoard(BigInt(from), BigInt(to))
    return gameBoard
}

module.exports = {createBoard, getPlayerMoves, updateBoard, getAIMoves}