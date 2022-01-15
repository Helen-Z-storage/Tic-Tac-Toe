"use strict";

var player, board;
// helper function range(), similar with python
function range(stop, start = 0, step = 1) {
    var make_list = Array(Math.floor((stop - start) / step));
    var index = 0;
    for (var i = start; i < stop; i += step) {
        make_list[index] = i;
        index ++;
    }
    return make_list;
}

// create a board
function make_TTT_board() {
    var board_num, board_size = parseInt(get_checked_value("size"));
    board_num = board_size ** 2;
    board = {
        // shape of the board
        board_size: board_size,
        // total number of button in current board
        board_num: board_num,
        // a list of un-clicked button in board
        space: range(board_num),
        // what symbol displayed in current board
        visual: range(board_num).map(_ => "")
    };
    clear_board();
    setTimeout(() => {
            var table = make_TTT_board_table(board_size);
            document.getElementById("board_space").appendChild(table);
            }
        , 1650);

    // not allows to re-create board when not change the size
    var button = document.getElementById("confirm_board");
    button.disabled = true;

    // if already exist a player
    // unlock board for ready on playing
    if (typeof player !== 'undefined') {
        unlock_board();
        // if robot go first, robot move before player
        if (player.order === 0) {
            robot_step();
            update_player();
        }
    }
    return;
}

// create a html board use <table>
function make_TTT_board_table(board_size) {
    var table = document.getElementById("board"), 
        row, cell, btn, id, width = board_size * 25;
    // delete <table id = "board"> if it exist
    if (document.body.contains(table)) {
        document.getElementById("board_space").removeChild(table);
    }

    // create new board
    table = document.createElement("table");
    table.id = "board";
    for (var i = 0; i < board_size; i++) {
        row = document.createElement("tr");
        for (var j = 0; j < board_size; j++) {
            cell = document.createElement("td");
            btn = document.createElement("button");
            btn.type = "button";
            id = (i * board_size) + j;
            btn.id = id;
            btn.innerHTML = "";
            btn.setAttribute("onclick",`next_step(${id});`);
            btn.disabled = true;
            row.appendChild(cell);
            cell.appendChild(btn);
        }
        table.appendChild(row);
    }
    table.setAttribute("style", `width:${width}px;height:${width}px;`);
    return table;
}

// create a player
// DONE
function make_TTT_player() {
    var name = get_checked_value("role"), order = get_checked_value("coin");
    if (typeof player === 'undefined') {
        player = {
            // symbol of player
            name: name,
            // symbol of robot
            robot_name: get_robot_name(name),
            // total number of game
            total: 0,
            // winning times
            win: 0,
            // tie times
            tie: 0,
            // 1 if player go first
            order: order
        };
    // if player already created, update name and order
    } else {
        set_name(name);
        set_order(order);
        clear_board();
    }
    // not allows to re-create player when not change role or order
    var button = document.getElementById("confirm_player");
    button.disabled = true;
    
    // if already exist a board
    // unlock board for ready on playing
    if (typeof board !== 'undefined') {
        unlock_board();
        // if robot go first, robot move before player
        if (player.order === 0) {
            robot_step();
            update_player();
        }
    }
    // display player data
    print_player();
    return;      
}

// flip the coin and guess
// DONE
function flip_coin(head_tail) {
    // if same, go first, if not, go second
    var index = Math.floor(Math.random() * 2);
    var coin = ["H", "T"][index];
    if (coin === head_tail) { //= $("input[type='radio'][name='coin']:checked").val()) {
        return 1;
    } else {
        return 0;
    }
}

// unlock the board when start playing
// DONE
function unlock_board() {
    for (var i = 0; i < board.board_num; i++) {
        document.getElementById(String(i)).disabled = false;
    }
    return;
}

// lock the board when end playing
function lock_board() {
    for (var i = 0; i < board.board_num; i++) {
        document.getElementById(String(i)).disabled = true;
    }
    return;
}

// un-disable confirm button to reset the board or player
// DONE
function able_confirm(button_id) {
    // unlock confirm_player button iff user flip coin and choose symbol
    if (button_id !== "confirm_player" || 
        (get_checked_value("coin") && get_checked_value("role"))) {
        var button = document.getElementById(button_id);
        button.disabled = false;
    }
    return;
}

// return robot_name by player_name
// DONE
function get_robot_name(player_name) {
    if (player_name === "X") {
        return "O";
    } else {
        return "X";
    }
}

// return checked value from radio inputs
// DONE
function get_checked_value(input_name) {
    var nodes = document.getElementsByName(input_name);
    for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].checked) {
            return nodes[i].value;
        }
    }
    return;
}

// re-flip coin for next game
// DONE
function set_order(head_tail) {
    player.order = flip_coin(head_tail);
    print_player();
    return;
}

// re-choose name for next game
// DONE
function set_name(player_name) {
    player.name = player_name;
    player.robot_name = get_robot_name(player_name);
    print_player();
    return;
}

// move player first then auto move robot
// DONE
function next_step(player_move) {
    player_step(player_move);
    var solution = update_player();
    if (solution != "continue") {
        return solution;
    } 
    robot_step();
    return update_player();
}

function robot_step() {
    // if board is full, no need to move
    if (board.space.length === 0) {
        return;
    }
    // take one move iff not full
    var robot_move = score();
    // update choosed move into board
    update_board(player.robot_name, robot_move);
    return;
}

function player_step(player_move) {
    // if board is full, no need to move
    if (board.space.length === 0) {
        return;
    }
    // update choosed move into board
    update_board(player.name, player_move);
    return;
}

// return index that can stop player win or let robot win immediantly, return -1 if can't
function almost_finish() {
    var id, vals, almost_win_vals, wins, 
        index = 0, max_index = [];
    for (var i = 0; i < board.space.length; i++) {
        // jump over if cell is not empty
        id = board.space[i];
        // find row, col, and diag values of current i
        vals = [];
        vals.push(curr_row(id), curr_col(id));
        vals.push.apply(vals, curr_diag(id));
        // remove empty cell and find place that robot or player can win immediantly
        almost_win_vals = vals.filter(
            x => x.filter(Boolean).length === (board.board_size - 1)).map(
                x => x.filter(Boolean));
        
        // when exist possible win, return if robot win, save when player win
        wins = almost_win_vals.map(line => line.every(val => val === line[0]));
        while (wins.some(Boolean)) {
            index = wins.indexOf(true);
            if (index !== -1) {
                // robot wins
                if (almost_win_vals[index][0] == player.robot_name) {
                    return id;
                } else {// player wins
                    max_index.push(id);
                }
                wins = wins.slice(index + 1);
            }
        }
    }
    if (max_index.length) {  
        index = Math.floor(Math.random() * max_index.length);
        return max_index[index];
    }
    return -1;
}

// can't stop or win immediantly, but still possible to win
function possible_win() {
    // choose center first
    var size = board.board_size, num = board.board_num, 
        x, unused_center, centers, 
        unused_corner, corners, index;
    if (size % 2) {
        var center = Math.floor((num - 1) / 2);
        if (board.space.includes(center)) {
            return center;
        }
    } else {
        x = size / 2;
        centers = [size * (x - 1) + (x - 1), size * (x - 1) + x,
                   size * x + (x - 1), size * x + x];
        unused_center = centers.filter(
            center => board.space.includes(center));
        // random choose from unused_center if have one
        if (unused_center.length) {  
            index = Math.floor(Math.random() * unused_center.length);
            return unused_center[index];
        }
    }
    // then choose corner
    corners = [0, size - 1, num - 1, num - size];
    unused_corner = corners.filter(
        corner => board.space.includes(corner));
    // random choose from unused_corner if have one
    if (unused_corner.length) {  
        index = Math.floor(Math.random() * unused_corner.length);
        return unused_corner[index];
    }
    return -1;
}

// score every non-choosed board and then return highest score one
function score() {
    var end_index = almost_finish(), possible_index, index;
    if (end_index !== -1) {
        return end_index;
    }
    possible_index = possible_win()
    if (possible_index !== -1) {
        return possible_index;
    }
    // otherwise random choose in board.space
    index = Math.floor(Math.random() * board.space.length);
    return board.space[index];
}

// return the value of whole row that num belongs
function curr_row(num) {
    var row = Math.floor(num / board.board_size); 
    return range(board.board_size).map(
           i => board.visual[row * board.board_size + i]);
}

// return the value of whole col that num belongs
function curr_col(num) {
    var col = num % board.board_size;
    return range(board.board_size).map(
           i => board.visual[col + i * board.board_size]);
}
  
// return the value of current diagonals
// DONE
function curr_diag(num) {
    // return [left_diag, right_diag] when num is center cell of odd board.board_size
    var left_ids = range(board.board_num, 0, board.board_size + 1),
        right_ids = range(board.board_num - 1, 0, board.board_size - 1).filter(
            i => i !== 0);
    if (board.board_size % 2 && num == Math.floor(((board.board_num) - 1) / 2)) {
        return [left_ids.map(i => board.visual[i]), 
                right_ids.map(i => board.visual[i])];
    }
    // return [left_diag], or [right_diag] when num is in diagonal
    if (left_ids.includes(num)) {
        return [left_ids.map(i => board.visual[i])];
    }
    if (right_ids.includes(num)) {
        return [right_ids.map(i => board.visual[i])];
    }
    // return [] when num is not in diagonal
    return [];
}

// update choosed move into board
function update_board(name, move) {
    board.space = board.space.filter(item => item !== move);
    board.visual[move] = name;
    // unabled choosed button
    var button = document.getElementById(String(move));
    button.innerHTML = name;
    button.disabled = true;
}

// update result into player
function update_player() {
    var solution = result();
    if (solution === "continue") {
        return solution;
    }   
    if (solution === "win") {
        player.win += 1;
    }   
    if (solution === "tie") {
        player.tie += 1;
    }
    player.total += 1;

    // print updated player and result
    print_player();
    print_result(solution);
    return;
}

// result of the board, call when finished
function result() {
    // winning cases
    // vals = [[row1's values in board.visual], [row2's values in board.visual], ...] +
    // [[col1's values in board.visual], [col2's values in board.visual], ...] + 
    // [[left_diag's values in board.visual], [right_diag's values in board.visual]]
    var wins, index,
    vals = range(board.board_num, 0, board.board_size).map(i => curr_row(i));
    vals.push.apply(vals, range(board.board_size).map(i => curr_col(i)));
    vals.push.apply(vals, curr_diag(0));
    vals.push.apply(vals, curr_diag(board.board_size - 1));

    // when exist possible win, return if robot win, save when player win
    wins = vals.filter(line => line.length === (board.board_size)).map(
        line => line.every(val => val === line[0]));

    index = wins.indexOf(true, 0);
    if (index !== -1) {
        if (vals[index][0] == player.name) {
            return "win";
        } else if (vals[index][0] == player.robot_name) {
            return "lose";
        }   
    }
    if (board.space.length === 0) {
        return "tie";
    }
    return "continue";   
}

// clear board 
// DONE
function clear_board() {
    // adding wave anime before clear the board
    var wave_element = document.createElement("div");
    wave_element.className = "spread";
    var wave, waves = document.createElement("div");
    waves.className = "box background-wave";
    for (var i = 1; i <= 4; i++) {
        wave = document.createElement("div");
        wave.className = "background-wave" + i;
        waves.appendChild(wave);
    }
    wave_element.appendChild(waves);
    document.body.appendChild(wave_element);

    // after 3s anime finished, remove anime
    setTimeout(() => document.body.removeChild(wave_element), 9000);

    if (typeof board === 'undefined' || typeof player === 'undefined' ) {
        // do nothing when board is not set yet or player is not build
        return;
    }
    setTimeout(() => {
            var button;
            board.space = range(board.board_num);
            board.visual = range(board.board_num).map(_ => "");
            for (var i = 0; i < board.board_num; i++) {
                button = document.getElementById(String(i));
                button.innerHTML = "";
                button.disabled = false;
            }
        }, 1800);

    return;
}

// print solution
function print_result(solution) {
    var label = document.getElementById("result");
    if (typeof player === 'undefined') {
        label.innerHTML = "";
    } else {
        lock_board();
        label.innerHTML = `You ${solution}`;
    }
    return;
}

// print player data
// DONE
function print_player() {
    var label = document.getElementById("player");
    if (typeof player === 'undefined') {
        label.innerHTML = "";
    } else {
        var order;
        if (player.order) {
            order = "first";
        } else {
            order = "second";
        }
        label.innerHTML = `You're symbol: ${player.name}<br />` + 
                          `You're going: ${order}<br />` +
                          `You're playing: ${player.total} games<br />` +
                          `You're winning: ${player.win} times<br />`+
                          `You're tied: ${player.tie} times`;
    }
    return;
}
