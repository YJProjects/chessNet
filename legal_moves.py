from BitBoard import Pawn

def get_piece_type(FEN, index): #return piece type independent of colour
        piece_data = FEN.split()[0]
        rows = piece_data.split('/')
        
        for row_count, row in enumerate(rows):
            current_index = (7-row_count) * 8
            for piece in row:
                print(current_index, piece)
                if current_index == index:
                     return piece.lower()
                elif piece.isdigit():
                    current_index += int(piece)
                else:
                     current_index += 1
                
        return None

def legal_moves(FEN, piece_index):
    if get_piece_type(FEN, piece_index) == 'p':
        piece = Pawn(FEN, piece_index)
        return piece.legal_moves()
    return "Invalid piece"