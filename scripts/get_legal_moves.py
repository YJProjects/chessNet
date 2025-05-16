from scripts.boards.pawn import Pawn
from scripts.boards.rook import Rook
from scripts.boards.bishop import Bishop
from scripts.boards.queen import Queen
from scripts.boards.knight import Knight
from scripts.boards.king import King





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

def legal_moves(FEN, piece_index):
    piece_type = get_piece_type(FEN, piece_index)

    if FEN.split(" ")[1] == 'w' and piece_type.islower():
        return []
    if FEN.split(" ")[1] == 'b' and piece_type.isupper():
        return []

    moves = get_moves(FEN, piece_index, piece_type.lower())
    return moves