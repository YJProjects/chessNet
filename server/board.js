const {legalMoves, getPsuedoMoves, getPieceMoves} = require("./moves");

class Piece {
    constructor(type, color, index) {
        this.type = type;
        this.color = color;
    }
}

class Square {
    constructor(index){
        this.index = index;
        this.piece = null;
        this.column = this.getColumn(index)
        this.row = this.getRow(index)
    }

    setPiece(type, color) {
        this.piece = new Piece(type, color, this.index);
    }

    getRow(index) {
        return Math.floor(index / 8)
    }

    getColumn(index) {
        return Math.floor(index % 8)
    }

    containsPiece() {
        return this.piece? true : false
    }
}

class Board {
    constructor(){
        this.pieces = ['Pawn' , 'Rook', 'Bishop', 'Knight', 'Queen', 'King']
        this.colors = ['Black', 'White']
        this.colorSwap = {'White' : 'Black', 'Black' : 'White'}

        this.EnPassantIndex = null
        this.EnPassantPieceCaptureIndex = null //This index of the piece which will be captured whne we enpassant

        this.canWhiteKingSideCastle = true
        this.canBlackKingSideCastle = true
        this.canWhiteQueenSideCastle = true
        this.canBlackQueenSideCastle = true
        
        this.squares = {}
        this.initBoard()

        this.Board = this.getSquareIndexToPiece()

        this.color = "White"
    }

    initBoard() {
        for (let index = 0; index <= 63; index++) {
                const newSquare = new Square(index)
                this.squares[index] = newSquare
            }

        this.getSquare(0).setPiece('Rook', 'White')
        
        //All White non pawn Pieces
        this.getSquare(0).setPiece('Rook', 'White');
        this.getSquare(1).setPiece('Knight', 'White');
        this.getSquare(2).setPiece('Bishop', 'White');
        this.getSquare(3).setPiece('Queen', 'White');
        this.getSquare(4).setPiece('King', 'White');
        this.getSquare(5).setPiece('Bishop', 'White');
        this.getSquare(6).setPiece('Knight', 'White');
        this.getSquare(7).setPiece('Rook', 'White');

        //All White Pawns
        for (let i = 8; i <= 15; i++) {
            this.getSquare(i).setPiece('Pawn', 'White');
        }

        //All Black non pawn Pieces
        this.getSquare(56).setPiece('Rook', 'Black');
        this.getSquare(57).setPiece('Knight', 'Black');
        this.getSquare(58).setPiece('Bishop', 'Black');
        this.getSquare(59).setPiece('Queen', 'Black');
        this.getSquare(60).setPiece('King', 'Black');
        this.getSquare(61).setPiece('Bishop', 'Black');
        this.getSquare(62).setPiece('Knight', 'Black');
        this.getSquare(63).setPiece('Rook', 'Black');

        //All Black pawns
        for (let i = 48; i <= 55; i++) {
            this.getSquare(i).setPiece('Pawn', 'Black');
        }
    }

    clone() {
        const newBoard = new Board();

        // Deep clone squares and pieces
        newBoard.squares = {};
        for (let i = 0; i < 64; i++) {
            const oldSquare = this.squares[i];
            const newSquare = new Square(oldSquare.index);
            
            if (oldSquare.piece) {
                const p = oldSquare.piece;
                newSquare.piece = new Piece(p.type, p.color, p.index);
            }

            newBoard.squares[i] = newSquare;
        }

        newBoard.Board = this.getSquareIndexToPiece(); // rebuild string-based board
        newBoard.color = this.color;
        newBoard.EnPassantIndex = this.EnPassantIndex;
        newBoard.EnPassantPieceCaptureIndex = this.EnPassantPieceCaptureIndex;
        
        return newBoard;
    }

    getSquare(index) {
        if (index < 0 || index > 63) return null;
        return this.squares[index]
    }

    getSquareIndexToPiece() {
        let squareIndexToPiece = {}
        for (let index = 0; index <= 63; index++) {
            const piece = this.getSquare(index).piece
            
            if (piece) {
                squareIndexToPiece[index] = piece.type + "_" + piece.color
            }
            else {
                squareIndexToPiece[index] = false
            }
        }
        return squareIndexToPiece
    }

    movePiece(from, to, callAIMove = false) {
        if (from < 0 || from > 63 || to < 0 || to > 63) {
            throw new Error(`Illegal board index: from=${from}, to=${to}`);
        }
        this.setEnPassant(from, to)
        //move the piece on the board
        const startPiece = this.squares[from].piece
        this.squares[from].piece = null
        if (to === this.EnPassantIndex) {
            this.squares[this.EnPassantPieceCaptureIndex].piece = null; 
            this.EnPassantIndex  = false
            this.EnPassantPieceCaptureIndex = null
        }

        this.squares[to].piece = startPiece

        //check for pawn promotion
        const newSquare = this.getSquare(to)
        if (newSquare.piece.type == "Pawn" && (56 <= to && to <= 63) && newSquare.piece.color == "White") { //Piece is a pawn, is white color and in the last row
            this.squares[to].piece = new Piece("Queen", "White", to)
        }
        if (newSquare.piece.type == "Pawn" && (0 <= to && to <= 7) && newSquare.piece.color == "Black") { //Piece is a pawn, is white color and in the last row
            this.squares[to].piece = new Piece("Queen", "Black", to)
        } 

        //check if move was a castle
        if (from == 4 && to == 6 && startPiece.type == "King") {//king moves from 4 to 6
            this.squares[5].piece = this.squares[7].piece
            this.squares[7].piece = null
        }
        if (from == 4 && to == 2 && startPiece.type == "King") {
            this.squares[3].piece = this.squares[0].piece
            this.squares[0].piece = null
        }
        if (from == 60 && to == 58 && startPiece.type == "King") {
            this.squares[5].piece = this.squares[7].piece
            this.squares[7].piece = null
        }
        if (from == 60 && to == 62 && startPiece.type == "King") {
            this.squares[59].piece = this.squares[56].piece
            this.squares[56].piece = null
        }
        
        
        //check if castle rights have been removes
        if (!this.getSquare(4).piece || this.getSquare(4).piece.type != "King") {
            this.canWhiteKingSideCastle = false
            this.canWhiteQueenSideCastle = false
        }
        if (!this.getSquare(7).piece || this.getSquare(7).piece.type != "Rook" || this.getSquare(7).piece.color != "White") {
            this.canWhiteKingSideCastle = false
        }
        if (!this.getSquare(0).piece ||  this.getSquare(0).piece.type != "Rook" || this.getSquare(0).piece.color != "White") {
            this.canWhiteQueenSideCastle = false
        }
        if (!this.getSquare(60).piece || this.getSquare(60).piece.type != "King") {
            this.canBlackKingSideCastle = false
            this.canBlackQueenSideCastle = false
        }
        if (!this.getSquare(63).piece || this.getSquare(63).piece.type != "Rook" || this.getSquare(63).piece.color != "Black") {
            this.canBlackKingSideCastle = false
        }
        if (!this.getSquare(56).piece ||  this.getSquare(56).piece.type != "Rook" || this.getSquare(56).piece.color != "Black") {
            this.canBlackQueenSideCastle = false
        }

        
        this.Board = this.getSquareIndexToPiece() //remake the board
        this.color = this.colorSwap[this.color] //change color

    }

    testMovePiece(from, to) {
        const newBoard = this.clone()
        newBoard.movePiece(from, to)
        return newBoard


    }

    revertState(oldState) {
        this.type = oldState.type;
        this.color = oldState.color;
        this.EnPassantIndex = oldState.EnPassantIndex
        this.EnPassantPieceCaptureIndex = oldState.EnPassantPieceCaptureIndex
        this.color = oldState.color;
        this.Board = oldState.Board;
    }

    setEnPassant(from, to) {
        const enPassantRange = {'White' : [8 , 15], 'Black' : [48, 55]}
        const enPassantPush = {'White' : 8, 'Black' : -8}
        const square = this.getSquare(from)

        if (!square.piece || !(square.piece.type == 'Pawn')) {return} //piece must be a pawn
        if (!(Math.abs(from - to) == 16)) {return} //row different must be 16
        if (!(enPassantRange[square.piece.color][0] <= from && from <= enPassantRange[square.piece.color][1])) {return} //piece must be in correct row
        
        const westSquare = this.getSquare(to - 1)
        const eastSquare = this.getSquare(to + 1)

        const adjSquares = [westSquare, eastSquare]

        adjSquares.forEach(element => {
            if (!element.piece) {return}
            if (!element.piece.type) {return}
            if (element.piece.type == "Pawn" && element.piece.color != square.piece.color) {
                this.EnPassantIndex = to + enPassantPush[element.piece.color];
                this.EnPassantPieceCaptureIndex = to
                return
            }
        });
        
    }


    isKingInCheck() {
        let kingIndex = null
        for (let index = 0; index<=63; index++) {
            const square = this.squares[index]
            if (square.containsPiece() && square.piece.type == "King" && square.piece.color == this.color) {
                kingIndex = index
                break
            }
        }
        
        let enemyTargetedSquares = []

        for (let index = 0; index<=63; index++) {
            const square = this.squares[index]
            if (square.containsPiece() && square.piece.color != this.color) {
                const enemyMoves = getPsuedoMoves(this, index)
                enemyTargetedSquares = enemyTargetedSquares.concat(enemyMoves)
            }
        }

        if (enemyTargetedSquares.includes(kingIndex)) {return true}
        else {return false}
    }

    isCheckMate() {
        let moves = []
        for (let i = 0; i<=63 ; i++) {
            const square = this.getSquare(i)
            if (square.containsPiece() && square.piece.color == this.color) {
                const newMoves = getPieceMoves(this, i)
                moves = moves.concat(newMoves)
            }
        }

        if (moves.length == 0) {
            return true
        }
        else {
            return false
        }
    }

    //Code for AI

    getAllAvailibleMoves() {
        let indexToMoves = {}
        for (let i = 0; i <= 63; i++) {
            const square = this.getSquare(i)
            if (square.containsPiece() && square.piece.color == this.color) { 
                const moves = getPieceMoves(this, i)
                if (moves.length > 0) {indexToMoves[i] = moves}
            }
        }

        return indexToMoves
    }

    randomMove() {
        const indexToMoves = this.getAllAvailibleMoves()

        if (Object.keys(indexToMoves).length === 0) {return null}

        const pieces = Object.keys(indexToMoves)
        const randomPieceIndex = Math.floor(Math.random() * pieces.length)
        const randomPiece = pieces[randomPieceIndex]

        const moves = indexToMoves[randomPiece]
        const randomMoveIndex = Math.floor(Math.random() * moves.length)
        const randomMove = moves[randomMoveIndex]

        return [randomPiece, randomMove]
    }

    playAIMove() {
        const moveGen =  this.getAIMove()

        if (!moveGen) {return}
        const from = moveGen[0]
        const to = moveGen[1]

        this.movePiece(from, to)
        
    }

    evalBoard() {
        const pieceValue = {
            'Pawn' : 1,
            'Bishop' : 3,
            'Knight' : 4,
            'Rook' : 5,
            'Queen' : 8,
            'King' : 1000
        }

        let evalValue = 0
        for (let index = 0; index <= 63; index++) {
            const square = this.getSquare(index)
            if (square.piece && square.piece.color == "White") {
                evalValue += pieceValue[square.piece.type]
            }
            else if (square.piece && square.piece.color == "Black") {
                evalValue -= pieceValue[square.piece.type]
            }
        }

        if (this.isKingInCheck()) {
            if (this.color == "Black") {evalValue += 1000}
            if (this.color == "White") {evalValue -= 1000}
        }

        return evalValue
    }

    getAIMove() {
    function minimax(board, depth, alpha, beta, isMaximizingPlayer) {
        if (board.isCheckMate()) {
            return [null, null, isMaximizingPlayer ? -Infinity : Infinity];
        }
        if (depth === 0) {
            return [null, null, board.evalBoard()];
        }

        let bestFrom = null;
        let bestTo = null;

        const pieceIndexToMoveIndex = board.getAllAvailibleMoves();
        const pieceIndexes = Object.keys(pieceIndexToMoveIndex).map(Number);
        let leaveLoop = false

        if (isMaximizingPlayer) {
            let bestEval = -Infinity;
            

            for (let pieceIndex of pieceIndexes) {
                for (let moveIndex of pieceIndexToMoveIndex[pieceIndex]) {
                    const newBoard = board.testMovePiece(pieceIndex, moveIndex);

                    const [_, __, evalScore] = minimax(newBoard, depth - 1, alpha, beta, false);

                    if (evalScore > bestEval) {
                        bestEval = evalScore;
                        bestFrom = pieceIndex;
                        bestTo = moveIndex;
                    }

                    alpha = Math.max(evalScore, alpha)
                    if (beta <= alpha) {
                        leaveLoop = true
                        break
                    }
                }
                if (leaveLoop) {break}
            }

            return [bestFrom, bestTo, bestEval];

        } else {
            let bestEval = Infinity;

            for (let pieceIndex of pieceIndexes) {
                for (let moveIndex of pieceIndexToMoveIndex[pieceIndex]) {
                    const newBoard = board.testMovePiece(pieceIndex, moveIndex);

                    const [_, __, evalScore] = minimax(newBoard, depth - 1, alpha, beta, true);

                    if (evalScore < bestEval) {
                        bestEval = evalScore;
                        bestFrom = pieceIndex;
                        bestTo = moveIndex;
                    }

                    beta = Math.min(evalScore, beta)
                    if (beta <= alpha) {
                        leaveLoop = true
                        break
                    }
                }
                if (leaveLoop) {break}
            }

            return [bestFrom, bestTo, bestEval];
        }
    }

    const [from, to, _] = minimax(this, 3, -Infinity, Infinity, false);
    return [from, to];
}


    

}

module.exports = Board