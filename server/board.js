const { get } = require('http')
const {rookMask} = require('./magicBitBoard')

class Bitboard {
    constructor(value = 0n) {
        this.bitboard = BigInt.asUintN(64, value)
    }

    //static bitboard functions
    isEqual(a, b) { 
        return a == b
    }

    intersection(a, b) {
        return a & b
    }

    union(a, b) {
        return a | b
    }

    rShift(steps) {
        return this.bitboard >> steps
    }

    lShift(steps) {
        return this.bitboard << steps
    }

    not() {
        return ~this.bitboard & 0xFFFFFFFFFFFFFFFFn
    }

    setBit(index) {
        return this.bitboard |= (1n << index)
    }

    unsetBit(index) {
        return this.bitboard &= ~(1n << index) & 0xFFFFFFFFFFFFFFFFn
    }  


    isOne(index) {
        return ((this.bitboard >> index) & 1n) == 1n ? true : false
    }

    printBoard() {
        const bits = this.bitboard.toString(2).padStart(64, '0')
        for (let row = 0; row < 8; row++) {
        console.log(bits.slice(row * 8, row * 8 + 8).split('').reverse().join(' '))
        }
    }

    /**
     * @returns A list of indexes where bit is set to one in the bitboard
     */
    bitboardToIndexes() {
        let activeIndexes = []
        for (let index = 0n; index <= 63n; index++) {
            if (this.isOne(index)) {
                activeIndexes.push(Number(index))
            }
        }

        return activeIndexes
    }

}

/*

REFERENCE:
Hex	Binary
0	0000
1	0001
2	0010
3	0011
4	0100
5	0101
6	0110
7	0111
8	1000
9	1001
A	1010
B	1011
C	1100
D	1101
E	1110
F	1111

*/

class Board {
    constructor() {
        // Pawns
        this.whitePawns = new Bitboard(0x000000000000FF00n)
        this.blackPawns = new Bitboard(0x00FF000000000000n)

        // Rooks
        this.whiteRooks = new Bitboard(0x0000000000000081n)
        this.blackRooks = new Bitboard(0x8100000000000000n)

        // Knights
        this.whiteKnights = new Bitboard(0x0000000000000042n)
        this.blackKnights = new Bitboard(0x4200000000000000n)

        // Bishops
        this.whiteBishops = new Bitboard(0x0000000000000024n)
        this.blackBishops = new Bitboard(0x2400000000000000n)

        // Queens
        this.whiteQueen = new Bitboard(0x0000000000000008n)
        this.blackQueen = new Bitboard(0x0800000000000000n)

        // Kings
        this.whiteKing = new Bitboard(0x0000000000000010n)
        this.blackKing = new Bitboard(0x1000000000000000n)

        this.whitePieces = new Bitboard(this.whitePawns.bitboard | this.whiteRooks.bitboard | this.whiteKnights.bitboard | this.whiteBishops.bitboard | this.whiteQueen.bitboard | this.whiteKing.bitboard)
        this.blackPieces = new Bitboard(this.blackPawns.bitboard | this.blackRooks.bitboard | this.blackKnights.bitboard | this.blackBishops.bitboard | this.blackQueen.bitboard | this.blackKing.bitboard)

        this.board = new Bitboard(this.whitePieces.bitboard | this.blackPieces.bitboard)
        this.empty = new Bitboard(this.board.not())

        this.pieceTypeToBoard = {
            'Pawn_White' : this.whitePawns,
            'Rook_White' : this.whiteRooks,
            'Bishop_White' : this.whiteBishops,
            'Knight_White' : this.whiteKnights,
            'Queen_White' : this.whiteQueen,
            'King_White' : this.whiteKing,
            'Pawn_Black' : this.blackPawns,
            'Rook_Black' : this.blackRooks,
            'Bishop_Black' : this.blackBishops,
            'Knight_Black' : this.blackKnights,
            'Queen_Black' : this.blackQueen,
            'King_Black' : this.blackKing
        }

        this.rookMagicBitboard = this.loadMagicBitBoardsFromFile('/Users/yashas/Projects/chessNet/server/rook_magic_bitboards.json')
        this.bishopMagicBitboard = this.loadMagicBitBoardsFromFile('/Users/yashas/Projects/chessNet/server/bishop_magic_bitboards.json')

        this.currentPlayerColor = "White"

        this.canWhiteKingSideCastle = true
        this.canWhiteQueenSideCastle = true
        this.canBlackKingSideCastle = true
        this.canBlackQueenSideCastle = true
    }

    swapPlayer() {
        this.currentPlayerColor == "White"? this.currentPlayerColor = "Black" : this.currentPlayerColor = "White"
    }

    swapColor(color) {
        if (color == "White") {return "Black"}
        if (color == "Black") {return "White"}
    }

    loadMagicBitBoardsFromFile(filename) {
        const fs = require('fs');
        const jsonData = fs.readFileSync(filename, 'utf-8');

        // Use a reviver to convert BigInt strings back to BigInt
        const data = JSON.parse(jsonData, (_, value) => {
            if (typeof value === 'string' && value.endsWith('n')) {
                return BigInt(value.slice(0, -1)); // remove 'n' and convert
            }
            return value;
        });

        return data;
    }

    getPieceType(index) {
        if (this.whitePawns.isOne(index))    {return 'Pawn_White'}
        if (this.whiteRooks.isOne(index))    {return 'Rook_White'}
        if (this.whiteBishops.isOne(index))  {return 'Bishop_White'}
        if (this.whiteKnights.isOne(index))  {return 'Knight_White'}
        if (this.whiteQueen.isOne(index))    {return 'Queen_White'}
        if (this.whiteKing.isOne(index))     {return 'King_White'}

        if (this.blackPawns.isOne(index))    {return 'Pawn_Black'}
        if (this.blackRooks.isOne(index))    {return 'Rook_Black'}
        if (this.blackBishops.isOne(index))  {return 'Bishop_Black'}
        if (this.blackKnights.isOne(index))  {return 'Knight_Black'}
        if (this.blackQueen.isOne(index))    {return 'Queen_Black'}
        if (this.blackKing.isOne(index))     {return 'King_Black'}

        return null
        
    }

    getPieceBoard() {
        let pieceBoard = {}
        for (let index = 0n; index <= 63n; index++) {
            pieceBoard[index] = this.getPieceType(index)
        }

        return pieceBoard
    }

    getPieceColor(index) {
        if (this.whitePieces.isOne(index)) {return "White"}
        if (this.blackPieces.isOne(index)) {return "Black"}

        throw new Error("Piece not on board i.e. it has no color.")
    }

    updateBoard(from, to) {
        const startPieceType = this.getPieceType(from)
        const startPieceBoard = this.pieceTypeToBoard[startPieceType]
        const endPieceType = this.getPieceType(to)

        const nonCastleKingMoves = [8, 9, 7, 1, -1, -7, -8, -9]

        startPieceBoard.unsetBit(from)
        if (startPieceType == "Pawn_White" & to >= 56 & to <= 63) { //White Pawn promotes
            this.whiteQueen.setBit(to)
        } 
        else if (startPieceType == "Pawn_Black" & to >= 0 & to <= 7) { //Black Pawn promotes
            this.blackQueen.setBit(to)
        }
        else if ((startPieceType == "King_Black" || startPieceType == "King_White") && !nonCastleKingMoves.includes(Math.abs(Number(from - to)))) { //King moves in a non normal way .i.e caastles
            if (startPieceType == "King_White") {
                this.whiteKing.setBit(to)
                let rookFrom = null
                let rookTo = null

                if (to == 6n) {
                    rookFrom = 7n
                    rookTo = 5n
                }
                if (to == 2n) {
                    rookFrom = 0n
                    rookTo = 3n
                }
                this.whiteRooks.unsetBit(rookFrom)
                this.whiteRooks.setBit(rookTo)
            }
            else{
                this.blackKing.setBit(to)
                let rookFrom = null
                let rookTo = null

                if (to == 58n) {
                    rookFrom = 56n
                    rookTo = 59n
                }
                if (to == 62n) {
                    rookFrom = 63n
                    rookTo = 61n
                }
                this.blackRooks.unsetBit(rookFrom)
                this.blackRooks.setBit(rookTo)
            }
        }
        else {
            startPieceBoard.setBit(to)
        }

        
        if (endPieceType) {
            const endPieceBoard = this.pieceTypeToBoard[endPieceType]
            endPieceBoard.unsetBit(to)
        }

        this.whitePieces = new Bitboard(this.whitePawns.bitboard | this.whiteRooks.bitboard | this.whiteKnights.bitboard | this.whiteBishops.bitboard | this.whiteQueen.bitboard | this.whiteKing.bitboard)
        this.blackPieces = new Bitboard(this.blackPawns.bitboard | this.blackRooks.bitboard | this.blackKnights.bitboard | this.blackBishops.bitboard | this.blackQueen.bitboard | this.blackKing.bitboard)

        this.board = new Bitboard(this.whitePieces.bitboard | this.blackPieces.bitboard)
        this.empty = new Bitboard(this.board.not())

        if (to === 7 || from == 7) {
            this.canWhiteKingSideCastle = false
        }
        else if (to === 0 || from == 0) {
            this.canWhiteQueenSideCastle = false
        }
        else if (to === 4 || from == 4) {
            this.canWhiteQueenSideCastle = false
            this.canWhiteKingSideCastle = false
        }

        if (to === 56 || from == 56) {
            this.canBlackQueenSideCastle = false
        }
        else if (to === 63 || from == 63) {
            this.canBlackQueenSideCastle = false
        }
        else if (to === 60 || from == 60) {
            this.canBlackQueenSideCastle = false
            this.canBlackKingSideCastle = false
        }

        this.swapPlayer()
    }

    /**
     * Create a bitboard with bits set in a straight line from `to` to `from` (not including `from`)
     * @param {bigint} from - starting square to exclude
     * @param {bigint} to - ending square to include
     * @returns {bigint} - bitboard with bits set on the line
     */
    createLine(to, from) {
        const toX = Number(to % 8n), toY = Number(to / 8n)
        const fromX = Number(from % 8n), fromY = Number(from / 8n)

        const dx = Math.sign(fromX - toX)
        const dy = Math.sign(fromY - toY)

        let line = 0n
        let x = toX, y = toY

        while (true) {
            x += dx
            y += dy

            if (x === fromX && y === fromY) break
            if (x < 0 || x > 7 || y < 0 || y > 7) break

            let index = BigInt(y * 8 + x)
            line |= 1n << index
        }

        return new Bitboard(line)
    }


    pawnPushes(color, index = null) {
        let pawnBoard = null

        if (index !== null) {
            pawnBoard = new Bitboard(0n)
            pawnBoard.setBit(index)
        }
        else {
            if (color == "White") {pawnBoard = this.whitePawns}
            if (color == "Black") {pawnBoard = this.blackPawns}
        }

        const notRank1 = new Bitboard(0xFFFFFFFFFFFFFF00n)
        const notRank8 = new Bitboard(0x00FFFFFFFFFFFFFFn)
        const rank4    = new Bitboard(0x00000000FF000000n)
        const rank5    = new Bitboard(0x000000FF00000000n)

        let onePush = 0n, doublePush = 0n

        if (color == "White") {
            onePush = (pawnBoard.bitboard << 8n) & this.empty.bitboard & notRank1.bitboard
            doublePush = (onePush << 8n) & this.empty.bitboard & rank4.bitboard

        } else if (color == "Black") {
            onePush = (pawnBoard.bitboard >> 8n) & this.empty.bitboard & notRank8.bitboard
            doublePush = (onePush >> 8n) & this.empty.bitboard & rank5.bitboard


        } else {
            throw new Error("There is no pawn at the given index")
        }

        const pushes = onePush | doublePush
        return new Bitboard(pushes)
    }

    pawnAttacks(color, index = null, filterEnemySquares = true) {
        let pawnBoard = null

        if (index !== null) {
            pawnBoard = new Bitboard(0n)
            pawnBoard.setBit(index)
        }
        else {
            if (color == "White") {pawnBoard = this.whitePawns}
            if (color == "Black") {pawnBoard = this.blackPawns}
        }

        const notHFile = new Bitboard(0x7F7F7F7F7F7F7F7Fn)
        const notAFile = new Bitboard(0xFEFEFEFEFEFEFEFEn)

        let eastAttack = 0n, westAttack = 0n

        if (color == "White") {
            eastAttack = (pawnBoard.bitboard << 9n) & notAFile.bitboard
            westAttack = (pawnBoard.bitboard << 7n) & notHFile.bitboard

            if (filterEnemySquares) {
                eastAttack &= this.blackPieces.bitboard
                westAttack &= this.blackPieces.bitboard
            }

        } else if (color == "Black") {
            eastAttack = (pawnBoard.bitboard >> 7n) & notAFile.bitboard
            westAttack = (pawnBoard.bitboard >> 9n) & notHFile.bitboard

            if (filterEnemySquares) {
                eastAttack &= this.whitePieces.bitboard
                westAttack &= this.whitePieces.bitboard
            }
        } else {
            throw new Error("There is no pawn at the given index")
        }

        const attacks = eastAttack | westAttack

        return new Bitboard(attacks)
    }

    pawnMoves(color, index = null) {
        const pushes = this.pawnPushes(color, index).bitboard
        const attacks = this.pawnAttacks(color, index).bitboard
        const moves = pushes | attacks

        return new Bitboard(moves)
    }

    knightMoves(color, index = null) {
        let knightBoard = null

        if (index !== null) {
            knightBoard = new Bitboard(0n)
            knightBoard.setBit(index)
        }
        else {
            if (color == "White") {knightBoard = this.whiteKnights}
            if (color == "Black") {knightBoard = this.blackKnights}
        }

        const notHFile = new Bitboard(0x7F7F7F7F7F7F7F7Fn)
        const notAFile = new Bitboard(0xFEFEFEFEFEFEFEFEn)

        const notGHFile = new Bitboard(0x3F3F3F3F3F3F3F3Fn)
        const notABFile = new Bitboard(0xFCFCFCFCFCFCFCFCn)
        
        const noNoEa = ((knightBoard.bitboard << 17n) & notAFile.bitboard)
        const noEaEa = ((knightBoard.bitboard << 10n) & notABFile.bitboard)
        const soEaEa = ((knightBoard.bitboard >> 6n) & notABFile.bitboard)
        const soSoEa = ((knightBoard.bitboard >> 15n) & notAFile.bitboard)
        const noNoWe = ((knightBoard.bitboard << 15n) & notHFile.bitboard)
        const noWeWe = ((knightBoard.bitboard << 6n) & notGHFile.bitboard)
        const soWeWe = ((knightBoard.bitboard >> 10n) & notGHFile.bitboard)
        const soSoWe = ((knightBoard.bitboard >> 17n) & notHFile.bitboard)

        const pushes = noNoEa | noEaEa | soEaEa | soSoEa | noNoWe | noWeWe | soWeWe | soSoWe
        let moves = null

        if (color == "White") {
            moves = pushes & (this.empty.bitboard | this.blackPieces.bitboard)
        }
        else if (color == "Black") {
            moves = pushes & (this.empty.bitboard | this.whitePieces.bitboard)
        }

        return new Bitboard(moves)
    
    }

    kingMoves(color, index = null, filterUnsafeSquares = true) {

        let kingBoard = null

        if (index !== null) {
            kingBoard = new Bitboard(0n)
            kingBoard.setBit(index)
        }
        else {
            if (color == "White") {kingBoard = this.whiteKing}
            if (color == "Black") {kingBoard = this.blackKing}
        }

        const notHFile = new Bitboard(0x7F7F7F7F7F7F7F7Fn)
        const notAFile = new Bitboard(0xFEFEFEFEFEFEFEFEn)

        const notRank1 = new Bitboard(0xFFFFFFFFFFFFFF00n)
        const notRank8 = new Bitboard(0x00FFFFFFFFFFFFFFn)

        const north =     ((kingBoard.bitboard << 8n) & notRank1.bitboard)
        const northEast = ((kingBoard.bitboard << 9n) & notRank1.bitboard & notAFile.bitboard)
        const east =      ((kingBoard.bitboard << 1n) & notAFile.bitboard)
        const southEast = ((kingBoard.bitboard >> 7n) & notAFile.bitboard)
        const south =     ((kingBoard.bitboard >> 8n) & notRank8.bitboard)
        const southWest = ((kingBoard.bitboard >> 9n) & notHFile.bitboard)
        const west =      ((kingBoard.bitboard >> 1n) & notHFile.bitboard)
        const northWest = ((kingBoard.bitboard << 7n) & notHFile.bitboard) 

        const pushes = north | northEast | east | southEast | south | southWest | west | northWest
        let moves = null

        if (color == "White") {
            moves = pushes & (this.empty.bitboard | this.blackPieces.bitboard)
        }
        else if (color == "Black") {
            moves = pushes & (this.empty.bitboard | this.whitePieces.bitboard)
        }

        //check for castles
        const emptyWhiteKingSideCastle = new Bitboard(1n << 5n | 1n << 6n)
        const emptyWhiteQueenSideCastle = new Bitboard(1n << 1n | 1n << 2n | 1n << 3n)

        const emptyBlackQueenSideCastle = new Bitboard(1n << 57n | 1n << 58n | 1n << 59n)
        const emptyBlackKingSideCastle = new Bitboard(1n << 61n | 1n << 62n)

        if (color == "White") {
            if (this.canWhiteKingSideCastle & ((this.empty.bitboard & emptyWhiteKingSideCastle.bitboard) === emptyWhiteKingSideCastle.bitboard)) {
                moves |= (1n << 6n)
            }
            if (this.canWhiteQueenSideCastle & ((this.empty.bitboard & emptyWhiteQueenSideCastle.bitboard) === emptyWhiteQueenSideCastle.bitboard)) {
                moves |= (1n << 2n)
            }
        }

        if (color == "Black") {
            if (this.canBlackKingSideCastle & ((this.empty.bitboard & emptyBlackKingSideCastle.bitboard) === emptyBlackKingSideCastle.bitboard)) {
                moves |= (1n << 62n)
            }
            if (this.canBlackQueenSideCastle & ((this.empty.bitboard & emptyBlackQueenSideCastle.bitboard) === emptyBlackQueenSideCastle.bitboard)) {
                moves |= (1n << 58n)
            }
        }

        //Calculate all the unsafe squares the king can move into 
        let boardCopy = null
        const kingIndex = this.getKingIndex(color)

        if (color == "White") {
            this.whiteKing.unsetBit(kingIndex)
            this.whitePieces.unsetBit(kingIndex)
            this.board.unsetBit(kingIndex)
        }
        if (color == "Black") {
            this.blackKing.unsetBit(kingIndex)
            this.blackPieces.unsetBit(kingIndex)
            this.board.unsetBit(kingIndex)
        }


        if (filterUnsafeSquares) {
            const filterEnemySquares = false
            
            const allKnightMoves = this.knightMoves(this.swapColor(color)).bitboard
            const allBishopMoves = this.bishopMoves(this.swapColor(color)).bitboard
            const allRookMoves = this.rookMoves(this.swapColor(color)).bitboard
            const allQueenMoves = this.queenMoves(this.swapColor(color)).bitboard
            const allPawnAttacks = this.pawnAttacks(this.swapColor(color), index = null, filterEnemySquares).bitboard
            const allKingAttacks = this.kingMoves(this.swapColor(color), index = null, filterUnsafeSquares = false).bitboard //to prevent infinite recursion

            const unsafe = new Bitboard(allKnightMoves | allBishopMoves | allRookMoves | allQueenMoves | allPawnAttacks | allKingAttacks)
            const safe = unsafe.not()

            moves = moves & safe
        }

        if (color == "White") {
            this.whiteKing.setBit(kingIndex)
            this.whitePieces.setBit(kingIndex)
            this.board.setBit(kingIndex)
        }
        if (color == "Black") {
            this.blackKing.setBit(kingIndex)
            this.blackPieces.setBit(kingIndex)
            this.board.setBit(kingIndex)
        }

        

        return new Bitboard(moves)
    }

    rookMoves(color, index = null, queenMoves = false) {

        if (index === null) {
            let rookIndexes = null
            if (color == "White") {
                if (queenMoves) {rookIndexes = this.whiteQueen.bitboardToIndexes()}
                else {rookIndexes = this.whiteRooks.bitboardToIndexes()}
            }
            if (color == "Black") {
                if (queenMoves) {rookIndexes = this.blackQueen.bitboardToIndexes()}
                else {rookIndexes = this.blackRooks.bitboardToIndexes()}
            }

            let moves = 0n

            rookIndexes.forEach((rookIndex) => {
                moves |= this.rookMoves(color, rookIndex, queenMoves).bitboard
            })

            return new Bitboard(moves)
        }

        const data = this.rookMagicBitboard[String(index)];
        const mask = data['mask'];
        const blockers = BigInt(mask) & this.board.bitboard;
        const shift = data['shift'];
        const magicNumber = data['magicNumber'];

        const hash = ((blockers * magicNumber) >> shift).toString();

        let moves = null;

        const lookupTable = data['LookUpTable'];
        const moveBitboard = BigInt(lookupTable[hash] || 0n); // fallback to 0n if hash not found

        if (color == "White") {
            moves = moveBitboard & this.whitePieces.not();
        } else if(color == "Black") {
            moves = moveBitboard & this.blackPieces.not();
        }

        return new Bitboard(moves);
    }

    bishopMoves(color, index = null, queenMoves) {

        if (index === null) {
            let bishopIndexes = null
            if (color == "White") {
                if (queenMoves) {bishopIndexes = this.whiteQueen.bitboardToIndexes()}
                else {bishopIndexes = this.whiteBishops.bitboardToIndexes()}
            }
            if (color == "Black") {
                if (queenMoves) {bishopIndexes = this.blackQueen.bitboardToIndexes()}
                else {bishopIndexes = this.blackBishops.bitboardToIndexes()}
            }
            let moves = 0n

            bishopIndexes.forEach((bishopIndex) => {
                moves |= this.bishopMoves(color, bishopIndex, queenMoves).bitboard
            })

            return new Bitboard(moves)
        }

        const data = this.bishopMagicBitboard[String(index)];
        const mask = data['mask'];
        const blockers = BigInt(mask) & this.board.bitboard;
        const shift = data['shift'];
        const magicNumber = data['magicNumber'];

        const hash = ((blockers * magicNumber) >> shift).toString();

        let moves = null;

        const lookupTable = data['LookUpTable'];
        const moveBitboard = BigInt(lookupTable[hash] || 0n); // fallback to 0n if hash not found

        if (color == "White") {
            moves = moveBitboard & this.whitePieces.not();
        } else if (color == "Black") {
            moves = moveBitboard & this.blackPieces.not();
        }

        return new Bitboard(moves);
    }

    queenMoves(color, index = null) {
        const queenMoves = true
        const diagonalMoves = this.bishopMoves(color, index, queenMoves).bitboard
        const lineMoves = this.rookMoves(color, index, queenMoves).bitboard

        return new Bitboard(diagonalMoves | lineMoves)
    }


    pseudoLegalMoves(color, index) {
        if (this.whitePawns.isOne(index) || this.blackPawns.isOne(index)) {
            return this.pawnMoves(color, index)
        }
        if (this.whiteKnights.isOne(index) || this.blackKnights.isOne(index)) {
            return this.knightMoves(color, index)
        }
        if (this.whiteKing.isOne(index) || this.blackKing.isOne(index)) {
            return this.kingMoves(color, index)
        }
        if (this.whiteRooks.isOne(index) || this.blackRooks.isOne(index)) {
            return this.rookMoves(color, index)
        }
        if (this.whiteBishops.isOne(index) || this.blackBishops.isOne(index)) {
            return this.bishopMoves(color, index)
        }
        if (this.whiteQueen.isOne(index) || this.blackQueen.isOne(index)) {
            return this.queenMoves(color, index)
        }
    }

    getKingIndex(color) {
        for (let index = 0n; index <= 63n; index++) {
            if (color == "White" && this.whiteKing.isOne(index)) {
                return index
            }
            if (color == "Black" && this.blackKing.isOne(index)) {
                return index
            }
        }
        
    }

    getCheckingPieces(color, kingIndex = null) {
        
        if (!kingIndex) {kingIndex = this.getKingIndex(color)}

        let checkingPieces = []

        const knightMoves = this.knightMoves(color, kingIndex).bitboard
        const pawnAttacks = this.pawnAttacks(color, kingIndex).bitboard
        const rookMoves = this.rookMoves(color, kingIndex).bitboard
        const bishopMoves = this.bishopMoves(color, kingIndex).bitboard
        const queenMoves = this.queenMoves(color, kingIndex).bitboard

        if (color == "White") {
            const knightKingIntersection = new Bitboard(knightMoves & this.blackKnights.bitboard)
            if (knightKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Knight", knightKingIntersection])}

            const pawnKingIntersection = new Bitboard(pawnAttacks & this.blackPawns.bitboard)
            if (pawnKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Pawn", pawnKingIntersection])}

            const rookKingIntersection = new Bitboard(rookMoves & this.blackRooks.bitboard)
            if (rookKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Rook", rookKingIntersection])}

            const bishopKingIntersection = new Bitboard(bishopMoves & this.blackBishops.bitboard)
            if (bishopKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Bishop", bishopKingIntersection])}

            const queenKingIntersection = new Bitboard(queenMoves & this.blackQueen.bitboard)
            if (queenKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Queen", queenKingIntersection])}
        }
        if (color == "Black") {
            const knightKingIntersection = new Bitboard(knightMoves & this.whiteKnights.bitboard)
            if (knightKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Knight", knightKingIntersection])}

            const pawnKingIntersection = new Bitboard(pawnAttacks & this.whitePawns.bitboard)
            if (pawnKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Pawn", pawnKingIntersection])}

            const rookKingIntersection = new Bitboard(rookMoves & this.whiteRooks.bitboard)
            if (rookKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Rook", rookKingIntersection])}

            const bishopKingIntersection = new Bitboard(bishopMoves & this.whiteBishops.bitboard)
            if (bishopKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Bishop", bishopKingIntersection])}

            const queenKingIntersection = new Bitboard(queenMoves & this.whiteQueen.bitboard)
            if (queenKingIntersection.bitboard > 0n) 
                {checkingPieces.push(["Queen", queenKingIntersection])}
        }

        return checkingPieces
    }


    filterForPinnedPiecesMoves(color, moves, pieceIndex) {


        const kingIndex = this.getKingIndex(color)
        const slidingLineMoves = this.rookMoves(this.swapColor(color), kingIndex).bitboard
        const slidingDiagonalMoves = this.bishopMoves(this.swapColor(color), kingIndex).bitboard

        let rookBoard = null; let queenBoard = null; let bishopBoard = null;

        if (color == "White") {
            rookBoard = this.blackRooks
            queenBoard = this.blackQueen
            bishopBoard = this.blackBishops
        }
        if (color == "Black") {
            rookBoard = this.whiteRooks
            queenBoard = this.whiteQueen
            bishopBoard = this.whiteBishops
        }

        //Horizontal Pieces which can pin
        let pinnerIndexes = []
        pinnerIndexes = pinnerIndexes.concat(rookBoard.bitboardToIndexes())
        pinnerIndexes = pinnerIndexes.concat(queenBoard.bitboardToIndexes())

        let pinningPieceIndex = null

        pinnerIndexes?.forEach((possiblePinnerIndex) => {
            possiblePinnerIndex = BigInt(possiblePinnerIndex)
            const slidingMoves = this.rookMoves(this.swapColor(color), possiblePinnerIndex).bitboard
            this.LinePinnedPieces = new Bitboard(slidingLineMoves & slidingMoves)
            if (this.LinePinnedPieces.isOne(pieceIndex)) {
                console.log("THIS MF PIECE IS MF PINNED")
                console.log("KING INDEX:", kingIndex)
                console.log("PinningPieceIndex", possiblePinnerIndex)
                pinningPieceIndex = possiblePinnerIndex
                return
            }
        })

        if (pinningPieceIndex) {
            const pineLine = this.createLine(kingIndex, pinningPieceIndex)
            return new Bitboard(moves.bitboard & pineLine.bitboard)
        }

        //Diagonal Pieces which can pin
        pinnerIndexes = []
        pinnerIndexes = pinnerIndexes.concat(bishopBoard.bitboardToIndexes())
        pinnerIndexes = pinnerIndexes.concat(queenBoard.bitboardToIndexes())

        pinningPieceIndex = null

        pinnerIndexes?.forEach((possiblePinnerIndex) => {
            possiblePinnerIndex = BigInt(possiblePinnerIndex)
            const slidingMoves = this.bishopMoves(this.swapColor(color), possiblePinnerIndex).bitboard
            this.LinePinnedPieces = new Bitboard(slidingDiagonalMoves & slidingMoves)
            if (this.LinePinnedPieces.isOne(pieceIndex)) {
                console.log("THIS MF PIECE IS MF PINNED")
                console.log("KING INDEX:", kingIndex)
                console.log("PinningPieceIndex", possiblePinnerIndex)
                pinningPieceIndex = possiblePinnerIndex
                return
            }
        })

        if (!pinningPieceIndex) {return moves}
        if (pinningPieceIndex) {
            const pineLine = this.createLine(kingIndex, pinningPieceIndex)
            return new Bitboard(moves.bitboard & pineLine.bitboard)
        }
        return moves
    
    }


    filterMovesForChecks(color, moves) {

        //Filter moves for blocking or capturing a piece checking the king
        const checkPieces = this.getCheckingPieces(color)

        if (checkPieces.length == 1 && checkPieces[0][1].bitboardToIndexes().length == 1) { //Two knights might be targetting one square
            //if the check piece is a pawn OR knight we can only capture it, otherwise we can capture it or block it
            const enemyPieceType = checkPieces[0][0]
            const enemyPieceBitboard = checkPieces[0][1].bitboard
            const enemyPieceIndex = checkPieces[0][1].bitboardToIndexes()[0]
            const captureBoard = moves.bitboard & enemyPieceBitboard

            if (enemyPieceType == "Pawn" || enemyPieceType == "Knight") {
                return new Bitboard(captureBoard)
            }
            else {
                //We treat the king as the same sliding piece as the checking piece. if we & both the boards we get 1's between the two pieces
                // if we & this new board with our moves board we get legal blocking pieces
                //print board COPILOT


                let kingSlidingMoves = null
                let enemyPieceSlidingMoves = null
                const kingIndex = this.getKingIndex(color)

                if (enemyPieceType == "Rook") {
                    kingSlidingMoves = this.rookMoves(color, kingIndex)
                    enemyPieceSlidingMoves = this.rookMoves(this.swapColor(color), enemyPieceIndex)
                }
                else if (enemyPieceType == "Bishop") {
                    kingSlidingMoves = this.bishopMoves(color, kingIndex)
                    enemyPieceSlidingMoves = this.bishopMoves(this.swapColor(color), enemyPieceIndex)
                }
                else if (enemyPieceType == "Queen") {
                    kingSlidingMoves = this.queenMoves(color, kingIndex)
                    enemyPieceSlidingMoves = this.queenMoves(this.swapColor(color), enemyPieceIndex)
                }

                const kingToCheckingPieceBoard = kingSlidingMoves.bitboard & enemyPieceSlidingMoves.bitboard
                const blockingBoard = kingToCheckingPieceBoard & moves.bitboard
                return new Bitboard(blockingBoard | captureBoard)
            }
        }

        // if piece is pinned we can only move it along the line of the pin

        return moves
    }


    playerMoves(index) {
        const color = this.getPieceColor(index)
        if (color != this.currentPlayerColor) {return []} //Piece clicked is of wrong player

        const pieceType = this.getPieceType(index)
        let moves = this.pseudoLegalMoves(color, index)

        if (pieceType !== "King_White" && pieceType !== "King_Black") { //king will automatically gen moves to capture or avoid check. We are checking for other pieces
            moves = this.filterMovesForChecks(color, moves)
        }

        moves = this.filterForPinnedPiecesMoves(color, moves, index)

        return moves.bitboardToIndexes()
    }
 
}

module.exports = {Board}