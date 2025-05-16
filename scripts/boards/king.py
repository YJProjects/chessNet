from scripts.boards.bitboard import BitBoard

FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class King(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

    def legal_moves(self):
        moves = 0
        piece_bitboard = self.create_bitboard_from_indexes([self.piece_index])

        notAFile  = self.flip_bitboard(0b0000000100000001000000010000000100000001000000010000000100000001)
        not_1_row = self.flip_bitboard(0b0000000000000000000000000000000000000000000000000000000011111111)
        not_8_row = self.flip_bitboard(0b11111111000000000000000000000000000000000000000000000000000000000)
        notHFile  = self.flip_bitboard(0b1000000010000000100000001000000010000000100000001000000010000000)

        No  = (piece_bitboard << 8) & not_1_row
        NoEa  = (piece_bitboard << 7) & notAFile & not_1_row
        Ea  = (piece_bitboard >> 1) & notAFile
        SoEa  = (piece_bitboard >> 9) & notAFile & not_8_row
        So  = (piece_bitboard >> 8) & not_8_row
        SoWe  = (piece_bitboard >>  7) & not_8_row & notHFile
        We  = (piece_bitboard << 1) & notHFile
        NoWe  = (piece_bitboard << 9) & not_1_row & notHFile

        moves = No | NoEa | Ea | SoEa | So | SoWe | We | NoWe

        if self.piece_type.isupper(): legal_moves = moves & self.flip_bitboard(self.white)
        if self.piece_type.islower(): legal_moves = moves & self.flip_bitboard(self.black)

        return self.get_indexes_from_bitboard(legal_moves)



