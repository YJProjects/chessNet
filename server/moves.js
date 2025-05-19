function pawnMoves(Board, index){
    let moves = []

    //Getting single and double pushes
    const square = Board.getSquare(index) //get square from index
    const piece = square.piece //get the piece on that square

    const pushValues = {'White' :  8, 'Black' : -8}
    const pushValue = pushValues[piece.color]

    const singlePushSquare = Board.getSquare(index + pushValue) //get the new square ahead of pawn

    if (singlePushSquare && !singlePushSquare.containsPiece()) { //checking if new square exists in the board and it doesn't have a piece in it
        moves.push(singlePushSquare.index)

        const doublePushRange = {'White' :  [8, 15], 'Black' :  [48, 55]}
        const doublePushSquare = Board.getSquare(index + (2 * pushValue)) //get the new square two squares ahead of pawn

        if (doublePushSquare && !doublePushSquare.containsPiece()) { //check if the two squares ahead of the pawn is empty
            if (doublePushRange[piece.color][0] <= square.index && square.index <= doublePushRange[piece.color][1]) { //check we are in the correct row
                moves.push(doublePushSquare.index)
            }
        }
    }

    //Getting piece attacks
    const attackValues = {'White' :  [7, 9], 'Black' :  [-9, -7]}

    const westAttackValue = attackValues[piece.color][0]
    const eastAttackValue = attackValues[piece.color][1]

    const westAttackSquare = Board.getSquare(square.index + westAttackValue)
    const eastAttackSquare = Board.getSquare(square.index + eastAttackValue)

    const attackSquares = [westAttackSquare, eastAttackSquare]
    
    attackSquares.forEach(attackSquare => {
        if (!attackSquare || !attackSquare.containsPiece()) return//attack square exists, has a piece and is of opposite color
        if (piece.color == attackSquare.piece.color) return
        
        const attackSquareRow = attackSquare.column
        const pieceSquareRow = square.column
        if(Math.abs(attackSquareRow - pieceSquareRow) == 1) {moves.push(attackSquare.index)} //Difference in columns should be one
    });

    //check enPassant

    if (Board.EnPassant) {moves.push(Board.EnPassant)}

    return moves
}

function knightMoves(Board, index) {
    let moves = []
    const square = Board.getSquare(index)
    const movementDirectionValues = [6, 15, 17, 10, -10, -17, -15, -6]

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
    const movementDirectionValues = [9, 8, 7, 1, -1, -7, -8, -9]

    movementDirectionValues.forEach((movementDirection) => {
        const newIndex = index + movementDirection
        const newSquare = Board.getSquare(newIndex)

        if (!newSquare) {return} //Square is out of bounds
        if (newSquare.containsPiece()){
            if (newSquare.piece.color == square.piece.color) {return} //new square contains piece of same color
        }
        if (Math.abs(newSquare.column - square.column) > 1) {return} //Square teleported from edge of board making column value too high
        if (Math.abs(newSquare.row - square.row) > 1) {return} //Square teleported from edge of board making column value too high
        moves.push(newIndex)
    })

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

function isKingInCheck(Board) {
        let kingIndex = null
        for (let index = 0; index<=63; index++) {
            const square = Board.squares[index]
            if (square.containsPiece() && square.piece.type == "King" && square.piece.color == Board.color) {
                kingIndex = index
                break
            }
        }
        
        let enemyTargetedSquares = []

        for (let index = 0; index<=63; index++) {
            const square = Board.squares[index]
            if (square.containsPiece() && square.piece.color != Board.color) {
                const enemyMoves = getPsuedoMoves(Board, index)
                enemyTargetedSquares = enemyTargetedSquares.concat(enemyMoves)
            }
        }

        if (enemyTargetedSquares.includes(kingIndex)) {return true}
        else {return false}
    }
function getPsuedoMoves(Board, index){
    console.log(Board)
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

function genMoves(Board, index) {
    const piece = Board.getSquare(index).piece
    if (Board.color != piece.color) return []

    let moves = []

    const psuedoMoves = getPsuedoMoves(Board, index)

    if (psuedoMoves.length <= 0) {return []}

    if (!isKingInCheck(Board)) {return psuedoMoves}

    psuedoMoves.forEach((move) => {
        const newBoard = Board.testMovePiece(index, move)
        if (isKingInCheck(newBoard)) return
        
        moves.push(move)
    })
    return moves
    
}

module.exports = {genMoves}