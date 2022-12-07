function Cube3d(world, state) {
    this.world = world;

    // intialise cube
    this.cubelets = [] 
    this.F = [];
    this.B = [];
    this.R = [];
    this.L = [];
    this.U = [];
    this.D = [];

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                // create cubelet
                let cubelet = new WorldObject({
                    mesh: Mesh.meshes.cube(1),
                    position: new Coord(x-1, y-1, z-1),
                    rotation: new Rotation(0, 0, 0),
                });
                this.cubelets.push(cubelet);

                // set initial materials (Cube3d.apply_state will set cube to state)
                for (let x = 0; x < cubelet.mesh.face_materials.length; x++) {
                    cubelet.mesh.face_materials[x].fill_colour = 'black';
                    cubelet.mesh.face_materials[x].edge_style.fill_colour = 'black';
                    cubelet.mesh.face_materials[x].edge_style.line_width = 2;
                }

                // initialise cubelets to faces
                if (x == 0) {
                    this.L.push(cubelet);
                } if (x == 2) {
                    this.R.push(cubelet);
                } if (y == 0) {
                    this.B.push(cubelet);
                } if (y == 2) {
                    this.F.push(cubelet);
                } if (z == 0) {
                    this.D.push(cubelet);
                } if (z == 2) {
                    this.U.push(cubelet);
                }

                // add cubelet to world
                this.world.objects.push(cubelet);
            }
        }
    }

    // colour cube as to state
    this.apply_state(state);
}

Cube3d.prototype.reset_cube_positions = function() {
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                this.cubelets[x*9 + y*3 + z].position = new Coord(x-1, y-1, z-1);
                this.cubelets[x*9 + y*3 + z].rotation = new Rotation(0, 0, 0);
            }
        }
    }
}

Cube3d.CUBE_COLOURS = {
    U: '#ffffff', // white
    L: '#128d38', // green
    F: '#a60027', // red
    R: '#03309c', // blue
    D: '#fecd09', // yellow
    B: '#fb4007', // orange
};

Cube3d.prototype.apply_state = function(state) {
    let faces = {
        F: 4,
        B: 0,
        L: 1,
        R: 5,
        U: 3,
        D: 2,
    };

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                let cubelet = this.cubelets[x*9 + y*3 + z];

                if (x == 0) { // L
                    cubelet.mesh.face_materials[faces.L].fill_colour = Cube3d.CUBE_COLOURS[state.L[2-z][y]];
                } if (x == 2) { // R
                    cubelet.mesh.face_materials[faces.R].fill_colour = Cube3d.CUBE_COLOURS[state.R[2-z][2-y]];
                } if (y == 0) { // B
                    cubelet.mesh.face_materials[faces.B].fill_colour = Cube3d.CUBE_COLOURS[state.B[2-z][2-x]];
                } if (y == 2) { // F
                    cubelet.mesh.face_materials[faces.F].fill_colour = Cube3d.CUBE_COLOURS[state.F[2-z][x]];
                } if (z == 0) { // D
                    cubelet.mesh.face_materials[faces.D].fill_colour = Cube3d.CUBE_COLOURS[state.D[2-y][x]];
                } if (z == 2) { // U
                    cubelet.mesh.face_materials[faces.U].fill_colour = Cube3d.CUBE_COLOURS[state.U[y][x]];
                }
            }
        }
    }
 
}

Cube3d.prototype.animate_move = function(move, time, callback) {
    let face_list;
    let rotation;

    let prime_switch = 1;
    if (move.includes("'")) {
        prime_switch = -1;
    }

    let double_switch = 1;
    if (move.includes('2')) {
        double_switch = 2;
    }

    switch (move[0]) {
        case 'F':
            face_list = this.F;
            rotation = new Rotation(0, prime_switch*(-Math.PI/2)*double_switch, 0);
            break;

        case 'B':
            face_list = this.B;
            rotation = new Rotation(0, prime_switch*(Math.PI/2)*double_switch, 0);
            break;

        case 'L':
            face_list = this.L;
            rotation = new Rotation(prime_switch*(Math.PI/2)*double_switch, 0, 0);
            break;

        case 'R':
            face_list = this.R;
            rotation = new Rotation(prime_switch*(-Math.PI/2)*double_switch, 0, 0);
            break;

        case 'U':
            face_list = this.U;
            rotation = new Rotation(0, 0, prime_switch*(-Math.PI/2)*double_switch);
            break;

        case 'D':
            face_list = this.D;
            rotation = new Rotation(0, 0, prime_switch*(Math.PI/2)*double_switch);
            break;
 
    }

    WorldObject.animate_object_rotations(
        face_list,
        rotation,
        new Coord(0, 0, 0),
        time*double_switch,
        KEYFRAME_FUNCTIONS.ease_in_out_sin,
        callback
    )
}

// get canvas and size to window
let canvas = document.getElementById('outCanvas');
let ctx = canvas.getContext('2d');
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

// set up camera in scene
let camera = new Camera({
    position: new Coord(10, 10, 10),
    rotation: new Rotation(0, 0, 0),
    distance: 1,
    scale: 2000
});
camera.look_at(new Coord(0, 0, 0)); 

// set up camera interactivity
camera.set_draggable({ element: window, drag_degrees: Rotation.to_radians(400) });
camera.set_scrollable({ element: window, scroll_amount: 40 });
camera.set_WASD_controls({ angle: Rotation.to_radians(5) });

// create world
let world = new World({
    objects: [],
    camera: camera,
    canvas_ctx: ctx
});


// render loop
function display() {
    // animaton
    world.render({clear_screen: true});
    requestAnimationFrame(display);
}
display();

function debug_cube_state(cube) {
    return RubiksCube.state_from_string(cube.asString());
}

function do_move(move, time, callback) {

    if (time == 0) {
        debug_cube.move(move);
        cube3d.apply_state(debug_cube_state(debug_cube));
        if (callback !== undefined) {
            callback();
        }
    } else {
        debug_cube.move(move);
        cube3d.animate_move(move, time, function() {
            cube3d.reset_cube_positions();
            cube3d.apply_state(debug_cube_state(debug_cube));
            if (callback !== undefined) {
                callback();
            }
        });
    }
}

function do_moves(moves, time, callback) {
    moves = moves.slice();
    let move = moves[0];
    moves = moves.splice(1);

    do_move(move, time, function() {
        if (moves.length > 0) {
            do_moves(moves, time, callback);
        } else if (callback !== undefined) {
            callback();
        }
    });
}

let debug_cube = new Cube();
let cube3d = new Cube3d(world, debug_cube_state(debug_cube));


//let scramble;
//scramble = "R D2 R D U L F L' R U' R' D L2 F L R2 F R2 D2 R' D U L R D2 U2 L D U' R2";
//scramble = "F2 R' F' D' L R U2 F2 L2 U L2 F2 D' R2 U2 L' B F R2 F2 U2 B2 F' L2 R' B' F D' U2 R";

let moves = [
    "U",
    "U'",
    "U2",

    "R",
    "R'",
    "R2",

    "F",
    "F'",
    "F2",

    "D",
    "D'",
    "D2",

    "L",
    "L'",
    "L2",

    "B",
    "B'",
    "B2",
]
let scramble = [];
for (let x = 0; x < 50; x++) {
    let rand = moves[Math.floor(Math.random()*moves.length)];
    if (x == 0) {
        scramble.push(rand);
    } else {
        let last = scramble[scramble.length - 1];
        while (rand[0] == last[0]) {
            rand = moves[Math.floor(Math.random()*moves.length)];
        }
        scramble.push(rand);
    }
}

// scramble
do_moves(scramble, 0);

// invert scramble
do_moves(Cube.inverse(scramble.join(' ')).split(' '), 100, function() {
    console.log('done');
});


