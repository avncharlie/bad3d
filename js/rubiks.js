/*
Cube string is 54 character string, 6 characters per face, in below format:
UUUUUUUUUR...F...D...L...B...

The order of facelets in faces will be organised as such:
             +------------+
             | U1  U2  U3 |
             |            |
             | U4  U5  U6 |
             |            |
             | U7  U8  U9 |
+------------+------------+------------+------------+
| L1  L2  L3 | F1  F2  F3 | R1  R2  R3 | B1  B2  B3 |
|            |            |            |            |
| L4  L5  L6 | F4  F5  F6 | R4  R5  R6 | B4  B5  B6 |
|            |            |            |            |
| L7  L8  L9 | F7  F8  F9 | R7  R8  R9 | B7  B8  B9 |
+------------+------------+------------+------------+
             | D1  D2  D3 |
             |            |
             | D4  D5  D6 |
             |            |
             | D7  D8  D9 |
             +------------+
 */


function RubiksCube(cube_str) {
    if (cube_str === undefined) {
        this.state = RubiksCube.state_from_string(RubiksCube.identity_string);
    } else {
        this.state = RubiksCube.state_from_string(cube_str);
    }
    this.moves = [];
}

RubiksCube.prototype.clone = function() {
    let clone = new RubiksCube();
    clone.state = this.clone_state();
    clone.moves = this.moves.slice(); // INCORRECT
    return clone;
}

RubiksCube.prototype.clone_state = function() {

    function clone_face(face) {
        return [
            face[0].slice(),
            face[1].slice(),
            face[2].slice(),
        ]
    }

    return {
        'U': clone_face(this.state.U),
        'R': clone_face(this.state.R),
        'F': clone_face(this.state.F),
        'D': clone_face(this.state.D),
        'L': clone_face(this.state.L),
        'B': clone_face(this.state.B),
    }
}

RubiksCube.prototype.get_facelet_slice = function(axis, index, only_edges) {
    let rotation = this.face_rotations(axis, index);
    if (axis == 'U') {
        rotation.reverse();
    }
    
    // get slice of facelets on axis and index
    let rotation_facelets = [];
    for (let y = 0; y < rotation.length + 1; y++) {
        let curr_face = rotation[y % rotation.length];

        for (let x = 0; x < 3; x++) {

            let index = x;
            if (curr_face.reverse_count) {
                index = 2 - x;
            }

            let index1;
            let index2;

            if (curr_face.is_horizontal) {
                index1 = curr_face.index;
                index2 = index;
            } else {
                index1 = index;
                index2 = curr_face.index;
            }

            if (only_edges && x == 1) {
                rotation_facelets.push([curr_face.face, index1, index2]);
            } else if (!only_edges) {
                rotation_facelets.push([curr_face.face, index1, index2]);
            }
        }
    }

    return rotation_facelets;
}

// call with either 3 args or list of 3 args
RubiksCube.prototype.get_connected_facelets = function(face, x, y) {

    if (x == undefined) {
        [face, x, y] = face;
    }

    let connected = [];

    let axises = ['F', 'R', 'U'];

    // dumb brute force
    // should be smart way to do this
    // basically getting every facelet slice, finding face and finding adjacent
    // facelets that are on different faces
    for (let i = 0; i < axises.length; i++) {
        let axis = axises[i];
        for (let index = 0; index < 3; index++) {
            let rotation_facelets = this.get_facelet_slice(axis, index);

            for (r = 0; r < rotation_facelets.length; r++) {
                let [r_face, i1, i2] = rotation_facelets[r];
                if (r_face == face && i1 == x && i2 == y) {
                    // if connected face is different, win (must be connected on other face)
                    if (r != 0 && rotation_facelets[r-1][0] != face) {
                        connected.push(rotation_facelets[r-1]);
                    } else if (r != rotation_facelets.length-1 && rotation_facelets[r+1][0] != face) {
                        connected.push(rotation_facelets[r+1]);
                    }
                }
            }
        }
    }
    return connected;
}

RubiksCube.prototype.face_rotations = function(axis, index) {
    switch (axis) {
        case 'F':
            return [
                {
                    face: 'U',
                    is_horizontal: true,
                    index: 2-index,
                    reverse_count: false
                },
                {
                    face: 'R',
                    is_horizontal: false,
                    index: index,
                    reverse_count: false
                },
                {
                    face: 'D',
                    is_horizontal: true,
                    index: index,
                    reverse_count: true 
                },
                {
                    face: 'L',
                    is_horizontal: false,
                    index: 2-index,
                    reverse_count: true 
                },
            ];
        case 'R':
            return [
                {
                    face: 'U',
                    is_horizontal: false,
                    index: 2-index,
                    reverse_count: true 
                },
                {
                    face: 'B',
                    is_horizontal: false,
                    index: index,
                    reverse_count: false
                },
                {
                    face: 'D',
                    is_horizontal: false,
                    index: 2-index,
                    reverse_count: true 
                },
                {
                    face: 'F',
                    is_horizontal: false,
                    index: 2-index,
                    reverse_count: true 
                },
            ];
        case 'U':
            return [
                {
                    face: 'L',
                    is_horizontal: true,
                    index: index,
                    reverse_count: false 
                },
                {
                    face: 'B',
                    is_horizontal: true,
                    index: index,
                    reverse_count: false 
                },
                {
                    face: 'R',
                    is_horizontal: true,
                    index: index,
                    reverse_count: false
                },
                {
                    face: 'F',
                    is_horizontal: true,
                    index: index,
                    reverse_count: false 
                },
          ];
    }
}

RubiksCube.prototype.rotate_facelet_slice = function(axis, index, rotate_right) {
    let affected_faces = this.face_rotations(axis, index);

    if (!rotate_right) {
        affected_faces.reverse();
    }

    let new_state = this.clone_state();

    let last_face = undefined;

    for (let i = 0; i < affected_faces.length + 1; i++) {
        let curr_face = affected_faces[i % affected_faces.length];

        let current_face_list = [];

        for (let x = 0; x < 3; x++) {

            let index = x;
            if (curr_face.reverse_count) {
                index = 2 - x;
            }

            let index1;
            let index2;

            if (curr_face.is_horizontal) {
                index1 = curr_face.index;
                index2 = index;
            } else {
                index1 = index;
                index2 = curr_face.index;
            }

            if (last_face !== undefined) {
                let r = this.state[last_face[x][0]][last_face[x][1]][last_face[x][2]];
                new_state[curr_face.face][index1][index2] = r
            }

            current_face_list.push([curr_face.face, index1, index2]);
        }

        last_face = current_face_list;
    }

    this.state = new_state;
}

RubiksCube.prototype.rotate_facelets = function(face, rotate_right) {
    let facelets = this.state[face];

    let order = [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [2, 1],
        [2, 0],
        [1, 0]
    ]

    let rotated_face = [[], [], []];

    // doesn't get rotate
    rotated_face[1][1] = facelets[1][1];

    let add_amt = 6;
    if (rotate_right) {
        add_amt = 2;
    }

    for (let i = 0; i < order.length; i++) {
        let orig_index = order[i];
        let rotated_index = order[Math.abs(i+add_amt) % order.length];
        
        rotated_face[rotated_index[0]][rotated_index[1]] = facelets[orig_index[0]][orig_index[1]];
    }

    this.state[face] = rotated_face;
}

RubiksCube.prototype.move = function(move) {
    this.moves.push(move); // record move (for solves)

    // apply move to cube

    let is_prime = false;
    if (move.includes("'")) {
        is_prime = true;
    }

    let reps = 1;
    if (move.includes('2')) {
        reps = 2;
    }

    let m = move[0];

    for (let x = 0; x < reps; x++) {
        switch (m) {
            case 'f':
            case 'F':
                this.rotate_facelets('F', !is_prime);
                this.rotate_facelet_slice('F', 0, !is_prime);
                if (m == 'f') {
                    this.rotate_facelet_slice('F', 1, !is_prime);
                }
                break;
            case 'b':
            case 'B':
                this.rotate_facelets('B', !is_prime);
                this.rotate_facelet_slice('F', 2, is_prime);
                if (m == 'b') {
                    this.rotate_facelet_slice('F', 1, is_prime);
                }
                break;
            case 'r':
            case 'R':
                this.rotate_facelets('R', !is_prime);
                this.rotate_facelet_slice('R', 0, !is_prime);
                if (m == 'r') {
                    this.rotate_facelet_slice('R', 1, !is_prime);
                }
                break;
            case 'l':
            case 'L':
                this.rotate_facelets('L', !is_prime);
                this.rotate_facelet_slice('R', 2, is_prime);
                if (m == 'l') {
                    this.rotate_facelet_slice('R', 1, is_prime);
                }
                break;
            case 'u':
            case 'U':
                this.rotate_facelets('U', !is_prime);
                this.rotate_facelet_slice('U', 0, !is_prime);
                if (m == 'u') {
                    this.rotate_facelet_slice('U', 1, !is_prime);
                }
                break;
            case 'd':
            case 'D':
                this.rotate_facelets('D', !is_prime);
                this.rotate_facelet_slice('U', 2, is_prime);
                if (m == 'd') {
                    this.rotate_facelet_slice('U', 1, is_prime);
                }
                break;
            case 'M':
                this.rotate_facelet_slice('R', 1, is_prime);
                break;
            case 'E':
                this.rotate_facelet_slice('U', 1, is_prime);
                break;
            case 'S':
                this.rotate_facelet_slice('F', 1, !is_prime);
                break;
            case 'x':
                this.rotate_facelets('R', !is_prime);
                this.rotate_facelet_slice('R', 0, !is_prime);
                this.rotate_facelet_slice('R', 1, !is_prime);
                this.rotate_facelet_slice('R', 2, !is_prime);
                this.rotate_facelets('L', is_prime);
                break;
            case 'y':
                this.rotate_facelets('U', !is_prime);
                this.rotate_facelet_slice('U', 0, !is_prime);
                this.rotate_facelet_slice('U', 1, !is_prime);
                this.rotate_facelet_slice('U', 2, !is_prime);
                this.rotate_facelets('D', is_prime);
                break;
            case 'z':
                this.rotate_facelets('F', !is_prime);
                this.rotate_facelet_slice('F', 0, !is_prime);
                this.rotate_facelet_slice('F', 1, !is_prime);
                this.rotate_facelet_slice('F', 2, !is_prime);
                this.rotate_facelets('B', is_prime);
                break;
        }
    }
}

RubiksCube.generate_moves = function() {
    let base_moves = [
        'U',
        'R',
        'F',
        'D',
        'L',
        'B',

        'u',
        'r',
        'f',
        'd',
        'l',
        'b',

        'M',
        'E',
        'S',

        'x',
        'y',
        'z',
    ];

    let moves = base_moves.slice();

    for (let x = 0; x < base_moves.length; x++) {
        moves.push(base_moves[x] + "'");
        moves.push(base_moves[x] + "2");
    }

    return moves;
}

RubiksCube.moves = RubiksCube.generate_moves();

RubiksCube.inverse_moves = function(moves) {
    let inverted = [];
    for (let x = moves.length - 1; x >= 0; x--) {
        let move = moves[x];

        if (move.includes('2')) {
            inverted.push(move);
        } else if (move.includes("'")) {
            inverted.push(move.slice(0,-1));
        } else {
            inverted.push(move + "'");
        }
    }

    return inverted;
}

RubiksCube._generate_nice_moves = function() {
    let moves = [];
    for (let m = 0; m < RubiksCube.moves.length; m++) {
        let move = RubiksCube.moves[m];
        if (move[0] !== 'M' && move[0] !== 'E' && move[0] !== 'S' && move !== 'x2' && move !== 'y2' && move !== 'z2') {
            moves.push(RubiksCube.moves[m]);
        }
    }
    return moves;
}

RubiksCube.generate_scramble = function(length, avoid) {

    let moves = RubiksCube._generate_nice_moves();

    function get_rand_move() {
        let r = moves[Math.floor(Math.random()*moves.length)];
        if (avoid !== undefined) {
            while (avoid.includes(r)) {
                r = moves[Math.floor(Math.random()*moves.length)];
            }
        }
        return r;
    }


    let scramble = [];
    for (let x = 0; x < length; x++) {
        let rand = get_rand_move();
        if (x == 0) {
            scramble.push(rand);
        } else {
            let last = scramble[scramble.length - 1];
            while (rand[0] == last[0]) {
                rand = get_rand_move();
            }
            scramble.push(rand);
        }
    }

    return scramble;
}

RubiksCube.string_from_state = function (state) {

    let s = '';

    let order = ['U', 'R', 'F', 'D', 'L', 'B'];

    for (let face_index = 0; face_index < 6; face_index++) {
        let curr_face = order[face_index];

        for (let x = 0; x < 3; x++) {
            s += state[curr_face][x].join('');
        }
    }

    return s;
}

RubiksCube.state_from_string = function (s) {

    let state = {};

    let order = ['U', 'R', 'F', 'D', 'L', 'B'];

    for (let face_index = 0; face_index < 6; face_index++) {
        let curr_face = order[face_index];

        let face = '';
        for (let facelet_index = 0; facelet_index < 9; facelet_index++) {
            face += s[face_index*9 + facelet_index];
        }

        state[curr_face] = [
            face.slice(0,3).split(''),
            face.slice(3,6).split(''),
            face.slice(6,9).split(''),
        ]
    }

    return state;
}

RubiksCube.identity_string = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

// Generic cube solver class
function Solver(cube) {
    this.cube = cube.clone();
    this.cube.moves = []; // reset move recording
    this.solution = [];
}

// record a phase of a solve (i.e cross solve, f2l, etc)
Solver.prototype.push_phase = function(phase_name) {
    this.solution.push({
        phase: phase_name,
        moves: this.cube.moves.slice()
    })
    this.cube.moves = []; // reset moves for next phase
}

// find center piece
Solver.prototype.find_center = function(center) {
    if (this.cube.state.U[1][1] == center) {
        return 'U'
    } if (this.cube.state.R[1][1] == center) {
        return 'R'
    } if (this.cube.state.F[1][1] == center) {
        return 'F'
    } if (this.cube.state.D[1][1] == center) {
        return 'D'
    } if (this.cube.state.L[1][1] == center) {
        return 'L'
    } if (this.cube.state.B[1][1] == center) {
        return 'B'
    }
}

// orient cube 
Solver.prototype.orient_center = function(center_to_orient, orient_location) {
    switch (this.find_center('U')) {
        case 'R':
            this.cube.move("z'");
            break;
        case 'L':
            this.cube.move("z");
            break;
        case 'F':
            this.cube.move("x");
            break;
        case 'B':
            this.cube.move("x'");
            break;
        case 'D':
            this.cube.move("x2");
            break;
    }
}

Solver.prototype.edges_on_face = function(face, check_colour) {
    let correct = [];

    if (this.cube.state[face][0][1] == check_colour) {
        correct.push([0, 1]);
    } if (this.cube.state[face][1][0] == check_colour) {
        correct.push([1, 0]);
    } if (this.cube.state[face][1][2] == check_colour) {
        correct.push([1, 2]);
    } if (this.cube.state[face][2][1] == check_colour) {
        correct.push([2, 1]);
    }

    return correct;
}

Solver.prototype.face_center_colour = function(facelet) {
    let [f, i1, i2] = facelet;
    return this.cube.state[f][1][1];
}

Solver.prototype.center_piece_side = function(colour) {
    let faces = ['U', 'R', 'F', 'D', 'L', 'B'];
    for (let f = 0; f < faces.length; f++) {
        let curr_face = faces[f]
        if (this.cube.state[curr_face][1][1] == colour) {
            return curr_face;
        }
    }
}

Solver.prototype._face_to_colour = function(colour) {
    switch (colour) {
        case 'U':
            return 'white';
        case 'L':
            return 'green';
        case 'F':
            return 'red';
        case 'R':
            return 'blue';
        case 'D':
            return 'yellow';
        case 'B':
            return 'orange';
    }
}

Solver.prototype.facelet_colour = function(facelet) {
    let [f, x, y] = facelet;
    return this.cube.state[f][x][y];
}

// how many rotations to align edge with its center piece
// params: 
//   sequence, edge facelet and rotation (uses facelet + facelet center piece colours)
//   OR
//   sequence, colour1, colour2, rotation (user specifies colours0
Solver.prototype.align_edge = function(sequence, edge_facelet, rotation, r) {
    let edge_colour;
    let curr_face;

    if (typeof edge_facelet === 'string') {
        edge_colour = edge_facelet;
        curr_face = rotation;
        rotation = r;
    } else {
        edge_colour = this.facelet_colour(edge_facelet);
        curr_face = this.face_center_colour(edge_facelet);
    }

    // calculate moves needed to orient edge to colour
    let loc = sequence.indexOf(curr_face);
    let plus_two = sequence[(loc+2) % sequence.length];
    let plus_one = sequence[(loc+1) % sequence.length];
    let minus_one = sequence[mod((loc-1), sequence.length)];

    // orient edge  

    if (plus_two == edge_colour) {
        this.cube.move(rotation + "2");
    } else if (plus_one == edge_colour) {
        this.cube.move(rotation);
    } else if (minus_one == edge_colour) {
        if (rotation.includes("'")) {
            this.cube.move(rotation.slice(0,-1));
        } else {
            this.cube.move(rotation+"'");
        }
    }
}

// beginners method solver (extends generic solver)
Object.setPrototypeOf(
    BeginnersMethodSolver.prototype,
    Solver.prototype,
)

function BeginnersMethodSolver(cube) {
    Solver.call(this, cube);
}

// works with negative
function mod(n, m) {
    return ((n % m) + m) % m;
}

// pass white facelet to this function
BeginnersMethodSolver.prototype.align_flipped_bottom_edge = function(sequence, flipped_facelet) {
    let edge_facelet = this.cube.get_connected_facelets(flipped_facelet)[0];
    let edge_colour = this.facelet_colour(edge_facelet);

    // align edge
    this.align_edge(sequence, edge_colour,
        this.face_center_colour(flipped_facelet), 'D');

    // move edge to top (will be solved next step)
    this.cube.move(this.center_piece_side(edge_colour)+"2");

    this.push_phase('Align flipped white+' + this._face_to_colour(edge_colour) +' edge piece');
}

BeginnersMethodSolver.prototype.solve = function() {
    /// solve cross 

    // orient white center to top
    this.orient_center('U', 'U');
    this.push_phase('Orient white center on top');

    let white_edge_squence = ['F', 'R', 'B', 'L'];
    let rev_white_edge_squence = ['F', 'R', 'B', 'L'].reverse();

    // find greatest number of already solved top edge pieces
    let top_edges = [undefined, undefined, undefined, undefined]

    // get white top pieces
    if (this.cube.state['U'][0][1] == 'U') {
        top_edges[0] = this.facelet_colour(this.cube.get_connected_facelets('U', 0, 1)[0]);
    } if (this.cube.state['U'][1][2] == 'U') {
        top_edges[1] = this.facelet_colour(this.cube.get_connected_facelets('U', 1, 2)[0]);
    } if (this.cube.state['U'][2][1] == 'U') {
        top_edges[2] = this.facelet_colour(this.cube.get_connected_facelets('U', 2, 1)[0]);
    } if (this.cube.state['U'][1][0] == 'U') {
        top_edges[3] = this.facelet_colour(this.cube.get_connected_facelets('U', 1, 0)[0]);
    }

    // find all correct combinations of already existing white top pieces
    let corr_edges = [];
    for (let x = 0; x < top_edges.length; x++) {
        top_edge = top_edges[x];

        // skip edges not on top
        if (top_edge === undefined) {
            continue;
        }

        // skip edges already included in a correct edgelist
        let cont = false;
        for (let ei = 0; ei < corr_edges.length; ei++) {
            if (corr_edges[ei].includes(top_edge)) {
                cont = true;
            }
        } if (cont) {
            continue;
        }

        // check all matching already existing edge pieces to current one
        let correct = [];
        let rev_offset = rev_white_edge_squence.indexOf(top_edge);
        for (let y = 0; y < 4; y++) {
            let on_top = top_edges[(x+y) % 4];
            let expected = rev_white_edge_squence[(rev_offset+y) % 4];

            if (on_top !== undefined && on_top == expected) {
                correct.push(expected);
            }
        }
        // record correct edge list
        corr_edges.push(correct);
    }

    // find longest combination of correct edges from correct edge list
    let longest_corr = [];
    for (let ei = 0; ei < corr_edges.length; ei++) {
        if (corr_edges[ei].length > longest_corr.length) {
            longest_corr = corr_edges[ei];
        }
    }

    // if any top edges exist, orient the longest correct combination of them
    if (longest_corr.length > 0) {
        let check_face = longest_corr[0];
        let white_top = this.edges_on_face('U', 'U');

        for (let x = 0; x < white_top.length; x++) {
            edge_facelet = this.cube.get_connected_facelets('U', white_top[x][0], white_top[x][1])[0];
            if (this.facelet_colour(edge_facelet) == check_face) {
                // align top face
                this.align_edge(white_edge_squence, edge_facelet, "U'");
            }
        }

        // record top face alignment in solution
        let s = '';
        for (let i = 0; i < longest_corr.length; i++) {
            s += this._face_to_colour(longest_corr[i]) + ', '
        }

        this.push_phase('Align solved white edge pieces ('+s.slice(0,-2) +')');

    }

    // solve cross
    while (true) {
        // keep doing below algorithms until cross solved

        // solve white edges on bottom layer 
        while (true) {
            // find edges on bottom
            let edges_on_bottom = this.edges_on_face('D', 'U');
            
            // if no more flipped edge pieces, finish
            if (edges_on_bottom.length == 0) {
                break;
            }

            // solve next bottom edge
            let edge_facelet = this.cube.get_connected_facelets('D', edges_on_bottom[0][0],
                edges_on_bottom[0][1])[0];
            let edge_colour = this.facelet_colour(edge_facelet);

            // align edge
            this.align_edge(white_edge_squence, edge_facelet, 'D');

            // move edge to top
            this.cube.move(this.center_piece_side(edge_colour)+"2");
            this.push_phase('Solve white+' + this._face_to_colour(edge_colour) + ' edge piece')
        }

        // TODO: add incorrect top edge alignment here 

        while (true) {
            // find white edges on top
            let edges_on_top = this.edges_on_face('U', 'U');
            let misaligned = undefined;
            let connected;

            for (let x = 0; x < edges_on_top.length; x++) {
                connected = this.cube.get_connected_facelets('U',
                    edges_on_top[x][0], edges_on_top[x][1])[0];
                if (this.face_center_colour(connected) != this.facelet_colour(connected)) {
                    misaligned = edges_on_top[x];
                    break;
                }
            }

            // exit if no more misaligned top edges
            if (misaligned == undefined) {
                break;
            }

            let c1 = this.face_center_colour(connected);
            let c2 = this.facelet_colour(connected);

            // turn misaligned edge to bottom side, align and turn back up
            this.cube.move(connected[0] + '2');
            this.align_edge(white_edge_squence, c1, c2, 'D');
            this.cube.move(this.center_piece_side(c2) + '2');

            this.push_phase('Solved white+' + this._face_to_colour(c2) + ' edge piece');
        }

        // align flipped edges to top
        while (true) {
            let edge_slice = this.cube.get_facelet_slice('U', 2, true).slice(0,-1);
            let white_flipped = []

            // find fipped edge pieces
            for (let x = 0; x < edge_slice.length; x++) {
                if (this.facelet_colour(edge_slice[x]) == 'U') {
                    white_flipped.push(edge_slice[x]);
                }
            }

            // if no more flipped edge pieces, finish
            if (white_flipped.length == 0) {
                break;
            }

            // align first found piece
            this.align_flipped_bottom_edge(white_edge_squence, white_flipped[0]);
        }

        // align non-matching pieces flipped top pieces 
        while (true) {
            let edge_slice = this.cube.get_facelet_slice('U', 0, true).slice(0,-1);

            // find non-matching flipped pieces and correct them
            let count = 0;
            for (let x = 0; x < edge_slice.length; x++) {

                // find all flipped pieces
                if (this.facelet_colour(edge_slice[x]) == 'U') {
                    let edge_facelet = this.cube.get_connected_facelets(edge_slice[x])[0];
                    let edge_colour = this.facelet_colour(edge_facelet);

                    // check if flipped piece aligned (not aligned if colour not matching side)
                    if (edge_colour != this.face_center_colour(edge_slice[x])) {

                        count++;

                        // if not aligned, move piece to bottom
                        this.cube.move(edge_slice[x][0] + '2');
                        let bottom_edge_slice = this.cube.get_facelet_slice('U', 2, true).slice(0,-1);

                        // align piece
                        for (let x = 0; x < bottom_edge_slice.length; x++) {
                            if (this.facelet_colour(bottom_edge_slice[x]) == 'U') {
                                this.align_flipped_bottom_edge(white_edge_squence, bottom_edge_slice[x]);
                            }
                        }
                    } 
                }
            }
            
            // if no more unaligned pieces, finish
            if (count == 0) {
                break;
            }
        }

        // flip aligned flipped top edge pieces (to solve these pieces)
        while (true) {
            // find matching edge slices
            let edge_slice = this.cube.get_facelet_slice('U', 0, true).slice(0,-1);
            let white_flipped = []

            for (let x = 0; x < edge_slice.length; x++) {
                if (this.facelet_colour(edge_slice[x]) == 'U') {
                    white_flipped.push(edge_slice[x]);
                }
            }
             
            // if no more flipped edge pieces, finish
            if (white_flipped.length == 0) {
                break;
            }

            let [f, c1, c2] = white_flipped[0];
            let e_colour = this.facelet_colour(this.cube.get_connected_facelets(f, c1, c2)[0]);

            // align cube so flip piece is at front
            switch (f) {
                case 'R':
                    this.cube.move("y");
                    break;
                case 'L':
                    this.cube.move("y'");
                    break;
                case 'B':
                    this.cube.move("y2");
                    break;
            }

            this.cube.move("F");
            this.cube.move("U'");
            this.cube.move("R");
            this.cube.move("U");

            this.push_phase('Flip white+' +
                this._face_to_colour(e_colour) +' edge piece')

        }

        // flip down middle slice white edges
        while (true) {
            let edge_slice = this.cube.get_facelet_slice('U', 1).slice(0,-1);
            let white_edges = [];

            for (let x = 0; x < edge_slice.length; x++) {
                let curr = edge_slice[x];
                let [f, c1, c2] = curr;

                // skip center pieces
                if (!(c1 == 1 && c2 == 1)) {
                    if (this.facelet_colour(curr) == 'U') {
                        white_edges.push(curr);
                        // R R
                        // r 1 2
                        // b 1 2
                        // l 1 2 *
                        // f 1 2

                        // R L
                        // l 1 0
                        // b 1 0
                        // f 1 0
                        // r 1 0 *
                    }
                }
            }

            if (white_edges.length == 0) {
                break;
            }

            // orient edge to flip to top
            let edge = white_edges[0];
            let [f, c1, c2] = edge;
            let col = this.facelet_colour(this.cube.get_connected_facelets(edge)[0]);

            let align_move;
            if (c2 == 0) {
                align_move = "F'";
                switch (f) {
                    case 'B':
                        this.cube.move("y")
                        break;
                    case 'L':
                        this.cube.move("y2")
                        break;
                    case 'F':
                        this.cube.move("y'")
                        break;
                }
            } else {
                align_move = "F";
                switch (f) {
                    case 'B':
                        this.cube.move("y'")
                        break;
                    case 'R':
                        this.cube.move("y2")
                        break;
                    case 'F':
                        this.cube.move("y")
                        break;
                }
            }

            // move top until edge can slot in
            this.align_edge(white_edge_squence, this.cube.state.F[1][1], col, "U'");
            let inverse = undefined;
            if (this.cube.moves.length > 0) {
                let last = this.cube.moves[this.cube.moves.length-1];
                inverse = RubiksCube.inverse_moves([last])[0];
            }

            // slot edge in
            this.cube.move(align_move);
            
            // move top until edges realigned
            if (inverse != undefined) {
                this.cube.move(inverse);
            }

            this.push_phase('Solve white+' + this._face_to_colour(col) + ' edge piece')
        }

        // check cross is solved
        let cross_solved = true;
        let white_top = this.edges_on_face('U', 'U');

        // check 4 white edges
        if (white_top.length != 4) {
            cross_solved = false;
        } else {
            let edge_slice = this.cube.get_facelet_slice('U', 0, true).slice(0,-1);
            for (let x = 0; x < edge_slice.length; x++) {
                // check edge colour matches to edge face center colour
                if (this.facelet_colour(edge_slice[x]) != this.facelet_colour([edge_slice[x][0], 1, 1])) {
                    cross_solved = false
                }
            }
        }

        // if cross solved, break
        if (cross_solved) {
            break;
        }

    }


    return this.solution;
}

// TODO:
// - middle pieces
// - looping
