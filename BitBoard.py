class BitBoard():
    def __init__(self, FEN, piece_index):
        self.FEN = FEN
        self.piece_index = piece_index
        self.piece_type = self.get_piece_type(piece_index)
        
        self.r = self.create_bitboard('R')
        self.n = self.create_bitboard('R')
        self.b = self.create_bitboard('B')
        self.q = self.create_bitboard('Q')
        self.k = self.create_bitboard('K')
        self.p = self.create_bitboard('P')

        self.white = self.r | self.n | self.b | self.q | self.k | self.p

        self.R = self.create_bitboard('r')
        self.N = self.create_bitboard('n')
        self.B = self.create_bitboard('b')
        self.Q = self.create_bitboard('q')
        self.K = self.create_bitboard('k')
        self.P = self.create_bitboard('p')

        self.black = self.R | self.N | self.B | self.Q | self.K | self.P

        self.board = self.black | self.white
        self.empty = self.flip_bitboard(self.board)



    def get_piece_type(self, index): #return piece type independent of colour
        piece_data = self.FEN.split()[0]
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
        

    def create_bitboard(self, piece_type):
        bitboard = 0
        piece_data = self.FEN.split()[0]
        rows = piece_data.split('/')
        
        for row_count, row in enumerate(rows):
            current_index = (7-row_count) * 8
            for piece in row:
                if piece == piece_type:
                    bitboard = self.set_bit(bitboard, current_index)
                    current_index += 1
                elif piece.isdigit():
                    current_index += int(piece)
                else:
                     current_index += 1
                
    
        return bitboard

    

    def print_bitboard(self, bitboard):
        print("  A B C D E F G H")
        for rank in range(7, -1, -1):  # Rank 8 to 1
            row = f"{rank + 1} "
            for file in range(8):  # File A to H
               index = rank * 8 + file
               row += "1 " if (bitboard >> index) & 1 else ". "
            print(row)

    def bitboard_to_indexes(self, bitboard):
        index = 0
        indexes = []
        
        while index < 64:            
            if (1 & (bitboard >> index)) == 1:
                indexes.append(index)
            index += 1

        return indexes

    def set_bit(self, bitboard, index):
        bitboard |= (1 << index)
        return bitboard #Set a bit at some index as 0
    
    def remove_bit(self, bitboard, index):
        bitboard &= ~(1 << index)
        return bitboard
    
    def flip_bitboard(self, bitboard):
        return (~bitboard & 0xFFFFFFFFFFFFFFFF)  # Mask to keep only 64 bits
    
    def index_to_bit(self, index): #Suppose our index value is 0, its bit positoin will be 7-0 = 7
        row = index//7 + 1
    
    
class Pawn(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

    def legal_moves(self):
        single_push = 0

        if self.piece_type.isupper(): #piece is white
            single_push = self.set_bit(single_push, self.piece_index + 8) #new bitboard where 8 bits ahead is 1
        else:
            single_push = self.set_bit(single_push, self.piece_index - 8) #new bitboard where 8 bits behind is 1

        double_push = 0
        if self.piece_type.isupper() and 8 <= self.piece_index <= 15:
            double_push = self.set_bit(double_push, self.piece_index + 16)
        if self.piece_type.islower() and 47 <= self.piece_index <= 55:
            double_push = self.set_bit(double_push, self.piece_index + -16)

        all_pushes = single_push | double_push
        all_legal_pushes = all_pushes & self.empty

        return self.bitboard_to_indexes(all_legal_pushes)
    

    

