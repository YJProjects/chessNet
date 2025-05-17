import os
import pickle

class BitBoard():
    def __init__(self, FEN, piece_index):
        self.FEN = FEN
        self.piece_index = piece_index
        self.piece_type = self.get_piece_type_from_index(piece_index)

        self.white = self.create_bitboard_from_piece_types(['P', 'Q', 'K', 'N', 'R', "B"])

        self.black = self.create_bitboard_from_piece_types(['p', 'q', 'k', 'n', 'r', 'b'])

        self.board = self.black | self.white
        
        self.empty = self.flip_bitboard(self.board)



    def get_piece_type_from_index(self, index: int): #return piece type independent of colour
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
        

    def create_bitboard_from_piece_type(self, piece_type):
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
    
    def create_bitboard_from_piece_types(self, piece_types : list):
        bitboard = 0
        piece_data = self.FEN.split()[0]
        rows = piece_data.split('/')
        
        for row_count, row in enumerate(rows):
            current_index = (7-row_count) * 8
            for piece in row:
                if piece in piece_types:
                    bitboard = self.set_bit(bitboard, current_index)
                    current_index += 1
                elif piece.isdigit():
                    current_index += int(piece)
                else:
                     current_index += 1

        return bitboard

    def create_bitboard_from_indexes(self, indexes : list[int]) -> int:
        bitboard = 0
        for index in indexes:
            bitboard = self.set_bit(bitboard, index)

        return bitboard

    def print_bitboard(self, bitboard : int) -> None:
        print("  A B C D E F G H")
        for rank in range(7, -1, -1):  # Rank 8 to 1
            row = f"{rank + 1} "
            for file in range(8):  # File A to H
               index = rank * 8 + file
               row += "1 " if (bitboard >> index) & 1 else ". "
            print(row)

    def get_indexes_from_bitboard(self, bitboard : int) -> list[int]:
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
    
    def isBit(self, bitboard, index):
        return (bitboard >> index) & 1 == 1
    
    def count_set_bits(self, bitboard): #get number of bits set to one
        return bin(bitboard).count('1')
    
    def file_exists(self, filename):
        return os.path.exists(filename)

    def save_to_pickle(self, data, filename):
        with open(filename, 'wb') as f:
            pickle.dump(data, f)

    def load_from_pickle(self, filename):
        with open(filename, 'rb') as f:
            return pickle.load(f)

        
                



