import os
import json
import pickle

class BitBoard():
    def __init__(self, FEN, piece_index):
        self.FEN = FEN
        self.piece_index = piece_index
        self.piece_type = self.get_piece_type(piece_index)
        
        self.r = self.create_bitboard('R')
        self.n = self.create_bitboard('N')
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

    def indexes_to_bitboard(self, indexes):
        bitboard = 0
        for index in indexes:
            bitboard = self.set_bit(bitboard, index)

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

        return self.bitboard_to_indexes(legal_moves)
    
from flask import session

class Rook(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

        self.magic_numbers_file = "rook_magic_numbers.pkl"
        self.magic_bitboard_file = "rook_magic_bitboard.pkl"

        if self.file_exists(self.magic_numbers_file) and self.file_exists(self.magic_bitboard_file):
            self.magic_numbers = self.load_from_pickle(self.magic_numbers_file)
            self.magic_bitboard = self.load_from_pickle(self.magic_bitboard_file)
        else:
            self.magic_numbers = self.get_magic_numbers()
            self.save_to_pickle(self.magic_numbers, self.magic_numbers_file)

            self.magic_bitboard = self.create_magic_bitboard(self.magic_numbers)
            self.save_to_pickle(self.magic_bitboard, self.magic_bitboard_file)


    def get_mask(self, index : int) -> list[int]: #Get bitboard of all possible blocker positions for an index. We exclude the edge squares since they are not really blocking the view to another square

        #get horizontal moves
        left_end = (index//8) * 8
        right_end = left_end + 8

        horizontal = list(range(left_end + 1, right_end - 1))

        #get vertical moves
        bottom_square = index%8
        top_square = 48 + bottom_square

        vertical = list(range(bottom_square+8, top_square+1 , 8 ))

        moves = vertical + horizontal

        while index in moves:
            moves.remove(index)

        return moves
    
    def get_blocker_patterns(self) -> dict[int]:
        blocker_patterns = {i: [] for i in range(64)}

        for index in range(64):
            mask = self.get_mask(index)
            num_of_combinations = 2 ** len(mask) #each combination when written in binary form will give a combination. we just have to shift the indexes into the correct places

            for pattern in range(num_of_combinations):
                blocker_pattern = 0
                
                for i, shift in enumerate(mask):
                    bit = (pattern >> i) & 1
                    blocker_pattern |= (bit << shift)
                blocker_patterns[index].append(blocker_pattern)

        return blocker_patterns
    
    def random_magic_number(self):
        import random
        return random.getrandbits(64) & random.getrandbits(64) & random.getrandbits(64) 
    
    def legal_moves_bruteforce(self, index, blocker_pattern):
        legal_moves = 0

        rank = index // 8
        file = index % 8

        # Right (east)
        for f in range(file + 1, 8):
            target = rank * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break

        # Left (west)
        for f in range(file - 1, -1, -1):
            target = rank * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break

        # Up (north)
        for r in range(rank + 1, 8):
            target = r * 8 + file
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break

        # Down (south)
        for r in range(rank - 1, -1, -1):
            target = r * 8 + file
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break

        return legal_moves
            
    def get_magic_numbers(self) -> list[int]: #Each index in the board will have its own magic number.
        blocker_patterns = self.get_blocker_patterns()
        magic_numbers = {}
        for index in blocker_patterns:
            for _ in range(1000):
                hashmap = {}
                magic = self.random_magic_number()
                found = True
                for pattern in blocker_patterns[index]:
                    relevant_bits = len(self.get_mask(index))
                    #blocker_bitboard = self.indexes_to_bitboard(blocker_pattern)
                    
                    custom_hash = ((pattern * magic) >> (64-relevant_bits))
                    moves = self.legal_moves_bruteforce(index, pattern)

                    if custom_hash in hashmap:
                        if hashmap[custom_hash] != moves:
                            found = False
                            break
                    else:
                        hashmap[custom_hash] = moves
                if found:
                    magic_numbers[index] = magic
                    break
        
        return magic_numbers
    
    def create_magic_bitboard(self, magic_numbers):
        blocker_patterns = self.get_blocker_patterns()

        magic_bitboard = {}

        for index in blocker_patterns:
            magic_bitboard[index] = {}
            for pattern in blocker_patterns[index]:
                magic = magic_numbers[index]
                relevant_bits = len(self.get_mask(index))
                moves = self.legal_moves_bruteforce(index, pattern)
                custom_hash = ((pattern * magic) >> (64-relevant_bits))

                magic_bitboard[index][custom_hash] = moves

        return magic_bitboard
    
    def legal_moves(self):
        mask = self.get_mask(self.piece_index)
        blocker_pattern = self.board & self.indexes_to_bitboard(mask)
        magic = self.magic_numbers[self.piece_index]
        relevant_bits = len(mask)
        custom_hash = ((blocker_pattern * magic) >> (64-relevant_bits))

        moves = self.magic_bitboard[self.piece_index][custom_hash]

        if self.piece_type.islower(): legal_moves = moves & self.flip_bitboard(self.black)
        if self.piece_type.isupper(): legal_moves = moves & self.flip_bitboard(self.white)

        return self.bitboard_to_indexes(legal_moves)
        
                



