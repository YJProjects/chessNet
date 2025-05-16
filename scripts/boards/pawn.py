from scripts.boards.bitboard import BitBoard

class Pawn(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

    def legal_moves(self):
        single_push = 0

        if self.piece_type.isupper(): #piece is white
            single_push = self.set_bit(single_push, self.piece_index + 8) #new bitboard where 8 bits ahead is 1
        else:
            single_push = self.set_bit(single_push, self.piece_index - 8) #new bitboard where 8 bits behind is 1

        legal_single_pushes = single_push & self.empty

        legal_double_pushes = 0

        if self.piece_type.isupper() and 8 <= self.piece_index <= 15:
            legal_double_pushes = legal_single_pushes << 8 #push more bits ahead. If there is no single pushes there won't be any double pushes
        if self.piece_type.islower() and 47 <= self.piece_index <= 55:
            legal_double_pushes = legal_single_pushes >> 8

        legal_pushes = legal_single_pushes | legal_double_pushes

        east_attacks = 0
        west_attacks = 0
        legal_attacks = 0

        if self.piece_type.isupper():
            west_attacks = self.set_bit(west_attacks, self.piece_index + 7)
            east_attacks = self.set_bit(east_attacks, self.piece_index + 9)
            legal_attacks = (east_attacks | west_attacks) & self.black
        else: 
            west_attacks = self.set_bit(west_attacks, self.piece_index - 9)
            east_attacks = self.set_bit(east_attacks, self.piece_index - 7)
            legal_attacks = (east_attacks | west_attacks) & self.white

        legal_moves = legal_pushes | legal_attacks

        en_passant = []
        if self.FEN.split(" ")[3] != '-':
            en_passant.append(self.FEN.split(" ")[3])

        return self.get_indexes_from_bitboard(legal_moves) + en_passant
    