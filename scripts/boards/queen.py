from scripts.boards.bitboard import BitBoard
from scripts.boards.rook import Rook
from scripts.boards.bishop import Bishop

class Queen(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

    def legal_moves(self): #Just combine bishop and rook properties
        rook = Rook(self.FEN, self.piece_index)
        bishop = Bishop(self.FEN, self.piece_index)

        moves = rook.legal_moves() + bishop.legal_moves()
        return moves