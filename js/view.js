const MESH = {
    axis: function(s) {
        let tip_offset = s/20;
        let width_offset = s/40;
        return new Mesh({
            vertices: [
                new Vertex(0, 0, 0),
                new Vertex(s, 0, 0),
                new Vertex(0, s, 0),
                new Vertex(0, 0, s),
            ],
            edges: [
                [0, 1],
                [0, 2],
                [0, 3],
            ],
            faces: [],
            edge_materials: [
                new EdgeMaterial({ fill_colour: 'red', line_width: 2, }),
                new EdgeMaterial({ fill_colour: 'blue', line_width: 2, }),
                new EdgeMaterial({ fill_colour: 'green', line_width: 2, }),
            ]
        })
    },
    cube: function(s) {
        return (new Mesh({
            vertices: [
                new Vertex(0, 0, 0), // 0, 0 0 0 
                new Vertex(s, 0, 0), // 1, x 0 0 
                new Vertex(0, s, 0), // 2, 0 y 0
                new Vertex(0, 0, s), // 3, 0 0 z
                new Vertex(s, s, 0), // 4, x y 0
                new Vertex(s, 0, s), // 5, x 0 z
                new Vertex(0, s, s), // 6, 0 y z
                new Vertex(s, s, s), // 7, x y z
            ],
            edges: [],
            faces: [
                [0, 1, 5, 3],
                [0, 3, 6, 2],
                [0, 1, 4, 2], //bottom

                [3, 5, 7, 6], //top
                [2, 4, 7, 6],
                [1, 5, 7, 4]
            ],
       })).translate(new Vector(-s/2, -s/2, -s/2));
    },
    triangle: function(s) {
        return new Mesh({
            vertices: [
                new Vertex(0, 0, 0),
                new Vertex(s, 0, 0),
                new Vertex(0, 0, s),
            ],
            edges: [
                [0, 1],
                [1, 2],
                [2, 0],
            ],
            faces: []
        });
    },
    line: function(v1, v2) {
        return new Mesh({
            vertices: [
                v1,
                v2,
            ],
            edges: [
                [0, 1],
            ],
            faces: []
        })
    }
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
camera.set_draggable({
    element: window,
    drag_degrees: Rotation.to_radians(400)
});
camera.set_scrollable({
    element: window,
    scroll_amount: 40
});
camera.set_WASD_controls({
    angle: Rotation.to_radians(5)
});

// create world
let world = new World({
    objects: [],
    camera: camera,
    canvas_ctx: ctx
});

// add axis to world
let axis = new WorldObject({
    mesh: MESH.axis(5),
    position: new Coord(0, 0, 0),
    rotation: new Rotation(0, 0, 0),
});
//world.objects.push(axis);

// render
function display() {
    // animaton
    world.render({clear_screen: true});
    requestAnimationFrame(display);
}
display();

// generate rubiks cube

let CUBE_COLOURS = {
    WHITE: '#ffffff',
    GREEN: '#128d38',
    RED: '#a60027',
    BLUE: '#03309c',
    YELLOW: '#fecd09',
    ORANGE: '#fb4007',
};

//CUBE_COLOURS = { WHITE: 'white', GREEN: 'green', RED: 'red', BLUE: 'blue', YELLOW: 'yellow', ORANGE: 'orange', };

let cubelets = []

let F = [];
let B = [];
let R = [];
let L = [];
let U = [];
let D = [];

function create_mats(x, y, z) {
    let face_mats = [];
    for (let x = 0; x < 6; x++) {
        let base_mat = new FaceMaterial({
            fill_colour: 'black',
            stroke_edge: true,
            edge_style: new EdgeMaterial({
                fill_colour: 'black',
                line_width: 2
            }),
        });
        face_mats.push(base_mat);
    }

    let faces = {
        F: 4,
        B: 0,
        L: 1,
        R: 5,
        U: 3,
        D: 2,
    };

    if (x == 0) {
        face_mats[faces.L].fill_colour = CUBE_COLOURS.GREEN;
    } if (x == 2) {
        face_mats[faces.R].fill_colour = CUBE_COLOURS.BLUE;
    } if (y == 0) {
        face_mats[faces.B].fill_colour = CUBE_COLOURS.ORANGE;
    } if (y == 2) {
        face_mats[faces.F].fill_colour = CUBE_COLOURS.RED;
    } if (z == 0) {
        face_mats[faces.D].fill_colour = CUBE_COLOURS.YELLOW;
    } if (z == 2) {
        face_mats[faces.U].fill_colour = CUBE_COLOURS.WHITE;
    }

    return face_mats;
}

for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
            // get materials
            let mesh = MESH.cube(1);
            mesh.face_materials = create_mats(x, y, z);

            // create cubelet
            let cubelet = new WorldObject({
                mesh: mesh,
                position: new Coord(x-1, y-1, z-1),
                rotation: new Rotation(0, 0, 0),
            });
            cubelets.push(cubelet);

            // initialise cubelets to faces
            if (x == 0) {
                L.push(cubelet);
            } if (x == 2) {
                R.push(cubelet);
            } if (y == 0) {
                B.push(cubelet);
            } if (y == 2) {
                F.push(cubelet);
            } if (z == 0) {
                D.push(cubelet);
            } if (z == 2) {
                U.push(cubelet);
            }

            // add cubelet to world

            world.objects.push(cubelet);
        }
    }
}

MOVE = {
    F: "F",
    F_prime: "F'",
    B: "B",
    B_prime: "B'",

    L: "L",
    L_prime: "L'",
    R: "R",
    R_prime: "R'",
    
    U: "U",
    U_prime: "U'",
    D: "D",
    D_prime: "D'",
}

function animate_rotate_face(face) {
    let face_list;
    let rotation;

    let prime_switch = 1;
    if (face.length == 2) {
        prime_switch = -1;
    }

    switch (face[0]) {
        case 'F':
            face_list = F;
            rotation = new Rotation(0, prime_switch*-Math.PI/2, 0);
            break;

        case 'B':
            face_list = B;
            rotation = new Rotation(0, prime_switch*Math.PI/2, 0);
            break;

        case 'L':
            face_list = L;
            rotation = new Rotation(prime_switch*Math.PI/2, 0, 0);
            break;

        case 'R':
            face_list = R;
            rotation = new Rotation(prime_switch*-Math.PI/2, 0, 0);
            break;

        case 'U':
            face_list = U;
            rotation = new Rotation(0, 0, prime_switch*-Math.PI/2);
            break;

        case 'D':
            face_list = D;
            rotation = new Rotation(0, 0, prime_switch*Math.PI/2);
            break;
 
    }

    WorldObject.animate_object_rotations(
        face_list, rotation, new Coord(0, 0, 0),
        1000, KEYFRAME_FUNCTIONS.ease_in_out_sin
    )
}

animate_rotate_face(MOVE.D_prime);

//WorldObject.animate_object_rotations(
//    F,
//    new Rotation(
//        Rotation.to_radians(0),
//        Rotation.to_radians(90),
//        Rotation.to_radians(0),
//    ),
//    new Coord(0, 0, 0),
//    1000,
//    KEYFRAME_FUNCTIONS.ease_in_out_sin
//);
