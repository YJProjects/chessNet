export async function getMoves(piece, FEN) {
    let piece_index = piece.classList[2] //Format of piece classes :["sqaure, colour, index ...."
    const post_data = {'FEN' : FEN, 'piece_index' : piece_index}

    const response = await fetch("https://chessnet.onrender.com/generate_moves", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data)  // use "name" instead of "username"
    })

    const data = await response.json();
    const moves = data['moves']
    console.log(moves)
    return moves
}

export async function updateFen(startIndex, targetIndex, FEN) {
    const post_data = {'start_index' : startIndex, 'target_index' : targetIndex, 'FEN' : FEN}

    const response = await fetch("https://chessnet.onrender.com/update_fen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data)  // use "name" instead of "username"
    })

    const data = await response.json();
    const newFEN = data['FEN']

    return newFEN
}