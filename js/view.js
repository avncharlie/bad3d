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

// create rubiks cube and 3d cube representation
let cube = new RubiksCube();
let cube3d = new Cube3d(world, cube.state); // will add itself to world

// move cube representation and animate 3d cube according to move
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
    if (typeof moves === 'string') {
        moves = moves.split(' ');
    }

    if (moves.length == 0) {
        if (callback !== undefined) {
            callback();
        }
        return;
    }

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

// scramble cube
let scramble = RubiksCube.generate_scramble(50);
do_moves(scramble, 0);

// solve
let solver = new BeginnersMethodSolver(cube);
solve = solver.solve();

let phases = [];
let solve_moves = [];
for (let s = 0; s < solve.length; s++) {
    phases.push(solve[s].phase);
    solve_moves = solve_moves.concat(solve[s].moves);
}
console.log(phases);
let old_state = cube.clone_state();

do_solve(solve);

function do_solve(solve) {
    if (solve.length == 0) {
        return;
    }

    // do current phase
    let phase = solve[0].phase;
    let moves = solve[0].moves;

    console.log(phase)

    do_moves(moves, 250, function() {
        do_solve(solve.slice(1));
    })
}
