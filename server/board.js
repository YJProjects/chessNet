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

    isOccupied() {
        return (this.piece)? True : False;
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

        this.EnPassantIndex = false
        this.EnPassantPieceCaptureIndex = false //This index of the piece which will be captured whne we enpassant
        

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
        if (!(0 <= index <= 63)) {return null}
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

    movePiece(from, to) {
        this.setEnPassant(from, to)
        //move the piece on the board
        const startPiece = this.squares[from].piece
        this.squares[from].piece = null
        if (to === this.EnPassant) {
            this.squares[this.EnPassantPieceCaptureIndex].piece = null; 
            this.EnPassant = false
            this.EnPassantPieceCaptureIndex = null
        }
        this.squares[to].piece = startPiece

        
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
        this.EnPassantIndex = oldState.false
        this.EnPassantPieceCaptureIndex = oldState.false 
        this._savedState = oldState.null
    }

    setEnPassant(from, to) {
        const enPassantRange = {'White' : [8 , 15], 'Black' : [48, 55]}
        const enPassantPush = {'White' : 8, 'Black' : -8}
        const square = this.getSquare(from)

        if (!square.piece.type == 'Pawn') {return} //piece must be a pawn
        if (!(Math.abs(from - to) == 16)) {return} //row different must be 16
        if (!(enPassantRange[square.piece.color][0] <= from && from <= enPassantRange[square.piece.color][1])) {return} //piece must be in correct row
        
        const westSquare = this.getSquare(to - 1)
        const eastSquare = this.getSquare(to + 1)

        const adjSquares = [westSquare, eastSquare]

        adjSquares.forEach(element => {
            if (!element.piece) {return}
            if (!element.piece.type) {return}
            if (element.piece.type == "Pawn" && element.piece.color != square.piece.color) {
                this.EnPassant = to + enPassantPush[element.piece.color];
                this.EnPassantPieceCaptureIndex = to
                return
            }
        });
        
    }

}

module.exports = Board