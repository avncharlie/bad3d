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

    this.f = [];
    this.b = [];
    this.r = [];
    this.l = [];
    this.u = [];
    this.d = [];

    this.M = [];
    this.E = [];
    this.S = [];

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
                    this.l.push(cubelet);
                } if (x == 2) {
                    this.R.push(cubelet);
                    this.r.push(cubelet);
                } if (y == 0) {
                    this.B.push(cubelet);
                    this.b.push(cubelet);
                } if (y == 2) {
                    this.F.push(cubelet);
                    this.f.push(cubelet);
                } if (z == 0) {
                    this.D.push(cubelet);
                    this.d.push(cubelet);
                } if (z == 2) {
                    this.U.push(cubelet);
                    this.u.push(cubelet);
                }

                if (x == 1) {
                    this.r.push(cubelet);
                    this.l.push(cubelet);
                    this.M.push(cubelet);
                } if (y == 1) {
                    this.f.push(cubelet);
                    this.b.push(cubelet);
                    this.S.push(cubelet);
                } if (z == 1) {
                    this.u.push(cubelet);
                    this.d.push(cubelet);
                    this.E.push(cubelet);
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

    let prime_switch = 1;
    if (move.includes("'")) {
        prime_switch = -1;
    }

    let double_switch = 1;
    if (move.includes('2')) {
        double_switch = 2;
    }

    let m = move[0];

    let face_list;
    if (m == 'x' || m == 'y' || m == 'z') {
        face_list = this.cubelets;
    } else {
        face_list = this[m]
    }

    let rotation;
    switch (m) {
        case 'z':
        case 'S':
        case 'f':
        case 'F':
            rotation = new Rotation(0, prime_switch*(-Math.PI/2)*double_switch, 0);
            break;

        case 'b':
        case 'B':
            rotation = new Rotation(0, prime_switch*(Math.PI/2)*double_switch, 0);
            break;

        case 'M':
        case 'l':
        case 'L':
            rotation = new Rotation(prime_switch*(Math.PI/2)*double_switch, 0, 0);
            break;

        case 'x':
        case 'r':
        case 'R':
            rotation = new Rotation(prime_switch*(-Math.PI/2)*double_switch, 0, 0);
            break;

        case 'y':
        case 'u':
        case 'U':
            rotation = new Rotation(0, 0, prime_switch*(-Math.PI/2)*double_switch);
            break;

        case 'E':
        case 'd':
        case 'D':
            rotation = new Rotation(0, 0, prime_switch*(Math.PI/2)*double_switch);
            break;
 
    }

    WorldObject.animate_object_rotations(
        face_list,
        rotation,
        new Coord(0, 0, 0),
        time*double_switch,
        KEYFRAME_FUNCTIONS.ease_out_sin,
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
        cube.move(move);
        cube3d.apply_state(cube.state);
        if (callback !== undefined) {
            callback();
        }
    } else {
        cube.move(move);
        cube3d.animate_move(move, time, function() {
            cube3d.reset_cube_positions();
            cube3d.apply_state(cube.state);
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

//let cube = new RubiksCube(Cube.random().asString());
let cube = new RubiksCube();
let cube3d = new Cube3d(world, cube.state);

function test(m) {
    cube.move(m);
    cube3d.animate_move(m, 250, function() {
        cube3d.reset_cube_positions();
        cube3d.apply_state(cube.state);
    });
}

// scramble
let scramble = RubiksCube.generate_scramble(50)//, ['x', 'y', 'z', "x'", "y'", "z'", 'x2', 'y2', 'z2']);
console.log(scramble);
do_moves(scramble, 0);

// invert scramble
do_moves(Cube.inverse(scramble.join(' ')).split(' '), 100, function() {
    console.log('done');
});


function scramble_forever(last) {
    function next_rand_move(last) {
        let moves = RubiksCube._generate_nice_moves();
        let rand = moves[Math.floor(Math.random()*moves.length)];
        if (last === undefined) {
            return rand;
        } else {
            while (rand[0] == last[0]) {
                rand = moves[Math.floor(Math.random()*moves.length)];
            }
            return rand;
        }
    }
    let move = next_rand_move(last);

    do_move(move, 120, function() {
        scramble_forever(move);
    });

}
//scramble_forever();
