let canvas = document.getElementById('outCanvas');
let ctx = canvas.getContext('2d');

// size canvas and get origin
let width = window.innerWidth;
let height= window.innerHeight;
ctx.canvas.width  = width;
ctx.canvas.height = height;

// canvas origin
origin_x = width/2;
origin_y = height/2;

// define 3d points

// x, y, z
let points = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
]

// draw edge between [point, point]
let edges = [
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
];

// define camera position (faces -y)
let Cx = 1.5;
let Cy = 3;
let Cz = 1.5;
let camera_position = [Cx, Cy, Cz];
let camera_distance = 1;

// define output scaling
let scale = 200;

// calculate projection
let projected_points = []
for (let i = 0; i < points.length; i++) {
    // get point
    let Px = points[i][0];
    let Py = points[i][1];
    let Pz = points[i][2];

    // get distances from camera
    let Dx = Px - Cx;
    let Dy = Py - Cy;
    let Dz = Pz - Cz;

    // project
    let projected_y = camera_distance*(Dz/Dy);
    let projected_x = camera_distance*(Dx/Dy);

    // scale and transform to center of canvas
    let final_x = origin_x - projected_x*scale;
    let final_y = origin_y + projected_y*scale;

    projected_points.push([final_x, final_y])
}

// draw points
for (let p = 0; p < projected_points.length; p++) {
    let final_x = projected_points[p][0];
    let final_y = projected_points[p][1];
    //ctx.fillRect(final_x-1, final_y-1, 2, 2);
}

// draw edges
for (let e = 0; e < edges.length; e++) {
    let p1 = projected_points[edges[e][0]];
    let p2 = projected_points[edges[e][1]];

	// set line stroke and line width
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();


}
