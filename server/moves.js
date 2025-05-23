function pawnMoves(Board, index){
    let moves = []

    //Getting single and double pushes
    const square = Board.getSquare(index) //get square from index
    const piece = square.piece //get the piece on that square

    const pushValues = {'White' :  8, 'Black' : -8}
    const pushValue = pushValues[piece.color]

    const singlePushSquare = Board.getSquare(index + pushValue) //get the new square ahead of pawn

    if (!singlePushSquare?.containsPiece()) { //checking if new square exists in the board and it doesn't have a piece in it
        moves.push(singlePushSquare.index)

        const doublePushRange = {
            'White' :  {'leftEnd': 8, 'rightEnd' : 15},
            'Black' :  {'leftEnd': 48, 'rightEnd' : 55}
        }
        const doublePushSquare = Board.getSquare(index + (2 * pushValue)) //get the new square two squares ahead of pawn

        if (!doublePushSquare?.containsPiece()) { //check if the two squares ahead of the pawn is empty
            if (doublePushRange[piece.color]['leftEnd'] <= square.index && square.index <= doublePushRange[piece.color]['rightEnd']) { //check pawn are in the correct row
                moves.push(doublePushSquare.index)
            }
        }
    }

    //Getting piece attacks

    const attackValues = { //defualt values 
        'White' :  {'West' : 7, 'East': 9},
        'Black' :  {'West' : -9, 'East': -7}
        }


    const westAttackValue = attackValues[piece.color]['West']
    const eastAttackValue = attackValues[piece.color]['East']

    const westAttackSquare = Board.getSquare(square.index + westAttackValue)
    const eastAttackSquare = Board.getSquare(square.index + eastAttackValue)

    const attackSquares = [westAttackSquare, eastAttackSquare]
    
    attackSquares.forEach(attackSquare => {
        if (!attackSquare || !attackSquare.containsPiece()) return //If attack square is Out of Bounds or It's empty we exit
        if (piece.color == attackSquare.piece.color) return //If piece is of same color we exit
        
        const attackSquareRow = attackSquare.column
        const pieceSquareRow = square.column

        if(Math.abs(attackSquareRow - pieceSquareRow) == 1) {moves.push(attackSquare.index)} //Difference in columns should be one so we don't warp around the board
    });

    //check enPassant

    if (Board.EnPassant) {moves.push(Board.EnPassant)}

    return moves
}

function knightMoves(Board, index) {
    let moves = []
    const square = Board.getSquare(index)
    const movementDirectionValues = [6, 15, 17, 10, -10, -17, -15, -6] //All attack directions

    movementDirectionValues.forEach((movementDirection) => {
        const newIndex = index + movementDirection
        const newSquare = Board.getSquare(newIndex)

        if (!newSquare) {return} //Square is out of bounds
        if (newSquare.containsPiece()){
            if (newSquare.piece.color == square.piece.color) {return} //new square contains piece of same color
        }
        if (Math.abs(newSquare.column - square.column) > 2) {return} //Square teleported from edge of board making column value too high
        moves.push(newIndex)
    })

    return moves
}

function kingMoves(Board, index) {
    let moves = []
    const square = Board.getSquare(index)
    const movementDirectionValues = [9, 8, 7, 1, -1, -7, -8, -9] //All king directions

    movementDirectionValues.forEach((movementDirection) => {
        const newIndex = index + movementDirection
        const newSquare = Board.getSquare(newIndex)

        if (!newSquare) {return} //Square is out of bounds

        if (newSquare.piece?.color === square.piece.color) {return} //new square contains piece of same color

        if (Math.abs(newSquare.column - square.column) > 1) {return} //Square teleported from horizontal edge of board making column value too high

        if (Math.abs(newSquare.row - square.row) > 1) {return} //Square teleported from vertical edge of board making column value too high

        moves.push(newIndex)
    })

    //castle checks
    if (Board.canWhiteKingSideCastle && square.piece.color == 'White') { //Check if a white king can queen side castle
        const F1Square = Board.getSquare(5)
        const G1Square = Board.getSquare(6)

        if (!F1Square.containsPiece() && !G1Square.containsPiece()) { // Both squares are empty
            moves.push(6)
        }
    }

    if (Board.canWhiteQueenSideCastle && square.piece.color == 'White') { //Check if a white king can queen side castle
        const B1Square = Board.getSquare(1)
        const C1Square = Board.getSquare(2)
        const D1Square = Board.getSquare(3)

        if (!B1Square.containsPiece() && !C1Square.containsPiece() && !D1Square.containsPiece()) { // Both squares are empty
            moves.push(2)
        }
    }

    if (Board.canBlackKingSideCastle && square.piece.color == 'Black') { //Check if a white king can queen side castle
        const F8Square = Board.getSquare(61)
        const G8Square = Board.getSquare(62)

        if (!F8Square.containsPiece() && !G8Square.containsPiece()) { // Both squares are empty
            moves.push(62)
        }
    }

    if (Board.canBlackQueenSideCastle && square.piece.color == 'Black') { //Check if a white king can queen side castle
        const B8Square = Board.getSquare(57)
        const C8Square = Board.getSquare(58)
        const D8Square = Board.getSquare(58)

        if (!B8Square.containsPiece() && !C8Square.containsPiece() && !D8Square.containsPiece()) { // Both squares are empty
            moves.push(58)
        }
    }

    return moves
}

function rookMoves(Board, index) {
    const square = Board.getSquare(index)
    let moves = []

    const rowLeftEnd = square.row * 8
    const rowRightEnd = rowLeftEnd + 7

    const columnBottomEnd = square.column
    const columnTopEnd = columnBottomEnd + 56

    let indexCopy = index + 1
    while (indexCopy <= rowRightEnd) { //Move right
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy++
    }

    indexCopy = index - 1
    while (indexCopy >= rowLeftEnd) { //Move left
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy--
    }

    indexCopy = index + 8
    while (indexCopy <= columnTopEnd) { //Move up
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy += 8
    }

    indexCopy = index - 8
    while (indexCopy >= columnBottomEnd) { //Move down
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy -= 8
    }


    return moves
}

function bishopMoves(Board, index) {
    const square = Board.getSquare(index)
    let moves = []

    let indexCopy = index + 9
    while (indexCopy <= 63 && Board.getSquare(indexCopy).column > Board.getSquare(indexCopy - 9).column) { //Move up-right
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy += 9
    }

    indexCopy = index + 7
    while (indexCopy <= 63 && Board.getSquare(indexCopy).column < Board.getSquare(indexCopy - 7).column) { //Move up-left
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy += 7
    }

    indexCopy = index - 9
    while (indexCopy >= 0 && Board.getSquare(indexCopy).column < Board.getSquare(indexCopy + 9).column) { //Move down-left
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy -= 9
    }

    indexCopy = index - 7
    while (indexCopy >= 0 && Board.getSquare(indexCopy).column > Board.getSquare(indexCopy + 7).column) { //Move down-right
        const newSquare = Board.getSquare(indexCopy)
        if (newSquare.containsPiece()) {
            if (newSquare.piece.color != square.piece.color) { moves.push(indexCopy) }
            break
        }
        moves.push(indexCopy)
        indexCopy -= 7
    }

    return moves
}

function queenMoves(Board, index) {
    const rook = rookMoves(Board, index)
    const bishop = bishopMoves(Board, index)
    return rook.concat(bishop)
}


function getPsuedoMoves(Board, index){
    const piece = Board.getSquare(index).piece

    if (piece.type == 'Pawn') {
        return pawnMoves(Board, Number(index))
    }
    else if (piece.type == 'Knight') {
        return knightMoves(Board, Number(index))
    }
    else if (piece.type == 'King') {
        return kingMoves(Board, Number(index))
    }
    else if (piece.type == 'Rook') {
        return rookMoves(Board, Number(index))
    }
    else if (piece.type == 'Bishop') {
        return bishopMoves(Board, Number(index))
    }
    else if (piece.type == 'Queen') {
        return queenMoves(Board, Number(index))
    }
}

function filterMoves(Board, psuedoMoves, index) {

    let moves = []

    psuedoMoves.forEach((move) => {
        const newBoard = Board.testMovePiece(index, move)
        newBoard.color = newBoard.colorSwap[newBoard.color]
        if (newBoard.isKingInCheck()) {return}
        
        moves.push(move)
    })
    return moves
}

function getPieceMoves(Board, index) {
    const piece = Board.getSquare(index).piece

    if (Board.color != piece.color) return []
    const psuedoMoves = getPsuedoMoves(Board, index)
    const moves = filterMoves(Board, psuedoMoves, index)
    return moves
}

function legalMoves(Board, index) {
    
    let moves = []
    if (Board.color == "White") {
        moves = getPieceMoves(Board, index)
    }
    else {
        moves = []
    }
    return moves
}


module.exports = {legalMoves, getPsuedoMoves, getPieceMoves}