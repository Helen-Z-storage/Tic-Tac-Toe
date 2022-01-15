import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

if (typeof window !== 'undefined') {
    window.React = React;
}

// child compoment Player
class Player extends React.Component{
    constructor(props){
        super(props);
        this.state = {player: this.props.player};
    }

    make_TTT_player() {
        this.props.make_TTT_player(
            get_checked_value("role"), get_checked_value("coin"));
    }

    able_confirm(id) {this.props.able_confirm(id);}
    
    render(){
        return (
            <td id = "create_player">
                <input type="radio" name="role" id = "X" value="X" 
                    onClick={(e) => this.able_confirm("confirm_player", e)} />
                <label htmlFor="X">X</label>
                <input type="radio" name="role" id = "O" value="O" 
                    onClick={(e) => this.able_confirm("confirm_player", e)} />
                <label htmlFor="O">O</label>
                <br />
                <input type="radio" name="coin" id = "head" value="H" 
                    onClick={(e) => this.able_confirm("confirm_player", e)} />
                <label htmlFor="head">Head</label>
                <input type="radio" name="coin" id = "tail" value="T" 
                    onClick={(e) => this.able_confirm("confirm_player", e)} />
                <label htmlFor="tail">Tail</label>
                <br />
                <button type="button" id = "confirm_player" 
                    disabled = {this.state.player.disabled} 
                    onClick={(e) => this.make_TTT_player(e)}>
                        confirm player decision
                </button>
            </td>
        )
    }
}

// child compoment Board
class Board extends React.Component{
    constructor(props){
        super(props);
        this.state = {board: this.props.board};
    }

    make_TTT_board() {
        this.props.make_TTT_board(parseInt(get_checked_value("size")));
    }

    able_confirm(id) {this.props.able_confirm(id);}

    next_step(id) {this.props.next_step(id);}

    render(){        
        return (
            <td id = "create_board">
                <input type="radio" name="size" id = "size_3" value="3" 
                    onClick={(e) => this.able_confirm("confirm_board", e)} />
                <label htmlFor="size_3">3</label>
                <input type="radio" name="size" id = "size_4" value="4" 
                    onClick={(e) => this.able_confirm("confirm_board", e)} />
                <label htmlFor="size_4">4</label>
                <br />
                <input type="radio" name="size" id = "size_5" value="5" 
                    onClick={(e) => this.able_confirm("confirm_board", e)} />
                <label htmlFor="size_5">5</label>
                <input type="radio" name="size" id = "size_6" value="6" 
                    onClick={(e) => this.able_confirm("confirm_board", e)} />
                <label htmlFor="size_6">6</label>
                <br />
                <button type="button" id = "confirm_board" 
                    disabled = {this.state.board.disabled} 
                    onClick={(e) => this.make_TTT_board(e)}>
                        confirm board size
                </button>
            </td>
        )
    }
}

// parent compoment Game
class Game extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            player: {
                // symbol of player
                name: "",
                // symbol of robot
                robot_name: "",
                // total number of game
                total: 0,
                // winning times
                win: 0,
                // tie times
                tie: 0,
                // 1 if player go first
                order: -1,
                // store current game result in player
                result: "",
                // whether disable confirm button of player
                disabled: true
            },
            board: {
                // shape of the board
                board_size: 0,
                // total number of button in board
                board_num: 0,
                // a list of un-clicked button in board
                space: [],
                // what symbol displayed in current board
                visual: [],
                // whether disable confirm button of board
                disabled: true,
                // whether the game is finished
                finished: true,
                // whether clear the board
                clear: false
            }
        }
    }
    
    // creaters
    // create a player
    make_TTT_player(name, order) {
        // update name and order
        this.set_name(name);
        this.set_order(order);

        // not allows to re-create player when not change role or order
        let player, board;
        ({player, board} = this.state);
        player.disabled = true;
        this.setState({player, board});

        // unlock board and do robot's first move
        this.clear_board();
        return;      
    }

    // create a board
    make_TTT_board(board_size) {
        if (board_size) {
    
            // not allows to re-create board when not change the size
            let player, board;
            ({player, board} = this.state);
            board.disabled = true;

            // unlock board and do robot's first move
            this.clear_board();
            setTimeout(() => {
                // reset the new board_size and board_num
                var board_num = board_size ** 2;
                this.set_size(board_size);
                this.set_board(board_num);
                board.finished = false;
                this.setState({player, board})}, 1000);
        }
        return;
    }
    
    // setters
    // re-flip coin for next game
    set_order(head_tail) {
        setTimeout(() => {
            let player, board;
            ({player, board} = this.state);
            player.order = flip_coin(head_tail);
            this.setState({player, board})}, 1000);
        return;
    }

    // re-choose name for next game
    set_name(player_name) {
        
        setTimeout(() => {
            let player, board;
            ({player, board} = this.state);
            player.name = player_name;
            player.robot_name = get_robot_name(player_name);
            this.setState({player, board})}, 1000);
        return;
    }

    // re-set current game result
    set_result(result) {
        setTimeout(() => {
            let player, board;
            ({player, board} = this.state);
            player.result = result;
            this.setState({player, board})}, 1000);
        return;
    }

    // re-set board_size
    set_size(board_size) {
        let player, board;
        ({player, board} = this.state);
        board.board_size = board_size;
        this.setState({player, board});
        return;
    }

    // re-set whole board
    set_board(board_num) {
        setTimeout(() => {
            let player, board, range_lst = range(board_num);
            ({player, board} = this.state);
            board.board_num = board_num;
            board.space = range_lst;
            board.visual = range_lst.map(_ => "");
            this.setState({player, board})}, 1000);
        return;
    }

    // helpers
    // clear board and reset data, unlock board, and do robot's first move
    // DONE
    clear_board() {
        // do nothing when board is not set yet
        let player, board;
        ({player, board} = this.state);
        board.clear = true;
        this.setState({player, board})

        if (board.board_num === 0 || player.name === "") {
            // do nothing when board is not set yet or player is not build
            return;
        }
        // clear board.space and board.visual, and player.result
        if (board.board_num !== 0) {
            this.set_board(board.board_num);
            this.set_result("");

            // if both player and board are created, unlock the board
            if (player.name !== "") {
                board.finished = false;
            }

            // if robot go first, robot move before player
            if (player.order === 0) {
                this.robot_step();
                this.update_player();
            }
        }
        this.setState({player, board});
        return;
    }
    
    // un-disable confirm button to reset the board or player
    // DONE
    able_confirm(button_id) {
        let player, board;
        ({player, board} = this.state);
        if (button_id !== "confirm_player") {
            board.disabled = false;
        } else if (get_checked_value("coin") && get_checked_value("role")) {
            // unlock confirm_player button iff user flip coin and choose symbol
            player.disabled = false;
        }
        this.setState({player, board});
        return;
    }

    // updaters
    // update choosed move into board
    update_board(name, move) {
        let player, board;
        ({player, board} = this.state);
        board.space = board.space.filter(item => item !== move);
        board.visual[move] = name;
        this.setState({player, board})
        return;
    }

    // update result into player, return 1 when game is finished
    update_player() {
        var solution = result(this.state);
        let player, board;
        ({player, board} = this.state);
        if (solution === "continue") {
            return 1;
        }
        // lock board if exist solution
        board.finished = true;   
        if (solution === "win") {
            player.win += 1;
        }   
        if (solution === "tie") {
            player.tie += 1;
        }
        player.total += 1;

        // updated result to player
        this.set_result(solution);
        this.setState({player, board})
        return 0;
    }

    // basic moving logic of game
    // move player first then auto move robot
    next_step(player_move) {
        this.player_step(player_move);
        if (this.update_player()) {
            this.robot_step();
            this.update_player();
        } 
        return;
    }

    robot_step() {
        // take one robot move iff board is not 
        let player, board;
        ({player, board} = this.state);
        if (board.space.length !== 0) {
            var robot_move = score(board, player.robot_name);
            // update choosed move into board
            this.update_board(player.robot_name, robot_move);
        }
        return;
    }

    player_step(player_move) {
        // take one player move iff board is not full
        let player, board;
        ({player, board} = this.state);
        if (board.space.length !== 0) {
            // update choosed move into board
            this.update_board(player.name, player_move);
        }
        return;
    }

    render(){
        let player, board;
        ({player, board} = this.state);
        var solution, result = player.result, clear = board.clear;
        if (result !== "") {
          solution = <label id = "result">You are {result}!</label>;
        } else {
            solution = <label id = "result"></label>
        }
        if (clear) {
            // after 3s anime finished, remove anime
            setTimeout(() => {
                board.clear = false;
                this.setState({player, board})}, 1500);
        }
        
        // display nothing if board is not created
        var table, board_size = board.board_size;
        if (!board_size) {
            table = <div></div>;
        // create square board by board_size and render 
        } else {
            var size_range = range(board_size), width = board_size * 25;

            let table_rows = size_range.map(i => {
                let table_cells = size_range.map(j => {
                    var id = (i * board_size) + j;
                    return <td key = {id}><button id = {"btn_" + id} 
                            disabled = {board.finished || (board.visual[id] !== "")} 
                            onClick={(e) => this.next_step(id, e)} 
                            dangerouslySetInnerHTML={{ __html:board.visual[id]}}/>
                            </td>;})   
                return <tr key = {i}>{table_cells}</tr>;});
            
            table = <table id = "board" style={{width:{width}, height:{width}}}><tbody>{table_rows}</tbody></table>;
            
        }
        
        var order, player_data;
        // display nothing if player is not created
        if (this.state.player.name === "") {
            player_data = <td></td>;
        } else {
            if (this.state.player.order) {
                order = "first";
            } else {
                order = "second";
            }
            player_data = 
            <td id = "display_player">
                <div className="text">
                    You're symbol: {this.state.player.name}</div>
                <div className="text">
                    You're going: {order}</div>
                <div className="text">
                    You're playing: {this.state.player.total} games</div>
                <div className="text">
                    You're winning: {this.state.player.win} times</div>
                <div className="text">
                    You're tied: {this.state.player.tie} times</div>
            </td>
        }

        return (
            <div>
            <table id="console">
                  <thead id="title">
                        <tr>
                              <td colSpan="3">
                                    <h1 id='warped'>
                                          <span className='w0'>T</span><span className='w1'>i</span><span className='w2'>c</span><span className='w3'> </span><span className='w4'>T</span><span className='w5'>a</span><span className='w6'>c</span><span className='w7'> </span><span className='w8'>T</span><span className='w9'>o</span><span className='w10'>e</span>
                                    </h1>
                              </td>
                        </tr>
                  </thead>
                  <tbody>
                        <tr> 
                              
                                    <Board board = {this.state.board}
                                        make_TTT_board = {
                                            (board_size) => this.make_TTT_board(board_size)}
                                        able_confirm = {
                                            (button_id) => this.able_confirm(button_id)}
                                        next_step = {
                                            (player_move) => this.next_step(player_move)}/>
                              
                              

                              <Player player = {this.state.player}
                                make_TTT_player = {
                                    (name, order) => {this.make_TTT_player(name, order)}}
                                able_confirm = {
                                    (button_id) => this.able_confirm(button_id)}/>
                            
                              
                              
                                  {player_data}
                              
                        </tr>
                        <tr>
                            <td id="display_result" colSpan="3"> 
                                {solution}
                                <button type="button" onClick={(e) => this.clear_board(e)}> restart </button>
                            </td>
                        </tr>
                        <tr>
                              <td id = "board_space" colSpan="3">
                                {table}
                              </td>
                        </tr>
                  </tbody>
            </table>
            <div className = {clear? "spread": ""}>
                <div className = {clear? "box background-wave": ""}>
                    <div className= {clear? "background-wave1": ""}></div>
                    <div className= {clear? "background-wave2": ""}></div>
                    <div className= {clear? "background-wave3": ""}></div>
                    <div className= {clear? "background-wave4": ""}></div>
                </div>
            </div>
            </div>
        )
    }
}
  
ReactDOM.render(
    <Game></Game>,
    document.getElementById('root')
); 



// helper functions
// helper function range(), similar with python
// DONE
function range(stop, start = 0, step = 1) {
    var make_list = Array(Math.floor((stop - start) / step));
    var index = 0;
    for (var i = start; i < stop; i += step) {
        make_list[index] = i;
        index ++;
    }
    return make_list;
}


// flip the coin and guess
// DONE
function flip_coin(head_tail) {
    // if same, go first, if not, go second
    var index = Math.floor(Math.random() * 2);
    var coin = ["H", "T"][index];
    if (coin === head_tail) {
        return 1;
    } else {
        return 0;
    }
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

// return the value of whole row that num belongs
function curr_row(num, board) {
    var row = Math.floor(num / board.board_size); 
    return range(board.board_size).map(
           i => board.visual[row * board.board_size + i]);
}

// return the value of whole col that num belongs
function curr_col(num, board) {
    var col = num % board.board_size;
    return range(board.board_size).map(
           i => board.visual[col + i * board.board_size]);
}
  
// return the value of current diagonals
// DONE
function curr_diag(num, board) {
    // return [left_diag, right_diag] when num is center cell of odd board.board_size
    var left_ids = range(board.board_num, 0, board.board_size + 1),
        right_ids = range(board.board_num - 1, 0, board.board_size - 1).filter(
            i => i !== 0);
    if (board.board_size % 2 && num === Math.floor(((board.board_num) - 1) / 2)) {
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

// return index that can stop player win or let robot win immediantly, return -1 if can't
function almost_finish(board, robot_name) {
    var id, vals, almost_win_vals, wins, 
        index = 0, max_index = [];
    for (var i = 0; i < board.space.length; i++) {
        // jump over if cell is not empty
        id = board.space[i];
        // find row, col, and diag values of current i
        vals = [];
        vals.push(curr_row(id, board), curr_col(id, board));
        vals.push.apply(vals, curr_diag(id, board));
        // remove empty cell and find place that robot or player can win immediantly
        almost_win_vals = vals.filter(
            x => x.filter(Boolean).length === (board.board_size - 1)).map(
                x => x.filter(Boolean));
        
        // when exist possible win, return if robot win, save when player win
        wins = almost_win_vals.map(
            line => line.every(val => val === line[0]));
        while (wins.some(Boolean)) {
            index = wins.indexOf(true);
            if (index !== -1) {
                // robot wins
                if (almost_win_vals[index][0] === robot_name) {
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
function possible_win(board) {
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
function score(board, robot_name) {
    var end_index = almost_finish(board, robot_name), possible_index, index;
    if (end_index !== -1) {
        return end_index;
    }
    possible_index = possible_win(board);
    if (possible_index !== -1) {
        return possible_index;
    }
    // otherwise random choose in board.space
    index = Math.floor(Math.random() * board.space.length);
    return board.space[index];
}


// result of the board, call when finished
function result(state) {
    // winning cases
    // vals = [[row1's values in board.visual], [row2's values in board.visual], ...] +
    // [[col1's values in board.visual], [col2's values in board.visual], ...] + 
    // [[left_diag's values in board.visual], [right_diag's values in board.visual]]
    var wins, index, player, board, vals;
    ({player, board} = state);
    vals = range(board.board_num, 0, board.board_size).map(i => curr_row(i, board));
    vals.push.apply(vals, range(board.board_size).map(i => curr_col(i, board)));
    vals.push.apply(vals, curr_diag(0, board));
    vals.push.apply(vals, curr_diag(board.board_size - 1, board));

    // when exist possible win, return if robot win, save when player win
    wins = vals.filter(line => line.length === (board.board_size)).map(
        line => line.every(val => val === line[0]));

    index = wins.indexOf(true, 0);
    if (index !== -1) {
        if (vals[index][0] === player.name) {
            return "win";
        } else if (vals[index][0] === player.robot_name) {
            return "lose";
        }   
    }
    if (board.space.length === 0) {
        return "tie";
    }
    return "continue";   
}