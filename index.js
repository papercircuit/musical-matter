let engine = Matter.Engine.create();

let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1200,
        height: 800,
        wireframes: false
    }
});

// place ground at bottom of screen and set to screen width
let ground = Matter.Bodies.rectangle(600, 800, 1200, 50, { isStatic: true });
// place walls at sides of screen from ground to 50% screen height
let leftWall = Matter.Bodies.rectangle(0, 400, 50, 800, { isStatic: true });
let rightWall = Matter.Bodies.rectangle(1200, 400, 50, 800, { isStatic: true });

let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
let boxB = Matter.Bodies.rectangle(450, 50, 80, 80);


let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: { visible: false }
    }
});
render.mouse = mouse;

let ball = Matter.Bodies.circle(300, 600, 20);
let sling = Matter.Constraint.create({
    pointA: { x: 300, y: 600 },
    bodyB: ball,
    stiffness: 0.005
});

let stack = Matter.Composites.stack(800, 270, 20, 20, 0, 0, function (x, y) {
    // create random body types and sizes 
    let sides = Math.round(Matter.Common.random(1, 8));
    let options = {
        friction: 0.001,
        restitution: 0.8,
        density: 100,
        mass: 100,
    };

    switch (Math.round(Matter.Common.random(0, 1))) {
        case 0:
            if (Matter.Common.random() < 0.8) {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(25, 50), Matter.Common.random(25, 50), options);
            }
            else {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(80, 120), Matter.Common.random(25, 30), options);
            }
        case 1:
            return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(25, 50), options);
    }

});

let firing = false;
Matter.Events.on(mouseConstraint, "enddrag", function (event) {
    if (event.body === ball) firing = true;
});

Matter.Events.on(engine, 'afterUpdate', function () {
    if (firing && Math.abs(ball.position.x - 300) < 20 && Math.abs(ball.position.y - 600) < 30) {
        ball = Matter.Bodies.circle(300, 600, 20);
        Matter.World.add(engine.world, ball);
        sling.bodyB = ball;
        firing = false;
    }
});

Matter.Events.on(engine, 'collisionStart', function (event) {
    let body = event.pairs[0].bodyA;
    let velocity = body.velocity;
    let radius = body.circleRadius;
    let volume = Math.min(Math.abs(velocity.x) + Math.abs(velocity.y), 1);
    let pitch = radius * 10 + 220;
    let synth = new Tone.Synth().toDestination();
    // Only trigger synth if body is moving fast enough
    if (volume > .8) {
        synth.triggerAttackRelease(pitch, '8n', undefined, volume);
        console.log("PITCH", pitch, "VOLUME", volume);
    }

    setInterval(function () {
        synth.dispose();
    }, 1000);
});

function startApp() {
    // only allow one click per page load
    document.removeEventListener('click', startApp);
    Matter.World.add(engine.world, [ground, leftWall, rightWall, boxA, boxB, ball, sling, stack, mouseConstraint]);
    Matter.Runner.run(engine);
    Matter.Render.run(render);
}


// wait for user interation to start the app
document.addEventListener('click', startApp);





