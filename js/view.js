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
            edges: [
                //[0, 1],
                //[0, 2],
                //[0, 3],
                //[6, 3],
                //[6, 2],
                //[6, 7],
                //[5, 1],
                //[5, 3],
                //[5, 7],
                //[4, 2],
                //[4, 1],
                //[4, 7],
            ],
            faces: [
                [0, 1, 5, 3],
                [0, 3, 6, 2],
                [0, 1, 4, 2], //bottom

                [3, 5, 7, 6], //top
                [2, 4, 7, 6],
                [1, 5, 7, 4]
            ],
            face_materials: [
                new FaceMaterial({fill_colour: 'red', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),
                new FaceMaterial({fill_colour: 'yellow', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),
                new FaceMaterial({fill_colour: 'blue', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),

                new FaceMaterial({fill_colour: 'white', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),
                new FaceMaterial({fill_colour: 'black', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),
                new FaceMaterial({fill_colour: 'orange', stroke_edge: true, edge_style: EdgeMaterial.default_edge_material()}),
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
    position: new Coord(4, 4, 4),
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
world.objects.push(axis);

// add cube to world
let cube = new WorldObject({
    mesh: MESH.cube(1),
    position: new Coord(0, 0, 0),
    rotation: new Rotation(0, 0, 0),
})
world.objects.push(cube);
//
//let cube2 = cube.clone();
//world.objects.push(cube2);


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

// animation stuff:

cube.translate(new Vector(1.5, 1.5, 1.5));

//cube.animate_translation(new Vector(3, 0, 0), 3000, KEYFRAME_FUNCTIONS.ease_in_out_cubic);
//WorldObject.translate_objects([cube, cube2], new Vector(1, 1, 1));
//WorldObject.animate_object_rotations(
//    [cube, cube2],
//    new Rotation(
//        Rotation.to_radians(0),
//        Rotation.to_radians(0),
//        Rotation.to_radians(-360*2),
//    ),
//    new Coord(0, 0, 0),
//    5000,
//    KEYFRAME_FUNCTIONS.ease_in_out_cubic
//);

// loading obj:

Mesh.load_obj_file('../obj/monke.obj', handle_obj);
function handle_obj(obj_mesh) {
    loaded_obj = new WorldObject({
        mesh: obj_mesh,
        position: new Coord(0, 0, 0),
        rotation: new Rotation(0, 0, 0),
    });

    world.objects.push(loaded_obj);

    WorldObject.animate_object_rotations(
        [cube, loaded_obj],
        new Rotation(
            Rotation.to_radians(0),
            Rotation.to_radians(0),
            Rotation.to_radians(360*2),
        ),
        new Coord(0, 0, 0),
        2000,
        KEYFRAME_FUNCTIONS.ease_in_out_cubic
    );
}
