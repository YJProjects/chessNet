//Rook
function rookMask(index) {
    const row = Math.floor(index / 8);
    const column = index % 8;

    let mask = 0n;

    // Right (exclude edge file 7)
    for (let c = column + 1; c < 7; c++) {
        mask |= 1n << BigInt(row * 8 + c);
    }

    // Left (exclude edge file 0)
    for (let c = column - 1; c > 0; c--) {
        mask |= 1n << BigInt(row * 8 + c);
    }

    // Up (exclude edge rank 7)
    for (let r = row + 1; r < 7; r++) {
        mask |= 1n << BigInt(r * 8 + column);
    }

    // Down (exclude edge rank 0)
    for (let r = row - 1; r > 0; r--) {
        mask |= 1n << BigInt(r * 8 + column);
    }

    return mask;
}

function bishopMask(index) {
    const row = Math.floor(index / 8);
    const col = index % 8;

    let mask = 0n;

    // Top-right diagonal
    for (let r = row + 1, c = col + 1; r < 7 && c < 7; r++, c++) {
        mask |= 1n << BigInt((r * 8) + c);
    }

    // Top-left diagonal
    for (let r = row + 1, c = col - 1; r < 7 && c > 0; r++, c--) {
        mask |= 1n << BigInt((r * 8) + c);
    }

    // Bottom-right diagonal
    for (let r = row - 1, c = col + 1; r > 0 && c < 7; r--, c++) {
        mask |= 1n << BigInt((r * 8) + c);
    }

    // Bottom-left diagonal
    for (let r = row - 1, c = col - 1; r > 0 && c > 0; r--, c--) {
        mask |= 1n << BigInt((r * 8) + c);
    }

    return mask;

    
}


function printBitboard(bitboard) {
    // Ranks go from 7 (top) down to 0 (bottom)
    for (let rank = 7; rank >= 0; rank--) {
        let line = '';
        for (let file = 0; file < 8; file++) {
            const squareIndex = BigInt(rank * 8 + file);
            const bit = (bitboard >> squareIndex) & 1n;
            line += bit === 1n ? '1 ' : '. ';
        }
        console.log(line.trim());
    }
}

function bitboardToIndexes(bitboard) {
    let indexes = [];
    for (let index = 0n; index <= 63n; index++) {
        if ((bitboard >> index) & 1n) {
            indexes.push(index);
        }
    }
    return indexes;
}


function Permutations(mask) {
    const indexes = bitboardToIndexes(mask);
    const numOfCombinations = 1 << indexes.length;
    const permutations = [];

    for (let bitPattern = 0; bitPattern < numOfCombinations; bitPattern++) {
        let blocker = 0n;

        for (let i = 0; i < indexes.length; i++) {
            if ((bitPattern >> i) & 1) {
                blocker |= 1n << indexes[i];
            }
        }

        permutations.push(blocker);
    }

    return permutations;
}

function rookPseudoLegalMoves(square, blockers) {
    const moves = [];
    const row = Math.floor(square / 8);
    const col = square % 8;

    let attacks = 0n;

    // Right
    for (let c = col + 1; c < 8; c++) {
        let toSquare = row * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Left
    for (let c = col - 1; c >= 0; c--) {
        let toSquare = row * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Up
    for (let r = row + 1; r < 8; r++) {
        let toSquare = r * 8 + col;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Down
    for (let r = row - 1; r >= 0; r--) {
        let toSquare = r * 8 + col;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    return attacks;
}

function bishopPseudoLegalMoves(square, blockers) {
    const row = Math.floor(square / 8);
    const col = square % 8;

    let attacks = 0n;

    // Top-right diagonal
    for (let r = row + 1, c = col + 1; r < 8 && c < 8; r++, c++) {
        const toSquare = r * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Top-left diagonal
    for (let r = row + 1, c = col - 1; r < 8 && c >= 0; r++, c--) {
        const toSquare = r * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Bottom-right diagonal
    for (let r = row - 1, c = col + 1; r >= 0 && c < 8; r--, c++) {
        const toSquare = r * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    // Bottom-left diagonal
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
        const toSquare = r * 8 + c;
        attacks |= 1n << BigInt(toSquare);
        if ((blockers >> BigInt(toSquare)) & 1n) break;
    }

    return attacks;
}


function random64BitBigInt() {
    // Math.random() gives ~53 bits of randomness, so we use two calls
    const high = BigInt(Math.floor(Math.random() * 0x100000000)); // upper 32 bits
    const low  = BigInt(Math.floor(Math.random() * 0x100000000)); // lower 32 bits
    return (high << 32n) | low;
}

function generateMagicNumber(index, type) {


    const mask = (type == 'Rook')? rookMask(index) : bishopMask(index);
    const relevantBits = BigInt(bitboardToIndexes(mask).length);
    const shift = 64n - relevantBits;
    const blockers = Permutations(mask);

    let bestMagicNumber = null;

    const MAX_ATTEMPTS = 1000;
    console.log(`Index: ${index} / 63, Progress: ${index/63 * 100}%, Piece: ${type}`);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const magicNumber = random64BitBigInt() & random64BitBigInt() & random64BitBigInt();
        const magicBitBoard = {};

        let success = true;

        for (let blocker of blockers) {
            const legalMoves = (type == 'Rook')? rookPseudoLegalMoves(index, blocker) : bishopPseudoLegalMoves(index, blocker);
            const hash = ((blocker * magicNumber) >> shift).toString();

            if (magicBitBoard[hash] !== undefined) {
                if (magicBitBoard[hash] !== legalMoves) {
                    success = false;
                    break;
                }
            } else {
                magicBitBoard[hash] = legalMoves;
            }
        }

        if (success){ 

            if (bestMagicNumber) {
                if (magicNumber < bestMagicNumber) {
                    bestMagicNumber = magicNumber;
                    bestMagicBitBoard = magicBitBoard;
                }
            }
            else {
                bestMagicNumber = magicNumber;
                bestMagicBitBoard = magicBitBoard;
            }
            
            
        }
    }

    if (bestMagicNumber === null) {
        throw new Error("Failed to find a valid magic number after many attempts");
    }

    return bestMagicNumber
}


function generateMagicBitBoards(type) {

    let magicBitBoards = {}

    for (let index = 0; index <= 63; index++) {
        const mask = (type == 'Rook')? rookMask(index) : bishopMask(index);
        const relevantBits = BigInt(bitboardToIndexes(mask).length);
        const shift = 64n - relevantBits;
        const blockers = Permutations(mask);

        

        const magicNumber = generateMagicNumber(index, type);

        let magicBitBoard = {}
        

        for (let blocker of blockers) {
            const legalMoves = (type == 'Rook')? rookPseudoLegalMoves(index, blocker) : bishopPseudoLegalMoves(index, blocker);
            const hash = ((blocker * magicNumber) >> shift).toString();

            magicBitBoard[hash] = legalMoves
        }

        magicBitBoards[index] = {'magicNumber' : magicNumber, 'shift': shift, 'mask' : mask, 'LookUpTable' : magicBitBoard}
    }

    return magicBitBoards

}

const fs = require('fs');

function saveMagicBitBoardsToFile(filename, data) {
    const jsonData = JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() + 'n' : value,
        2 // Pretty print with 2-space indent
    );

    const path = 'server/'

    fs.writeFileSync(path + filename, jsonData, 'utf-8');
    console.log(`Magic bitboards saved to ${filename}`);
}

function generateAndSaveMagicBitBoards(){
    const rookMagicBitBoards = generateMagicBitBoards('Rook');
    const bishopMagicBitBoards = generateMagicBitBoards('Bishop');

    saveMagicBitBoardsToFile('rook_magic_bitboards.json', rookMagicBitBoards);
    saveMagicBitBoardsToFile('bishop_magic_bitboards.json', bishopMagicBitBoards);
}

//generateAndSaveMagicBitBoards()

module.exports = {rookMask}