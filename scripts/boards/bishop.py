from scripts.boards.bitboard import BitBoard

class Bishop(BitBoard):
    def __init__(self, FEN, piece_index):
        super().__init__(FEN, piece_index)

        self.magic_numbers_file = "bishop_magic_numbers.pkl"
        self.magic_bitboard_file = "bishop_magic_bitboard.pkl"

        if self.file_exists(self.magic_numbers_file) and self.file_exists(self.magic_bitboard_file):
            self.magic_numbers = self.load_from_pickle(self.magic_numbers_file)
            self.magic_bitboard = self.load_from_pickle(self.magic_bitboard_file)
        else:
            self.magic_numbers = self.get_magic_numbers()
            self.save_to_pickle(self.magic_numbers, self.magic_numbers_file)

            self.magic_bitboard = self.create_magic_bitboard(self.magic_numbers)
            self.save_to_pickle(self.magic_bitboard, self.magic_bitboard_file)


    def get_mask(self, index: int) -> list[int]:
        rank = index // 8
        file = index % 8
        mask = []

        # Up-right (NE)
        r, f = rank + 1, file + 1
        while r < 7 and f < 7:
            mask.append(r * 8 + f)
            r += 1
            f += 1

        # Up-left (NW)
        r, f = rank + 1, file - 1
        while r < 7 and f > 0:
            mask.append(r * 8 + f)
            r += 1
            f -= 1

        # Down-right (SE)
        r, f = rank - 1, file + 1
        while r > 0 and f < 7:
            mask.append(r * 8 + f)
            r -= 1
            f += 1

        # Down-left (SW)
        r, f = rank - 1, file - 1
        while r > 0 and f > 0:
            mask.append(r * 8 + f)
            r -= 1
            f -= 1

        return mask

    
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
    
    def legal_moves_bruteforce(self, index: int, blocker_pattern: int) -> int:
        legal_moves = 0
        rank = index // 8
        file = index % 8

        # Up-right (NE)
        r, f = rank + 1, file + 1
        while r < 8 and f < 8:
            target = r * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break
            r += 1
            f += 1

        # Up-left (NW)
        r, f = rank + 1, file - 1
        while r < 8 and f >= 0:
            target = r * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break
            r += 1
            f -= 1

        # Down-right (SE)
        r, f = rank - 1, file + 1
        while r >= 0 and f < 8:
            target = r * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break
            r -= 1
            f += 1

        # Down-left (SW)
        r, f = rank - 1, file - 1
        while r >= 0 and f >= 0:
            target = r * 8 + f
            legal_moves |= (1 << target)
            if blocker_pattern & (1 << target):
                break
            r -= 1
            f -= 1

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
    
    def random_magic_number(self):
        import random
        return random.getrandbits(64) & random.getrandbits(64) & random.getrandbits(64) 
    
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
        blocker_pattern = self.board & self.create_bitboard_from_indexes(mask)
        magic = self.magic_numbers[self.piece_index]
        relevant_bits = len(mask)
        custom_hash = ((blocker_pattern * magic) >> (64-relevant_bits))

        moves = self.magic_bitboard[self.piece_index][custom_hash]

        if self.piece_type.islower(): legal_moves = moves & self.flip_bitboard(self.black)
        if self.piece_type.isupper(): legal_moves = moves & self.flip_bitboard(self.white)

        return self.get_indexes_from_bitboard(legal_moves)