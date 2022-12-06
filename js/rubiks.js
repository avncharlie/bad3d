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

RubiksCube.prototype.rotate_facelet_slice = function(axis, index, rotate_right) {
    let affected_faces;
    switch (axis) {

        case 'F':
            affected_faces = [
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
            break;

        case 'R':
            affected_faces = [
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
            break;

        case 'U':
            affected_faces = [
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
          break;
    }

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
