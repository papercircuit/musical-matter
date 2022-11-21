let engine = Matter.Engine.create();

let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1200,
        height: 800,
        wireframes: false,
        // background: 'url(./windchime.png)',
        // backgroundSize: 'cover',

        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true,
        showPositions: true,
        showConvexHulls: true,
        showAxes: true,
    }
});

// place ground at bottom of screen and set to screen width
let ground = Matter.Bodies.rectangle(600, 800, 1200, 50, { isStatic: true });

// place walls at sides of screen from ground to 50% screen height
let leftWall = Matter.Bodies.rectangle(0, 400, 50, 800, { isStatic: true });
let rightWall = Matter.Bodies.rectangle(1200, 400, 50, 800, { isStatic: true });

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: { visible: false }
    }
});
render.mouse = mouse;


// RANDOM BODIES

let stack = Matter.Composites.stack(800, 270, 20, 20, 0, 0, function (x, y) {
    // create random body types and sizes 
    let sides = Math.round(Matter.Common.random(4, 6));
    let options = {
        friction: 0.001,
        restitution: 0.1,
        density: 100,
        mass: 100,
    };

    switch (Math.round(Matter.Common.random(0, 1))) {
        case 0:
            if (Matter.Common.random() < 0.8) {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(10, 100), Matter.Common.random(25, 50), options);
            }
            else {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(80, 120), Matter.Common.random(25, 30), options);
            }
        case 1:
            return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(25, 50), options);
    }

});

// BALL AND SLING

// place ball in top center of canvas
let ball = Matter.Bodies.circle(600, 50, 25, { restitution: 0.8, lable: 'slingball' });
let sling = Matter.Constraint.create({
    pointA: { x: 500, y: 0 },
    bodyB: ball,
    stiffness: 0.005,
    length: 100,
    render: {
        strokeStyle: '#ffffff',
        lineWidth: 5
    },
    label: 'sling'
});



// Create firing event for ball and sling that releases the ball
let firing = false;
let fire = function (event) {
    if (firing) {
        firing = false;
        Matter.Body.setPosition(ball, { x: 600, y: 50 });
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(ball, 0);
        Matter.Body.setStatic(ball, true);
        sling.pointA = { x: 600, y: 150 };
    }
    else {
        firing = true;
        Matter.Body.setStatic(ball, false);
        sling.pointA = { x: 600, y: 50 };
    }
};
const randomRadius = () => {
    return Math.floor(Math.random() * 50) + 10;
}
;

Matter.Events.on(engine, 'collisionStart', function (event) {
    let body = event.pairs[0].bodyA;
    let velocity = body.velocity;
    let volume = Math.min(Math.abs(velocity.x * .05 ) + Math.abs(velocity.y * .05), 1);

   // quantize pitch to C major pentatonic scale
    let pitch = Math.round(body.position.x / 100) * 100;
    let note = Math.round(pitch / 100) % 5;
    let notes = [261.63, 329.63, 392, 523.25, 659.25];
    let notePitch = notes[note];

    // play sound
    let synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(notePitch, '8n', undefined, volume);

    // Only trigger synth if body is moving fast enough
    if (volume > .2) {
        console.log("PITCH", pitch, "VOLUME", volume);
        if(body.type === 'circle') {
            synth.triggerAttackRelease(notePitch, '8n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        } else if( body.type === 'rectangle') {
            synth.triggerAttackRelease(notePitch, '8n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        } else if( body.type === 'polygon') {
            synth.triggerAttackRelease(notePitch, '8n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        } else {
            synth.triggerAttackRelease(notePitch, '8n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        }
      
    }

    // refresh synth after 1 second (prevents bug where synth stops after a few seconds)
    setInterval(function () {
        synth.dispose();
    }, 1000);

    // change color of body on collision to random color
    body.render.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    


});

// add wind effect to bodies from left to right
// wind will change speed gradually up and down


// Matter.Events.on(engine, 'beforeUpdate', function (event) {
//     let bodies = Matter.Composite.allBodies(engine.world);
//     for (let i = 0; i < bodies.length; i++) {
//         let body = bodies[i];
//         if (body.position.x < 600) {
//             Matter.Body.applyForce(body, { x: 0, y: 0 }, { x: wind, y: 0 });
//         }
//         else {
//             Matter.Body.applyForce(body, { x: 0, y: 0 }, { x: .0001, y: 0 });
//         }
//     }
// });

// START APP

// when a user clicks inside the canvas create a new body
Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
    let body = Matter.Bodies.circle(event.mouse.position.x, event.mouse.position.y, randomRadius(), { restitution: 0.8 });
    Matter.World.add(engine.world, body);
});



function startApp() {
    // only allow one click per page load
    document.removeEventListener('click', startApp);
    Matter.World.add(engine.world, [ground, leftWall, rightWall, ball, sling, stack, mouseConstraint]);
    Matter.Runner.run(engine);
    Matter.Render.run(render);
}


// wait for user interation to start the app
document.addEventListener('click', startApp);





