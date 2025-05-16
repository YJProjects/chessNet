def update_FEN(FEN, start_index, target_index, change_player = True): #return piece type independent of colour
     index_piece = {}
     #for easy representation we'll convert fen to a index : piece Hashmap, manipulate the hashmap and convert it back into FEN
     index = 0
     Fenpieces, active_color, castling_rights, en_passant_targets, half_move_clock, full_move_number = FEN.split(" ")
     FENrows = Fenpieces.split("/")[::-1] #Reverse FEN so we start from index 0
     for row in FENrows:
          for s in row:
               if s.isdigit():
                    for i in range(int(s)):
                         index_piece[index] = 1
                         index += 1
               else:
                    index_piece[index] = s
                    index += 1
          
     piece = index_piece[start_index] #Remember the piece_type at start_square
     index_piece[start_index] = 1 #Since start square will be empty: we can set its piece value to 1
     index_piece[target_index] = piece #Update target Index to the piece at start_index


     if en_passant_targets != '-':
          if piece.isupper():
               index_piece[target_index - 8] = 1
          else:
               index_piece[target_index + 8] = 1
          en_passant_targets = '-'
               

     #remake the FEN. First loop gives a row with value like [1, 1, 'N', 1, 'R', 1, 1, 1]. We remake this into [2,'N', 3]
     FEN = []
     for i in range(0, 64, 8):
          row = list(index_piece.values())[i:i+8]
          fenRow = []
          count = 0

          for i in row:
               if i == 1:
                    count += 1
               else:
                    if count > 0:
                         fenRow.append(count)
                         count = 0
                    fenRow.append(i)
          
          if count > 0: #Incase all elements are 1
               fenRow.append(count)

          FEN.append((fenRow))

     FEN.reverse()
     #FEN will look something like [[3, 'R', 1, 'N', 2], [5, 'k', 2]....
     #now we jjust group each element

     FENstring = ''
     for i in FEN:
          for j in i:
               FENstring += str(j)
          FENstring += '/'
     FENpieces= FENstring[:-1]

     #set which player's move it is
     if piece.islower(): 
          full_move_number = str(int(full_move_number) + 1)
          if change_player: active_color = 'w'
     else:
          if change_player: active_color = 'b'

     #check if enpassant is possible
     #CONDITIONS FOR EN PASSANT:
     #1. The opposite color pawn moves 2 steps ahead and becomes a horizontal neighbour to our pushed_pawn. It is only valid for one move
     #2. white pawn must have reached the 5th row or black pawn to 4th row and should be opposite color to the pushed pawn

     

     if abs(target_index - start_index) / 8 ==  2 and piece.lower() == 'p':
          if piece.isupper():
               if target_index%8 != 7 and index_piece[target_index + 1] == 'p':
                    en_passant_targets = target_index - 8
               elif target_index%8 != 0 and index_piece[target_index - 1] == 'p':
                    en_passant_targets = target_index - 8
          else:
               if target_index%8 != 7 and index_piece[target_index + 1] == 'P':
                    en_passant_targets = target_index + 8
               elif target_index%8 != 0 and index_piece[target_index - 1] == 'P':
                    en_passant_targets = target_index + 8
     
          en_passant_targets = str(en_passant_targets)

     FEN = FENpieces + " " + active_color + " " + castling_rights + " " + en_passant_targets + " " + half_move_clock + " " + full_move_number

     return FEN
