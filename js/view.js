const MESH = {
    axis: function(s) {
        let tip_offset = s/20;
        let width_offset = s/40;
        return new Mesh({
            vertices: [
                new Vertex(0, 0, 0),
                new Vertex(s-tip_offset, 0, 0),
                new Vertex(0, s-tip_offset, 0),
                new Vertex(0, 0, s-tip_offset),

                new Vertex(-width_offset, s-tip_offset, 0),
                new Vertex(width_offset, s-tip_offset, 0),
                new Vertex(0, s, 0),

                new Vertex(s-tip_offset, -width_offset, 0),
                new Vertex(s-tip_offset, width_offset, 0),
                new Vertex(s, 0, 0),

                new Vertex(-width_offset, 0, s-tip_offset),
                new Vertex(width_offset, 0, s-tip_offset),
                new Vertex(0, 0, s),

                new Vertex(0, -width_offset, s-tip_offset),
                new Vertex(0, width_offset, s-tip_offset),

            ],
            edges: [
                [0, 1],
                [0, 2],
                [0, 3],

                [4, 5],
                [6, 4],
                [6, 5],

                [7, 8],
                [9, 7],
                [9, 8],

                [10, 11],
                [12, 10],
                [12, 11],

                [13, 14],
                [12, 13],
                [12, 14],

            ],
            faces: []
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
            edges: [
                [0, 1],
                [0, 2],
                [0, 3],
                [6, 3],
                [6, 2],
                [6, 7],
                [5, 1],
                [5, 3],
                [5, 7],
                [4, 2],
                [4, 1],
                [4, 7],
            ],
            faces: [
                [0, 1, 5, 3],
                [0, 3, 6, 2],
                [0, 1, 4, 2], //bottom

                [3, 5, 7, 6], //top
                [2, 4, 7, 6],
                [1, 5, 7, 4]
            ]
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
    position: new Coord(4, -4, 4),
    rotation: new Rotation(0, 0, 0),
    distance: 1,
    scale: 500
});
camera.look_at(new Coord(0, 0, 0)); 

// set up camera interactivity
camera.set_draggable({
    element: window,
    drag_degrees: Rotation.to_radians(400)
});
camera.set_scrollable({
    element: window,
    scroll_amount: 20
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
    mesh: MESH.axis(3),
    position: new Coord(0, 0, 0),
    rotation: new Rotation(0, 0, 0),
});
world.objects.push(axis);

// add cube to world
let cube = new WorldObject({
    mesh: MESH.cube(1),
    position: new Coord(0, 0, 0),
    rotation: new Rotation(0, 0, 0),
})
world.objects.push(cube);

let cube2 = cube.clone()
world.objects.push(cube2);
cube2.translate(new Vector(1, 1, 1));

// render
function display() {
    // animaton
    //cube.rotation.Rx += 0.02;
    //cube.rotation.Rz += 0.02;
    //cube.rotation.Ry += 0.02;

    world.render({clear_screen: true});
    requestAnimationFrame(display);
}
display();

//world.render({clear_screen: true});

////////////////

//cube.translate(new Vector(1, 1, 1));

//cube.animate_translation(new Vector(3, 0, 0), 3000, KEYFRAME_FUNCTIONS.ease_in_out_cubic);

WorldObject.translate_objects([cube, cube2], new Vector(1, 1, 1));

WorldObject.animate_object_rotations(
    [cube, cube2],
    new Rotation(
        Rotation.to_radians(0),
        Rotation.to_radians(0),
        Rotation.to_radians(-360*2),
    ),
    new Coord(0, 0, 0),
    5000,
    KEYFRAME_FUNCTIONS.ease_in_out_cubic
);
