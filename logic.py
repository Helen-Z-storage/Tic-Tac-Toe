import random

class TTT_board():
    def __init__(self, board_size):
        self.board_size = board_size
        self.board_num = board_size ** 2
        self.space = [i for i in range(self.board_num)]
        self.visual = ["" for i in range(self.board_num)]

class TTT_player():
    def __init__(self, name, order):
        self.name = name
        self.robot_name = get_robot_name(player_name)
        self.total = 0
        self.win = 0
        self.tie = 0
        self.order = order

# flip the coin and guess
def flip_coin(head_tail):
    # JS: Math.round(Math.random())
    # if same, go first, if not, go second
    coin = random.choice(["H", "T"])
    if coin == head_tail: 
        return 1
    else:
        return 0

# return robot_name by player_name
def get_robot_name(player_name):
    if player_name == "X":
        return "O"
    else:
        return "X"

# re-flip coin for next game
def set_order(head_tail):
    player.order = flip_coin(head_tail)

# re-choose name for next game
def set_name(player_name) {
    player.name = player_name
    player.robot_name = get_robot_name(player_name)
}

# move player first then auto move robot
def next_step(player_move):
    player_step(player_move)
    solution = update_player()
    if solution != "continue":
        return solution
    robot_step()
    return update_player()

def robot_step():
    # if board is full, no need to move
    if len(board.space) == 0:
        return 
    # take one move iff not full
    robot_move = score()
    # update choosed move into board
    update_board(player.robot_name, robot_move)

def player_step(player_move):
    # if board is full, no need to move
    if len(board.space) == 0:
        return
    # update choosed move into board
    update_board(player.name, player_move)

# return index that can stop player win or let robot win immediantly, return -1 if can't
def almost_finish():
    max_index = []
    for i in board.space: # jump over if cell is not empty
        # find row, col, and diag values of current i
        vals = [curr_row(i)] + [curr_col(i)] + curr_diag(i)
        # remove empty cell
        un_empty_vals = [list(filter(None, val)) for val in vals]
        
        # find place that robot or player can win immediantly
        len_vals = [val for val in un_empty_vals if len(val) == board.board_size - 1]
        wins = [all(val == line[0] for val in line) for line in len_vals]
        while any(wins):
            index = wins.index(True)
            # robot wins
            if len_vals[index][0] == player.robot_name:
                return i
            # player wins
            else:
                max_index.append(i)
            wins = wins[index + 1:]
    if not max_index:
        return -1
    # Math.floor(Math.random() * len(lst)) in JS
    return random.choice(max_index)

# can't stop or win immediantly, but still possible to win
def possible_win():
    # choose center first
    size = board.board_size
    num = board.board_num
    if size % 2:
        center = (num - 1) // 2
        if center in board.space:
            return center
    else:
        x = size // 2
        centers = [size * (x - 1) + (x - 1), size * (x - 1) + x, \
                   size * x + (x - 1), size * x + x]
        unused_center = [center for center in centers if center in board.space]
        if unused_center:
            return random.choice(unused_center)
    # then choose corner
    corners = [0, size - 1, num - 1, num - size]
    unused_corner = [corner for corner in corners if corner in board.space]
    if unused_corner:
        return random.choice(unused_corner)
    return -1

# score every non-choosed board and then return highest score one
def score():
    end_index = almost_finish()
    if end_index != -1:
        return end_index
        
    possible_index = possible_win()
    if possible_index != -1:
        return possible_index
    
    # otherwise random choose in board.space
    # Math.floor(Math.random() * len(lst)) in JS
    return random.choice(board.space)

# return the value of whole row that num belongs
def curr_row(num):
    row = num // board.board_size
    ids = [row * board.board_size + i for i in range(board.board_size)]
    return [board.visual[i] for i in ids]

# return the value of whole col that num belongs
def curr_col(num):
    col = num % board.board_size
    ids = [col + i * board.board_size for i in range(board.board_size)]
    return [board.visual[i] for i in ids]
    
# return the value of current diagonals
def curr_diag(num):
    # return [left_diag, right_diag] when num is center cell of odd board.board_size
    left_ids = [i for i in range(0, board.board_num, board.board_size + 1)]
    right_ids = [i for i in range(0, board.board_num - 1, board.board_size - 1) if i != 0]
    if board.board_size % 2 and num == ((board.board_num) - 1) // 2:
        return [[board.visual[i] for i in left_ids], [board.visual[i] for i in right_ids]]
    # return [left_diag], or [right_diag] when num is in diagonal
    if num in left_ids:
        return [[board.visual[i] for i in left_ids]]
    if num in right_ids:
        return [[board.visual[i] for i in right_ids]]
    # return [] when num is not in diagonal
    return []

# update choosed move into board
def update_board(name, move):
    board.space.remove(move)
    board.visual[move] = name
    print_board()

# update result into player
def update_player():
    solution = result()
    if solution == "continue":
        return solution
    if solution == "win":
        player.win += 1
    if solution == "tie":
        player.tie += 1
    player.total += 1
    print_result(solution)

# result of the board, call when finished
def result():
    # winning cases
    # vals = [[row1's values in board.visual], [row2's values in board.visual], ...] +
    # [[col1's values in board.visual], [col2's values in board.visual], ...] + 
    # [[left_diag's values in board.visual], [right_diag's values in board.visual]]
    vals = [curr_row(i) for i in range(0, board.board_num, board.board_size)] + \
           [curr_col(i) for i in range(0, board.board_size, 1)] + \
           curr_diag(0) + curr_diag(board.board_size - 1)

    wins = [all(val == line[0] for val in line) for line in vals if len(line) == board.board_size]
    if any(wins):
        index = wins.index(True)
        if vals[index][0] == player.name:
            return "win"
        elif vals[index][0] == player.robot_name:
            return "lose"
    if not len(board.space):
        return "tie"
    return "continue"

# clear board 
def clear_board():
    board.space = [i for i in range(board.board_num)]
    board.visual = {i:"" for i in range(board.board_num)}

# print solution
def print_result(solution):
    print(player.name + " " + solution)

# print board
def print_board():
    print("current board is: ")
    for i in range(0, board.board_num, board.board_size):
        board_row = board.visual[i]
        for j in range(1, board.board_size):
            board_row += " | " + board.visual[i + j]
        print(board_row)

board = None
player = None
if __name__ == '__main__':
    # global variables
    board_size = input("choose the size of board: ")
    board = TTT_board(int(board_size))
    name = input("choose X or O: ")
    head_tail = input("choose H or T: ")
    player = TTT_player(name, flip_coin(head_tail))
    print("You are: " + player.name + " and go: " + str(player.order))
    while True:
        solution = update_player()
        while solution == "continue":
            if len(board.space) == board.board_num and player.order == 0:
                solution = robot_step()
            print("valid position is: ")
            print(board.space)
            player_move = input("choose move: ")
            solution = next_step(int(player_move))
        print("player " + player.name + " wins " + str(player.win) + \
              " ties " + str(player.tie) + " in " + str(player.total) + " games")
        clear_board()
        name = input("choose X or O: ")
        set_name(name)
        head_tail = input("choose H or T: ")
        set_order(head_tail)