from scripts.boards.bitboard import BitBoard

FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class Knight(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

    def legal_moves(self):
        moves = 0
        piece_bitboard = self.create_bitboard_from_indexes([self.piece_index])

        notAFile  = self.flip_bitboard(0b0000000100000001000000010000000100000001000000010000000100000001)
        notABFile = self.flip_bitboard(0b0000001100000011000000110000001100000011000000110000001100000011)
        notGHFile = self.flip_bitboard(0b1100000011000000110000001100000011000000110000001100000011000000)
        notHFile  = self.flip_bitboard(0b1000000010000000100000001000000010000000100000001000000010000000)

        noNoEa  = (piece_bitboard << 17) & notAFile 
        noEaEa  = (piece_bitboard << 10) & notABFile
        soEaEa  = (piece_bitboard >>  6) & notABFile
        soSoEa  = (piece_bitboard >> 15) & notAFile 
        noNoWe  = (piece_bitboard << 15) & notHFile 
        noWeWe  = (piece_bitboard <<  6) & notGHFile
        soWeWe  = (piece_bitboard >> 10) & notGHFile
        soSoWe  = (piece_bitboard >> 17) & notHFile 

        moves = noNoEa | noEaEa | soEaEa | soSoEa | noNoWe | noWeWe | soWeWe | soSoWe

        if self.piece_type.isupper(): legal_moves = moves & self.flip_bitboard(self.white)
        if self.piece_type.islower(): legal_moves = moves & self.flip_bitboard(self.black)

        return self.get_indexes_from_bitboard(legal_moves)



