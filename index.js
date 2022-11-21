let engine = Matter.Engine.create();

let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 1200,
        wireframes: false,
        // background: 'url(./windchime.png)',
        // backgroundSize: 'cover',

        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true,
        showPositions: true,
        showConvexHulls: true,
        showAxes: false,
    }
});

// place ground at bottom of screen and set to screen width
let ground = Matter.Bodies.rectangle(400, 1200, 810, 100, { isStatic: true });

// place walls at sides of screen from ground to 50% screen height
let leftWall = Matter.Bodies.rectangle(0, 400, 60, 1200, { isStatic: true });
let rightWall = Matter.Bodies.rectangle(800, 400, 60, 1200, { isStatic: true });

// create angular "walls" to keep ball in play
let leftAngularWall1 = Matter.Bodies.rectangle(340, 200, 10, 200, { isStatic: true, angle: 2 });

let rightAngularWall1 = Matter.Bodies.rectangle(500, 400, 10, 200, { isStatic: true, angle: -2 });

let leftAngularWall2 = Matter.Bodies.rectangle(300, 600, 10, 200, { isStatic: true, angle: 2 });

let rightAngularWall2 = Matter.Bodies.rectangle(500, 800, 10, 200, { isStatic: true, angle: -2 });


let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: { visible: false }
    }
});
render.mouse = mouse;


// RANDOM BODIES

let stack = Matter.Composites.stack(200, 100, 5, 5, 0, 0, function (x, y) {
    // create random body types and sizes 
    let sides = Math.round(Matter.Common.random(4, 9));
    let options = {
        friction: 1,
        restitution: 0.1,
        density: 1,
        mass: 10,
    };

    switch (Math.round(Matter.Common.random(0, 1))) {
        case 0:
            if (Matter.Common.random() < 0.8) {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(3, 34), Matter.Common.random(25, 50), options);
            }
            else {
                return Matter.Bodies.rectangle(x, y, Matter.Common.random(3, 45), Matter.Common.random(25, 30), options);
            }
        case 1:
            return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(5, 25), options);
    }

});

// Every second, drop a random new object from the top middle of the screen
setInterval(function () {
    let sides = Math.round(Matter.Common.random(4, 9));
    let options = {
        friction: 1,
        restitution: 0.1,
        density: 1,
        mass: 10,
    };

    switch (Math.round(Matter.Common.random(0, 1))) {
        case 0:
            if (Matter.Common.random() < 0.8) {
                return Matter.World.add(engine.world, Matter.Bodies.rectangle(400, 0, Matter.Common.random(3, 34), Matter.Common.random(25, 50), options));
            }
            else {
                return Matter.World.add(engine.world, Matter.Bodies.rectangle(400, 0, Matter.Common.random(3, 45), Matter.Common.random(25, 30), options));
            }
        case 1:
            return Matter.World.add(engine.world, Matter.Bodies.polygon(400, 0, sides, Matter.Common.random(5, 25), options));
    }
}, 1000);



// BALL AND SLING

// place ball in top center of canvas
// let ball = Matter.Bodies.circle(600, 50, 25, { restitution: 0.8, lable: 'slingball' });
// let sling = Matter.Constraint.create({
//     pointA: { x: 500, y: 0 },
//     bodyB: ball,
//     stiffness: 0.005,
//     length: 100,
//     render: {
//         strokeStyle: '#ffffff',
//         lineWidth: 5
//     },
//     label: 'sling'
// });



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
    let volume = Math.min(Math.abs(velocity.x * .08) + Math.abs(velocity.y * .08), 1);

   
    // pitch is determined by the body area
    let pitch = Math.round(body.area / 100) * 100;

    // normalize the a multiple of 100
    let note = Math.round(pitch / 100) % 5;

     // quantize pitch to C major pentatonic scale
    let notes = [261.63, 329.63, 392, 523.25, 659.25];

    // set note pitch to the quantized pitch
    let notePitch = notes[note];

    let noteDuration = 0.1;

    const reverb = new Tone.Reverb({
        decay: 1,
        preDelay: 0.01
    }).toDestination();


    // play sound
    let synth = new Tone.Synth({
        oscillator: {
            type: 'triangle'
        },
        envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.2,
            release: 0.7
        }
    }).connect(reverb).toDestination();
    // synth.triggerAttackRelease(notePitch, '32n', undefined, volume);

    // Only trigger synth if body is moving fast enough
    // prevent two sounds from playing at once by checking if the synth is already playing

    if (volume > .01 && !synth.playing) {
        console.log("PITCH", pitch, "VOLUME", volume);
        if(body.type === 'circle') {
            synth.triggerAttackRelease(notePitch, '32n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        } else if( body.type === 'rectangle') {
            synth.triggerAttack("notePitch", volume)
            console.log("PITCH", pitch, "VOLUME", volume);
        } else if( body.type === 'polygon') {
            synth.triggerAttackRelease(notePitch, '32n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        } else {
            synth.triggerAttackRelease(notePitch, '32n', undefined, volume);
            console.log("PITCH", pitch, "VOLUME", volume);
        }

    }

    // refresh synth and effets (prevents bug where sound stops after a few seconds)
    setInterval(function () {
        synth.dispose();
        reverb.dispose();
    }, 500);

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
    Matter.World.add(engine.world, [ground, leftWall, rightWall, leftAngularWall1, rightAngularWall1, leftAngularWall2, rightAngularWall2, stack, mouseConstraint]);
    Matter.Runner.run(engine);
    Matter.Render.run(render);
}


// wait for user interation to start the app
document.addEventListener('click', startApp);





