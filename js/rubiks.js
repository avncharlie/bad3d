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
