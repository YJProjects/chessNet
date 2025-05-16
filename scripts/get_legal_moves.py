from scripts.boards.pawn import Pawn
from scripts.boards.rook import Rook
from scripts.boards.bishop import Bishop
from scripts.boards.queen import Queen
from scripts.boards.knight import Knight
from scripts.boards.king import King
from scripts.update_fen import update_FEN


def get_piece_type(FEN, index): #return piece type independent of colour
        piece_data = FEN.split()[0]
        rows = piece_data.split('/')
        
        for row_count, row in enumerate(rows):
            current_index = (7-row_count) * 8
            for piece in row:
                if current_index == index:
                     return piece
                elif piece.isdigit():
                    current_index += int(piece)
                else:
                     current_index += 1
                
        return None

def get_king_index(FEN, king_type):
    piece_data = FEN.split()[0]
    rows = piece_data.split('/')
    for row_count, row in enumerate(rows):
        current_index = (7-row_count) * 8
        for piece in row:
            if piece == king_type:
                    return current_index
            elif piece.isdigit():
                current_index += int(piece)
            else:
                    current_index += 1
            
    return None



def get_moves(FEN, piece_index, piece_type):
    if piece_type == 'p':
        piece = Pawn(FEN, piece_index)
        return piece.legal_moves()
    elif piece_type == 'r':
        piece = Rook(FEN, piece_index)
        return piece.legal_moves()
    elif piece_type == 'b':
        piece = Bishop(FEN, piece_index)
        return piece.legal_moves()
    elif piece_type == 'q':
        piece = Queen(FEN, piece_index)
        return piece.legal_moves()
    elif piece_type == 'n':
        piece = Knight(FEN, piece_index)
        return piece.legal_moves()
    elif piece_type == 'k':
        piece = King(FEN, piece_index)
        return piece.legal_moves()
    return "Invalid piece"

def is_king_in_check(FEN):
    side_to_move = FEN.split()[1]
    king_char = 'K' if side_to_move == 'w' else 'k'
    enemy_pieces = 'prnbqk' if side_to_move == 'w' else 'PRNBQK'

    # Get the index of our king
    king_index = get_king_index(FEN, king_char)
    if not king_index:
        return False  # Shouldn't happen unless board is corrupted

    # Go through all squares to find opponent pieces
    for i in range(64):
        piece = get_piece_type(FEN, i)
        if piece is None:
            continue
        if piece in enemy_pieces:
            moves = get_moves(FEN, i, piece.lower())
            if king_index in moves:
                return True

    return False


def legal_moves(FEN, piece_index):
    piece_type = get_piece_type(FEN, piece_index)

    if FEN.split(" ")[1] == 'w' and piece_type.islower():
        return []
    if FEN.split(" ")[1] == 'b' and piece_type.isupper():
        return []

    moves = get_moves(FEN, piece_index, piece_type.lower())

    for move in moves.copy():
        newFEN = update_FEN(FEN, piece_index, move, change_player=False)
        if is_king_in_check(newFEN):
            moves.remove(move)

    return moves

