let engine = Matter.Engine.create();

let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1600,
        height: 900,
        wireframes: false
    }
});

let ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
let boxB = Matter.Bodies.rectangle(450, 50, 80, 80);

const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: { visible: false }
    }
});
render.mouse = mouse;

// the first two arguments to stack are the x and y position of the stack
// the next two are the number of objects in the stack and the spacing between them
const stack = Matter.Composites.stack(20, 20, 10, 5, 0, 0, function(x, y) {
    const sides = Math.round(Matter.Common.random(2, 8));
    return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(20, 50));
});



Matter.World.add(engine.world, [stack, ground, mouseConstraint]);
Matter.Runner.run(engine);
Matter.Render.run(render);
