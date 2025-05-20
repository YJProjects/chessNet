const Board = require("./board")
const {legalMoves} = require("./moves")

class AI extends Board {
    constructor(gameBoard) { //Creates new functions needed for the AI
        super()
        this.EnPassantIndex = gameBoard.EnPassantIndex
        this.EnPassantPieceCaptureIndex = gameBoard.EnPassantIndex//This index of the piece which will be captured whne we enpassant

        this.squares = gameBoard.squares
        this.Board = gameBoard.Board

        this.color = gameBoard.color
    }

    getAllAvailibleMoves() {
        let indexToMoves = {}
        for (let i = 0; i <= 63; i++) {
            const square = this.getSquare(i)
            if (square.containsPiece() && square.piece.color == this.color) { 
                indexToMoves[i] = legalMoves(this, i)
            }
        }

        return indexToMoves
    }

    randomMove() {
        const indexToMoves = this.getAllAvailibleMoves()

        const pieces = Object.keys(indexToMoves)
        const randomPieceIndex = Math.floor(Math.random() * pieces.length)
        const randomPiece = pieces[randomPieceIndex]

        const moves = indexToMoves[randomPiece]
        const randomMoveIndex = Math.floor(Math.random() * moves.length)
        const randomMove = moves[randomMove]

        return randomMove
    }
}

module.exports = AI