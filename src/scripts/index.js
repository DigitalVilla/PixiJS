// http://pixijs.download/release/docs/PIXI.htm
import Animate from './utils/Animate';
import * as PIXI from 'pixi.js';
import logger from "./utils/logger";
import '../sass/main.scss';

// Global variables
let Container = PIXI.Container,
	autoRender = PIXI.autoDetectRenderer,
	Loader = PIXI.Loader,
	$ = (id) => document.getElementById(id),
	scene = $('scene'),
	btnPlay = $('play'),
	btnPause = $('pause'),
	ctrl = $('controls'),
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
const loop = anima.loop({ update: main, logicFps: 24 });
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
	let pixiSprite = spx.frameAtlas({ textures: resources.girl.textures, baseTexture: true })
		.makeAnimatedSprite().addStatePlayer().setKeyBindings('arrows')
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
		});

pixi = pixiSprite.getSprite();
pixiSprite.setCollision({ left: pixi.width - 20, top: 0, right: screenX + 20, bottom: screenY }, true)
pixiSprite.setCollision({ left: pixi.width - 20, top: 0, right: screenX + 20, bottom: screenY }, true)

	pixi.vx = 0;
	pixi.vy = 0;
	pixi.x = 100;
	pixi.y = 300;

	// //Left arrow key `press` method
	pixi.key.left.press = () => {
		if (!leftDirection) {
			inverseX();
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

		//Right
	pixi.key.right.press = () => {
		if (leftDirection) {
			inverseX();
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

	//Down
	pixi.key.down.press = () => {
		pixi.vy = 0;
		pixi.vx = 0;
		pixi.show(pixi.states.idle);
		pixi.playAnimation(pixi.states.ducking);

	};
	pixi.key.down.release = () => {
		if (!pixi.key.up.isDown && pixi.vx === 0) {
			// pixi.show(pixi.states.idle);
			pixi.playAnimation(pixi.states.idling);
		}
	};

	ctrl.children[0].addEventListener('mousedown',()=> pixi.key.left.press())
	ctrl.children[0].addEventListener('mouseup',()=> pixi.key.left.release())

	ctrl.children[1].addEventListener('mousedown',()=> pixi.key.up.press())
	ctrl.children[1].addEventListener('mouseup',()=> pixi.key.up.release())

	ctrl.children[2].addEventListener('mousedown',()=> pixi.key.right.press())
	ctrl.children[2].addEventListener('mouseup',()=> pixi.key.right.release())

	ctrl.children[3].addEventListener('mousedown',()=> pixi.key.down.press())
	ctrl.children[3].addEventListener('mouseup',()=> pixi.key.down.release())

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
				// console.log(pixi);
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

function inverseX () {
	pixi.show(pixi.states.idle);
	pixi.x = leftDirection ? pixi.x - pixi.width
	: pixi.x + pixi.width;
	pixi.width = -pixi.width;
	leftDirection = !leftDirection;
}

btnPlay.addEventListener('click', () => loop.playAnimation())
btnPause.addEventListener('click', () => loop.pauseAnimation())
//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "0";
renderer.view.style.zIndex = 0;
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";