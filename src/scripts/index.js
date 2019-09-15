// http://pixijs.download/release/docs/PIXI.htm
import Animate from './utils/Animate';
import * as PIXI from 'pixi.js';
import logger from "./utils/logger";
import '../sass/main.scss';

// Global variables
let Container = PIXI.Container,
	autoRender = PIXI.autoDetectRenderer,
	Loader = PIXI.Loader,
	scene = document.getElementById('scene'),
	btnPlay = document.getElementById('play'),
	btnPause = document.getElementById('pause'),
	screenX = 720,
	screenY = 480,
	stage = new Container(),
	loader = new Loader(),
	renderer = autoRender({
		width: screenX,
		height: screenY,
		backgroundColor: 0xdddddd
	});

// initialize helper libraries
const log = logger('Index.JS: ');
const anima = new Animate({ PIXI, stage, renderer });
const loop = anima.loop({ update: main, logicFps: 30 });
const spx = anima.spritex();

//game varaables
let pixi = {};
let leftDirection = false;

//Add the canvas to the HTML document
scene.appendChild(renderer.view);

loader.add('tileset', "assets/tilesetAtlas.json")
	.add('girl', "assets/girlAtlas.json");

loader.load((loader, resources) => {
	log('loader', 5)

	pixi = spx.frameAtlas({ textures: resources.girl.textures, baseTexture: true })
		.makeAnimatedSprite().addStatePlayer().setKeyBindings('arrows')
		.setCollision({ left: 40, top: 0, right: screenX + 20, bottom: screenY }, true)
		.setAnimationStates({
			// states
			idle: 0,
			dead: 32,
			climb: 34,
			// actions
			idling: [0, 4],
			ducking: [21, 17],
			hitting: [22, 25],
			rolling: [17, 20],
			walking: [5, 10],
			jumpingUp: [11, 13],
			jumpingDown: [14, 16],
			hurting: [26, 27],
			dying: [28, 32],
			climbing: [33, 36]
		}).getSprite();


	pixi.animationSpeed = .25;

	pixi.vx = 0;
	pixi.vy = 0;
	pixi.x = 100;
	pixi.y = 300;


	// //Left arrow key `press` method
	pixi.key.left.press = () => {
		if (!leftDirection) {
			pixi.show(pixi.states.idle);
			pixi.x = pixi.x + pixi.width;
			pixi.width = -pixi.width;
			leftDirection = true;
		}

		pixi.playAnimation(pixi.states.walking);
		pixi.vx = -10;
		pixi.vy = 0;
	};
	pixi.key.left.release = () => {
		if (!pixi.key.right.isDown && pixi.vy === 0) {
			pixi.vx = 0;
			// pixi.show(pixi.states.idle);
			pixi.playAnimation(pixi.states.idling);
		}
	};

	//Right
	pixi.key.right.press = () => {
		if (leftDirection) {
			pixi.x = pixi.x - pixi.width;
			pixi.width = -pixi.width;
			leftDirection = false;
		}

		pixi.playAnimation(pixi.states.walking);
		pixi.vx = 10;
		pixi.vy = 0;
	};
	pixi.key.right.release = () => {
		if (!pixi.key.left.isDown && pixi.vy === 0) {
			pixi.vx = 0;
			// pixi.show(pixi.states.idle);
			pixi.playAnimation(pixi.states.idling);
		}
	};

	//Up
	pixi.key.up.press = () => {
		pixi.playAnimation(pixi.states.jumpingUp);
		pixi.vy = -10;
		pixi.vx = 0;
	};
	pixi.key.up.release = () => {
		if (!pixi.key.down.isDown && pixi.vx === 0) {
			pixi.vy = 10;
			pixi.vx = 0;
			// pixi.show(pixi.states.idle);
			pixi.playAnimation(pixi.states.jumpingDown);
		}
	};

	//Down
	pixi.key.down.press = () => {
		pixi.show(pixi.states.idle);
		pixi.playAnimation(pixi.states.ducking);

	};
	pixi.key.down.release = () => {
		if (!pixi.key.up.isDown && pixi.vx === 0) {
			pixi.vy = 0;
			// pixi.show(pixi.states.idle);
			pixi.playAnimation(pixi.states.idling);
		}
	};

	pixi.playAnimation(pixi.states.idling);
	stage.addChild(pixi);
	loop.animate();
});

// Game logic
function main() {
	if (pixi) {
		let collision = pixi.getCollision();
		pixi.x += pixi.vx;
		pixi.y += pixi.vy;

		// pixi.y += 0.8;

		//Check for a collision. If the value of `collision` isn't
		//`undefined` then you know the sprite hit a boundary
		if (collision) {
			//Reverse the sprite's `vx` value if it hits the left or right
			if (collision.has("left")) {
			}

			if (collision.has("right")) {
			}

			if (collision.has("top")) {
			}

			if (collision.has("bottom")) {
			}
		}
	}
}

btnPlay.addEventListener('click', () => loop.playAnimation())
btnPause.addEventListener('click', () => loop.pauseAnimation())
//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";