/*
 * 3d framework start
 */

// Classes:
//   Coord 
//     Vertex
//     Vector
//   Rotation
//   EdgeMaterial
//   FaceMaterial
//   Mesh
//   Camera
//   WorldObject
// Constants:
//   KEYFRAME_FUNCTIONS

/*
 * Set of functions used for keyframing. All functions take progress as value
 * between 0 to 1 as input and output value between 0 and 1. functions should
 * pass through (0,0) and (1,1).
 * See https://easings.net/ for visualisations of below easings
 */
const KEYFRAME_FUNCTIONS = {
    linear: function(p) {
        return p;
    },
    ease_out_sin: function(p) {
        return Math.sin((Math.PI * p)/2);
    },
    ease_in_sin: function(p) {
        return Math.sin( (Math.PI*(p-1))/2 ) + 1;
    },
    ease_in_out_sin: function(p) {
        return (Math.sin( (Math.PI*(2*p - 1))/2  ) + 1) / 2;
    },
    ease_in_quadratic: function(p) {
        return p**2;
    },
    ease_out_quadratic: function(p) {
        return -1*(p-1)**2 + 1;
    },
    ease_in_cubic: function(p) {
        return p**3;
    },
    ease_out_cubic: function(p) {
        return (p-1)**3+1;
    },
    ease_in_out_cubic: function(p) {
        if (p < 0.5) {
            return 4*p**3;
        } 
        return ((2*p-2)**3+2)/2;
    }

}

function Coord(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Coord.prototype.scale = function(scale) {
    this.x *= scale;
    this.y *= scale;
    this.z *= scale;
}

Coord.prototype.add = function(thing) {
    this.add_vector(thing);
}

Coord.prototype.add_vector = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
}

Coord.prototype.add_vector_and_return = function(vector) {
    return new Vector(
        this.x + vector.x,
        this.y + vector.y,
        this.z + vector.z,
    )
}

Coord.prototype.subtract = function(coord) {
    return new Vector(
        this.x - coord.x,
        this.y - coord.y,
        this.z - coord.z
    );
}

Coord.prototype.zero_distance = function() {
    let dist = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    return dist;
}

Coord.prototype.clone = function() {
    return new Coord(
        this.x,
        this.y,
        this.z
    )
}

// Vertex extends Coord
Object.setPrototypeOf(
    Vertex.prototype,
    Coord.prototype,
);

function Vertex(x, y, z) { 
    Coord.call(this, x, y, z);
}

// Vector extends Coord
Object.setPrototypeOf(
    Vector.prototype,
    Coord.prototype,
);

function Vector(x, y, z) { 
    Coord.call(this, x, y, z);
}

Vector.prototype.multiply = function(m) {
    return new Vector(
        this.x * m,
        this.y * m,
        this.z * m,
    )
}

function Rotation(Rx, Ry, Rz) {
    /*
     * Stores rotation. 
     * Parameters:
     *   Rx: clockwise rotation on x axis (radians)
     *   Ry: clockwise rotation on y axis (radians)
     *   Rz: clockwise rotation on z axis (radians)
     */
    this.Rx = Rx;
    this.Ry = Ry;
    this.Rz = Rz;
}

Rotation.prototype.multiply = function(m) {
    return new Rotation(
        this.Rx * m,
        this.Ry * m,
        this.Rz * m,
    )
}

Rotation.prototype.clone = function() {
    return new Rotation(
        this.Rx,
        this.Ry,
        this.Rz
    )
}

Rotation.to_degrees = function(angle) {
    return angle * (180 / Math.PI);
}

Rotation.to_radians = function(angle) {
    return angle * (Math.PI / 180);
}

Rotation.prototype.apply_rotation = function(C) {
    /*
     * Apply rotation to Coord, Vertex or Vector
     */
    let Cx = Math.cos(this.Rx);
    let Sx = Math.sin(this.Rx);

    let Cy = Math.cos(this.Ry);
    let Sy = Math.sin(this.Ry);

    let Cz = Math.cos(this.Rz);
    let Sz = Math.sin(this.Rz);

    let x = C.x;
    let y = C.y;
    let z = C.z;

    let x_rot = Cy*(Sz*y + Cz*x) - Sy*z;
    let y_rot = Sx*(Cy*z + Sy*(Sz*y + Cz*x)) + Cx*(Cz*y - Sz*x)
    let z_rot = Cx*(Cy*z + Sy*(Sz*y + Cz*x)) - Sx*(Cz*y - Sz*x)

    if (C instanceof Vertex) {
        return new Vertex(x_rot, y_rot, z_rot);
    }

    if (C instanceof Vector) {
        return new Vector(x_rot, y_rot, z_rot);
    }

    return new Coord(x_rot, y_rot, z_rot);
}

Rotation.prototype.apply_rotation_to_mesh = function(mesh) {
    let rotated_mesh = new Mesh({
        vertices: [],
        edges: mesh.edges,
        faces: mesh.faces,
        edge_materials: mesh.edge_materials,
        face_materials: mesh.face_materials,
    });

    for (let x = 0; x < mesh.vertices.length; x++) {
        let curr_vert = mesh.vertices[x];
        let rot_vert = this.apply_rotation(curr_vert);
        rotated_mesh.vertices.push(rot_vert);
    }

    return rotated_mesh;
}

Rotation.prototype.calculate_rotation_looking_at = function(position, looking_at) {
    let D = position.subtract(looking_at);

    let Rz = -Math.atan(D.x/D.y);
    if (D.y < 0) {
        // if look at position is behind observer, add pi
        Rz = Math.PI + Rz;
    }
    this.Rz = Rz;

    let adj = D.y
    adj = Math.sqrt(D.y**2+D.x**2);

    let Rx = Math.atan(D.z/adj);
    if (D.y < 0) {
        //Rx = 2*Math.PI - Rx;
    } else {
        //Rx *= -1;
    }
    this.Rx = Rx

    if (isNaN(this.Rx)) {
        this.Rx = 0;
    }

    if (isNaN(this.Rz)) {
        this.Rz = 0;
    }

    if (isNaN(this.Ry)) {
        this.Ry = 0;
    }
};

function EdgeMaterial(args) {
    /*
     * Defines materal for edges 
     * Parameters:
     *   fill_colour: colour to draw line with
     *   line_width: pixel width of line
     */
    this.fill_colour = args.fill_colour;
    this.line_width = args.line_width;
}

EdgeMaterial.prototype.clone = function() {
    return new EdgeMaterial({
        fill_colour: this.fill_colour,
        line_width: this.line_width,
    });
}

EdgeMaterial.default_edge_material = function() {
    return new EdgeMaterial({
        fill_colour: 'gray',
        line_width: 1
    });
}

function FaceMaterial(args) {
    /*
     * Defines materal for faces 
     * Parameters:
     *   fill_colour: colour to draw face with
     *   stroke_edge: boolean, whether or not to draw face edge lines
     *   edge_style: EdgeMaterial to draw face lines with (if stroke_edge is true)
     */
    this.fill_colour = args.fill_colour;
    this.stroke_edge = args.stroke_edge;
    this.edge_style = args.edge_style;
}

FaceMaterial.prototype.clone = function() {
    return new FaceMaterial({
        fill_colour: this.fill_colour,
        stroke_edge: this.stroke_edge,
        edge_style: this.edge_style.clone(),
    })
}

FaceMaterial.default_face_material = function() {
    return new FaceMaterial({
        fill_colour: 'lightgray',
        stroke_edge: true,
        edge_style: EdgeMaterial.default_edge_material()
    });
}

function Mesh(args) {
    /*
     * Stores collection of vertices, edges and faces defining a mesh
     * Parameters:
     *   vertices: list of Vertex objects
     *   edges: list of (list of two vertices defining edge)
     *   faces: list of (list of vertices defining a face)
     *   edge_materials: list of EdgeMaterial defining materials for given edges. optional.
     *   face_materials: list of FaceMaterial defining materials for given faces. optional.
     */
    this.vertices = args.vertices;
    this.edges = args.edges;
    this.faces = args.faces;

    this.edge_materials = args.edge_materials;
    if (args.edge_materials == undefined) {
        let edge_mats = []
        for (let x = 0; x < this.edges.length; x++) {
            edge_mats.push(EdgeMaterial.default_edge_material());
        }
        this.edge_materials = edge_mats;
    }
    this.face_materials = args.face_materials;
    if (args.face_materials == undefined) {
        let face_mats = []
        for (let x = 0; x < this.faces.length; x++) {
            face_mats.push(FaceMaterial.default_face_material());
        }
        this.face_materials = face_mats;
    }
    //console.log(this, args);
}

// functions to generate common meshes
Mesh.meshes = {
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
    right_angled_triangle: function(s) {
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
}

Mesh.load_obj = function(obj, callback) {
    let obj_mesh_args = {
        vertices: [],
        edges: [],
        faces: []
    };
 
    obj = obj.split('\n');
    for (let x = 0; x < obj.length; x++) {
        let line = obj[x];
        switch (line.slice(0,2)) {
            case 'v ':
                // add vertex
                let v = line.split(' ').slice(1);
                obj_mesh_args.vertices.push(new Vertex(
                    Number(v[0]),
                    Number(v[2]),
                    Number(v[1]),
                ))
                break;
            case 'l ':
                break;
            case 'f ':
                // add face

                let f = line.split(' ').slice(1);

                // remove texture and normal information
                for (let v = 0; v < f.length; v++) {
                    // obj files are 1 indexed, make 0 indexed
                    f[v] = Number(f[v].split("/")[0] - 1);
                }

                obj_mesh_args.faces.push(f);
                break;
        }
    }

    callback(new Mesh(obj_mesh_args));
}

Mesh.load_obj_file = function(file_path, callback) {
    /*
     * Load mesh from obj file. After loading, execute callback(loaded_mesh)
     * Parameters:
     *   callback: callback function
     */

    fetch(file_path)
        .then(function(response) {
            return response.text();
        }).then(function(data) {
            Mesh.load_obj(data, callback);
        });
}

Mesh.prototype.translate = function(vector) {
    /*
     * Translate mesh in place
     */
    for (let x = 0; x < this.vertices.length; x++) {
        this.vertices[x].add_vector(vector);
    }
    return this;
}

Mesh.prototype.get_translation = function(vector) {
    /*
     * Translate mesh and return
     */

    let r_mesh = this.clone();
    r_mesh.translate(vector);
    return r_mesh;
}

Mesh.prototype.clone = function() {
    let new_verts = [];
    for (let x = 0; x < this.vertices.length; x++) {
        new_verts.push(this.vertices[x].clone());
    }

    let new_edges = [];
    for (let x = 0; x < this.edges.length; x++) {
        new_edges.push(this.edges[x].slice());
    }

    let new_faces = [];
    for (let x = 0; x < this.faces.length; x++) {
        new_faces.push(this.faces[x].slice());
    }

    let new_edge_materials = [];
    for (let x = 0; x < this.edge_materials.length; x++) {
        new_edge_materials.push(this.edge_materials[x].clone());
    }

    let new_face_materials = [];
    for (let x = 0; x < this.face_materials.length; x++) {
        new_face_materials.push(this.face_materials[x].clone());
    }

    return new Mesh({
        vertices: new_verts,
        edges: new_edges,
        faces: new_faces,
        edge_materials: new_edge_materials,
        face_materials: new_face_materials,
    });
}

function Camera(args) {
    /*
     * Camera information used for rendering.
     * Parameters:
     *   position: Coord object defining camera's position in the world
     *   distance: How far the projection is away from the camera position,
     *      generally set to 1
     *   rotation: Rotation object defining rotation of camera, not needed if
     *      look_at function used set rotation
     *   scale: Scale of output image
     */
    this.position = args.position;
    this.distance = args.distance;
    this.rotation = args.rotation;
    this.scale = args.scale;

}

Camera.prototype.look_at = function(looking_at) {
    this.rotation.calculate_rotation_looking_at(this.position, looking_at);
}

Camera.prototype.rotate_camera = function(x_degrees, y_degrees, start_pos) {
    /*
     * Rotate camera around origin, given horizontal and vertical angles of
     * movement. Essentially implements a 3d arcball.
     * Parameters:
     *   x_degrees: hoizontal #degrees to move camera around origin
     *   y_degrees: vertical #degrees to move camera around origin
     *   start_pos [optional]: start camera position to apply rotation from
     */

    let spos = start_pos;
    if (start_pos === undefined) {
        spos = this.position; 
    }

    let total = (this.position.y**2 + this.position.x**2) ** (1/2);
    let x_ratio = this.position.y/total;
    let y_ratio = this.position.x/total;

    let rot = new Rotation(x_ratio*x_degrees, -y_ratio*x_degrees, y_degrees);

    camera.position = rot.apply_rotation(spos)
    camera.look_at(new Coord(0, 0, 0)); 
}

Camera.prototype.set_draggable = function(args) {
    /*
     * Allows camera to be dragged around origin
     * Parameter:
     *   element: element to register drag and touch event handlers on
     *   drag_degrees: degrees to rotate camera around on drag 
     */

    let cam = this;

    let elem = args.element;
    let full_degrees = args.drag_degrees;

    let mouse_start_x;
    let mouse_start_y;
    let cam_start_pos;

    function handle_camera_drag(diff_x, diff_y) {
        let perc_y = -(diff_y/window.innerHeight);
        let perc_x = -(diff_x/window.innerWidth);

        let x_degrees = full_degrees * perc_y;
        let y_degrees = full_degrees * perc_x;

        cam.rotate_camera(x_degrees, y_degrees, cam_start_pos);
    }

    // set up draggable camera through touches (mobile devices)
    elem.addEventListener('touchstart', function (event) {
        let touch = event.changedTouches[0];
        mouse_start_x = touch.pageX
        mouse_start_y = touch.pageY
        cam_start_pos = cam.position.clone();
        elem.addEventListener('touchmove', onTouchMove);
    });

    function onTouchMove(event) {
        let touch = event.changedTouches[0];
        const diff_x = touch.pageX - mouse_start_x;
        const diff_y = touch.pageY - mouse_start_y;
        handle_camera_drag(diff_x, diff_y);
    }

    // set up draggable camera mouse drags (computers)
    elem.addEventListener('mousedown', function (event) {
        mouse_start_x = event.pageX;
        mouse_start_y = event.pageY;
        cam_start_pos = cam.position.clone();
        elem.addEventListener('mousemove', onMouseMove);
    });

    function onMouseMove(event) {
        const diff_x = event.pageX - mouse_start_x;
        const diff_y = event.pageY - mouse_start_y;
        handle_camera_drag(diff_x, diff_y);
    }

    elem.addEventListener('mouseup', function (event) {
        onMouseMove(event);
        elem.removeEventListener('mousemove', onMouseMove);
    });

}

Camera.prototype.set_scrollable = function(args) {
    /*
     * Enables scrolling to zoom scene
     * Allows camera to be dragged around origin
     * Parameter:
     *   element: element to register scroll event handler on
     *   scroll_amount: amount to increase/decrease camera scale per scroll 
     */

    let elem = args.element;
    let scroll_amount = args.scroll_amount;

    elem.addEventListener("wheel", function(e) {
        var dir = Math.sign(e.deltaY);
        if (dir == 1) {
            camera.scale += scroll_amount;
        } else {
            camera.scale -= scroll_amount;
        }
    });
}

Camera.prototype.set_WASD_controls = function(args) {
    /*
     * Enable camera movement through WASD keys
     * Parameters:
     *   angle: angle camera moves per key press
     */

    let angle = args.angle;
    let cam = this;

    window.addEventListener('keypress', function(event) {
        let orig_pos = cam.position.clone();
        if (event.code == 'KeyD') {
            cam.rotate_camera(0, -angle);
        } else if (event.code == 'KeyA') {
            cam.rotate_camera(0, angle);
        } else if (event.code == 'KeyW') {
            cam.rotate_camera(angle, 0);
        } else if (event.code == 'KeyS') {
            cam.rotate_camera(-angle, 0);
        }
    });
}

function WorldObject(args) {
    /*
     * Defines object in world
     * Parameters:
     *   mesh: Mesh object defining mesh of object
     *   position: Coord object defining object position in world
     *   rotation: Rotation object defining object rotation
     */
    this.mesh = args.mesh;
    this.position = args.position;
    this.rotation = args.rotation;
}

WorldObject.prototype.clone = function() {
    return new WorldObject({
        mesh: this.mesh.clone(),
        position: this.position.clone(),
        rotation: this.rotation.clone()
    });
}

WorldObject.prototype.rotate = function(rotation, origin) {
    /*
     * Rotate object around point
     * Parameters:
     *   rotation: Rotation object defining rotation
     *   origin: Coord object that will be origin of rotation
     */
    let move_to_origin = (new Coord(0,0,0)).subtract(origin);
    let move_back = move_to_origin.multiply(-1)

    this.rotation = rotation;
    this.position = rotation.apply_rotation(this.position.add_vector_and_return(move_to_origin))
        .add_vector_and_return(move_back);
}

WorldObject.prototype.animate_rotation = function(rotation, origin, time, kframe_func, callback) {
    /*
     * Animate object rotation
     * Parameters:
     *   rotation: Rotation object defining end rotation of animation
     *   origin: Coord object that will be origin of rotation
     *   time: total animation time
     *   kframe_func: name of function in `keyframe_functions` to animate with
     *   callback: optional. callback function to call after animation finished
     */

    let start_pos = this.position.clone();

    let move_to_origin = (new Coord(0,0,0)).subtract(origin);
    let move_back = move_to_origin.multiply(-1)

    let interval = 10;
    let max_count = time/10;

    let count = 0

    let obj = this;
    let tween = setInterval(function() {
        count++
        if (count == max_count) {
            clearInterval(tween);
        }

        // percentage of animation completed
        let perc = count/max_count;

        // pass to keyframe function to modify as appropriate
        perc = kframe_func(perc);

        // rotate as required
        let curr_rot = rotation.multiply(perc);

        obj.rotation = curr_rot;
        obj.position = curr_rot.apply_rotation(start_pos.add_vector_and_return(move_to_origin)).add_vector_and_return(move_back);


        // call callback at end of animation
        if (count == max_count) {
            if (callback !== undefined) {
                callback();
            }
        }

    }, interval)

}

WorldObject.prototype.translate = function(vector) {
    /*
     * Translate object
     * Parameters:
     *   vector: Vector object defining translation
     */
    this.position.add_vector(vector);
}

WorldObject.prototype.animate_translation = function(vector, time, kframe_func, callback) {
    /*
     * Animate object translation
     * Parameters:
     *   vector: Vector object defining translation
     *   time: total animation time
     *   kframe_func: name of function in `keyframe_functions` to animate with
     *   callback: optional. callback function to call after animation finished
     */
    let start_pos = this.position.clone();

    let interval = 10;
    let max_count = time/10;

    let count = 0

    let obj = this;
    let tween = setInterval(function() {
        count++
        if (count == max_count) {
            clearInterval(tween);
        }

        // percentage of animation completed
        let perc = count/max_count;

        // pass to keyframe function to modify as appropriate
        perc = kframe_func(perc);

        // translate as required
        obj.position = start_pos.add_vector_and_return(vector.multiply(perc));

        // call callback at end of animation
        if (count == max_count) {
            if (callback !== undefined) {
                callback();
            }
        }

    }, interval)
}

/*
 * Helper functions to apply and animate transformations on multiple objects
 */

WorldObject.rotate_objects = function(objects, rotation, origin) {
    /*
     * Rotate multiple objects around point 
     */
    for (let x = 0; x<objects.length; x++) {
        objects[x].rotate(rotation, origin);
    }
}

WorldObject.animate_object_rotations = function(objects, rotation, origin, time, kframe_func, callback) {
    /*
     * Animate multiple object rotations
     * Callback will only be called once.
     */
    for (let x = 0; x<objects.length; x++) {
        let c = undefined;
        if (x == objects.length - 1) {
            c = callback;
        }
        objects[x].animate_rotation(rotation, origin, time, kframe_func, c);
    }
}

WorldObject.translate_objects = function(objects, vector) {
    /*
     * Translate multiple objects
     */
    for (let x = 0; x<objects.length; x++) {
        objects[x].translate(vector);
    }
}

WorldObject.animate_object_translations = function(objects, vector, time, kframe_func, callback) {
    /*
     * Animate multiple object rotations
     * Callback will only be called once.
     */
    for (let x = 0; x<objects.length; x++) {
        let c = undefined;
        if (x == objects.length - 1) {
            c = callback;
        }
        objects[x].animate_translation(vector, time, kframe_func, c);
    }
}

function World(args) {
    /*
     * Defines world
     * Parameters:
     *   objects: list of WorldObject representing objects in world
     *   camera: Camera object used for rendering
     *   canvas_ctx: Canvas context used for rendering
     */

    this.objects = args.objects;
    this.camera = args.camera;
    this.ctx = args.canvas_ctx;
}


World.place_object_in_mesh = function(mesh, object) {
    /*
     * Return mesh with object placed in it (according to its attributes)
     * Parameters:
     *   object: WorldObject
     *   mesh: Mesh
     */

    // clone object mesh to avoid entanglements
    let mesh_to_add = object.mesh.clone();

    // rotate object to required rotation
    mesh_to_add = object.rotation.apply_rotation_to_mesh(mesh_to_add);

    // translate object to world position
    let world_position_translation = object.position.subtract(new Coord(0, 0, 0));
    mesh_to_add.translate(world_position_translation);

    let offset = mesh.vertices.length;
    // add vertices
    for (let x = 0; x < mesh_to_add.vertices.length; x++) {
        mesh.vertices.push(mesh_to_add.vertices[x]);
    }

    // add materials
    for (let x = 0; x < mesh_to_add.edge_materials.length; x++) {
        mesh.edge_materials.push(mesh_to_add.edge_materials[x]);
    }
    for (let x = 0; x < mesh_to_add.face_materials.length; x++) {
        mesh.face_materials.push(mesh_to_add.face_materials[x]);
    }

    // add edges
    for (let x = 0; x < mesh_to_add.edges.length; x++) {
        // add vertice offset to edges
        let edge = mesh_to_add.edges[x];
        for (let y = 0; y < edge.length; y++) {
            edge[y] += offset;
        }
        mesh.edges.push(edge);
    }

    // add faces
    for (let x = 0; x < mesh_to_add.faces.length; x++) {
        // add vertice offset to faces
        let face = mesh_to_add.faces[x];
        for (let y = 0; y < face.length; y++) {
            face[y] += offset;
        }
        mesh.faces.push(face);
    }

    return mesh;
}

World.prototype.orient_to_camera_view = function(mesh) {
    /*
     * Orient given mesh to camera view
     */

    // translate mesh to camera position
    let cam_translation = (new Coord(0,0,0)).subtract(this.camera.position);
    mesh.translate(cam_translation);

    // apply camera rotation to mesh
    mesh = this.camera.rotation.apply_rotation_to_mesh(mesh);

    return mesh;
}

World.prototype.project = function(mesh) {
    /*
     * Project given camera-oriented mesh
     */
    let projected_points = [];

    let origin_x = this.ctx.canvas.width/2;
    let origin_y = this.ctx.canvas.height/2;

    for (let i = 0; i < mesh.vertices.length; i++) {
        let vertex = mesh.vertices[i];

        // get vertex distance from camera
        let D = vertex.subtract(new Coord(0, 0, 0));

        // project
        let projected_y = this.camera.distance * (D.z/D.y);
        let projected_x = this.camera.distance * (D.x/D.y);

        // scale and transform to canvas resolution

        let final_x;
        let final_y;

        final_y = origin_y + projected_y * this.camera.scale;
        final_x = origin_x - projected_x * this.camera.scale;

        projected_points.push([final_x, final_y]);
    }

    return projected_points;
}

World.prototype.draw = function(projected_points, mesh) {
    /*
     * Draw projection on screen using painter's algorithm
     */

    // draw points (will get painted over by everything)
    //for (let p = 0; p < projected_points.length; p++) {
    //    let final_x = projected_points[p][0];
    //    let final_y = projected_points[p][1];
    //    this.ctx.fillStyle = 'black';
    //    this.ctx.fillRect(final_x-1, final_y-1, 2, 2);
    //}

    // first sort edges and faces by depth
    // store [index, value] so original index retrievable after sort
    let sorted = []
    for (let x = 0; x < mesh.edges.length; x++) {
        sorted.push([x, mesh.edges[x]]);
    }
    for (let x = 0; x < mesh.faces.length; x++) {
        sorted.push([x, mesh.faces[x]]);
    }

    sorted.sort(function(thing1, thing2) {
        // sort values
        thing1 = thing1[1];
        thing2 = thing2[1];

        let thing1_depth = new Coord(0, 0, 0)
        for (let v = 0; v < thing1.length; v++) {
            thing1_depth.add(mesh.vertices[thing1[v]]);
        }
        thing1_depth.scale(1 / thing1.length);

        let thing2_depth = new Coord(0, 0, 0)
        for (let v = 0; v < thing2.length; v++) {
            thing2_depth.add(mesh.vertices[thing2[v]]);
        }
        thing2_depth.scale(1 / thing2.length);

        return thing2_depth.zero_distance() - thing1_depth.zero_distance();
    })

    // next draw edges and faces in depth order from furthest to nearest
    for (let x = 0; x < sorted.length; x++) {
        let index = sorted[x][0];
        let thing = sorted[x][1];

        if (thing.length > 2) {
            // more than two elements; must be a face
            let face = thing;

            // get face path
            this.ctx.beginPath();
            for (let p = 0; p < face.length; p++) {
                let proj_point = projected_points[face[p]];
                let world_point = mesh.vertices[face[p]];
                if (p == 0) {
                    this.ctx.moveTo(proj_point[0], proj_point[1]);
                } else {
                    this.ctx.lineTo(proj_point[0], proj_point[1]);
                }
            }
            this.ctx.closePath();

            // apply FaceMaterial
            let fillStyle;
            //let colour = (255/sorted.length)*x;
            //fillStyle = 'rgb(' + colour + ', ' + colour + ', ' + colour + ')';
            fillStyle = mesh.face_materials[index].fill_colour;
            //console.log(mesh.clone());
            this.ctx.fillStyle = fillStyle;
            this.ctx.fill();

            // if stroke_edge, apply edge_style
            if (mesh.face_materials[index].stroke_edge) {
                this.ctx.strokeStyle = mesh.face_materials[index].edge_style.fill_colour;
                this.ctx.lineWidth = mesh.face_materials[index].edge_style.line_width;;
                this.ctx.stroke();
            }
        } else {
            // only lines have 2 elements
            let edge = thing;
            let p1 = projected_points[edge[0]];
            let p2 = projected_points[edge[1]];

            this.ctx.beginPath();
            this.ctx.moveTo(p1[0], p1[1]);
            this.ctx.lineTo(p2[0], p2[1]);

            this.ctx.strokeStyle = mesh.edge_materials[index].fill_colour;
            this.ctx.line_width = mesh.edge_materials[index].line_width;

            this.ctx.stroke();
        }
    }
}

World.prototype.render = function(args) {
    /*
     * Render world to canvas
     * Parameters:
     *   clear_screen: true if canvas should be cleared before rendering
     */

    if (args.clear_screen == true) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let world_mesh = new Mesh({
        vertices: [],
        edges: [],
        faces: [],
        edge_materials: [],
        face_materials: [],
    });

    //console.log(this.objects);

    // place objects in world
    for (let x = 0; x < this.objects.length; x++) {
        world_mesh = World.place_object_in_mesh(world_mesh, this.objects[x]);
    }

    // orient world to camera view 
    let oriented_mesh = this.orient_to_camera_view(world_mesh);

    //dbg_world_mesh = world_mesh.clone()

    // project 
    let projected_points = this.project(oriented_mesh);

    // drawn
    this.draw(projected_points, world_mesh);
}
