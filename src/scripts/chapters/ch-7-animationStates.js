import * as PIXI from 'pixi.js';
import Animate from './utils/FN';
import logger from './utils/logger';
import '../sass/main.scss';

const log = logger('PixiJS: ');
let btn = document.getElementById('control');
//Docs
// http://pixijs.download/release/docs/PIXI.htm

// Aliases
let Container = PIXI.Container,
	autoRender = PIXI.autoDetectRenderer,
	Loader = PIXI.Loader,
	scene = document.getElementById('scene'),
	screenX = 600,
	screenY = 600;
//Create a container object called the `stage`
let stage = new Container();
//Create the renderer
let renderer = autoRender({
	width: screenY,
	height: screenX,
	backgroundColor: 0xDDDDDD
});

// initialize Helper Library
const FN = new Animate({
	renderer: renderer,
	engine: PIXI,
	stage: stage
});
//Add the canvas to the HTML document
scene.appendChild(renderer.view);

///SPRITES
const loader = new Loader();
let digits = {};
let pixi = {};

loader.add('tileset', "assets/tilesetAtlas.json");

loader.load((loader, resources) => {
	log('loader', 5)

	pixi = FN.frameAtlas({
		textures: resources.tileset.textures,
		batch: { list: [128, 129, 130, 144, 145, 146, 160, 161, 162, 176, 177, 178] },
		isAnimation: true,
		addStatePlayer: true,
		baseTexture: true,
		setStates: {
			down: 0, walkDown: [0, 2],
			left: 3, walkLeft: [3, 5],
			right: 6, walkRight: [6, 8],
			up: 9, walkUp: [9, 11]
		}
		// between:2,
	});

	// pixi.play();
	pixi.animationSpeed = .25;
	pixi.scale.set(2)
	console.log(pixi.fps = 10);


	pixi.getCollision = FN.setCollision(pixi, { left: 0, top: 0, right: screenX, bottom: screenY });

	pixi.vx = 0;
	pixi.vy = 0;
	pixi.x = 300;
	pixi.y = 300;

	stage.addChild(pixi);

	const key = FN.keyBinding({
		arrows: true
	});

	//Left arrow key `press` method
	key.left.press = () => {
		//Play the sprite's `walkLeft` animation
		//sequence and set the sprite's velocity
		pixi.playAnimation(pixi.states.walkLeft);
		pixi.vx = -10;
		pixi.vy = 0;
	};
	//Left arrow key `release` method
	key.left.release = () => {
		//If the left arrow has been released, and the right arrow isn't down,
		//and the sprite isn't moving vertically, stop the sprite from moving
		//by setting its velocity to zero. Then display the sprite's static
		//`left` state.
		if (!key.right.isDown && pixi.vy === 0) {
			pixi.vx = 0;
			pixi.show(pixi.states.left);
		}
	};

	//Up
	key.up.press = () => {
		pixi.playAnimation(pixi.states.walkUp);
		pixi.vy = -10;
		pixi.vx = 0;
	};
	key.up.release = () => {
		if (!key.down.isDown && pixi.vx === 0) {
			pixi.vy = 0;
			pixi.show(pixi.states.up);
		}
	};
	//Right
	key.right.press = () => {
		pixi.playAnimation(pixi.states.walkRight);
		pixi.vx = 10;
		pixi.vy = 0;
	};
	key.right.release = () => {
		if (!key.left.isDown && pixi.vy === 0) {
			pixi.vx = 0;
			pixi.show(pixi.states.right);
		}
	};
	//Down
	key.down.press = () => {
		pixi.playAnimation(pixi.states.walkDown);
		pixi.vy = 10;
		pixi.vx = 0;
	};
	key.down.release = () => {
		if (!key.up.isDown && pixi.vx === 0) {
			pixi.vy = 0;
			pixi.show(pixi.states.down);
		}
	};

	FN.startAnimation({
		update: main,
		logicFps: 20,
	});
});

// log(FN.getTextureAtlas('font', 300, 160, 15, 8), 1, true);
// Game logic
function main() {
	let collision = pixi.getCollision();
	pixi.x += pixi.vx;
	pixi.y += pixi.vy;

	// pixi.y += 0.8;

	//Check for a collision. If the value of `collision` isn't
	//`undefined` then you know the sprite hit a boundary
	if (collision) {
		//Reverse the sprite's `vx` value if it hits the left or right
		if (collision.has("left") || collision.has("right")) {
			// pixi.vx = -pixi.vx;
		}

		//Reverse the sprite's `vy` value if it hits the top or bottom
		if (collision.has("top") || collision.has("bottom")) {
			// pixi.vy = -(pixi.vy * .5);
		}
	}
}

btn.addEventListener('click', () => FN.pauseAnimation())

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";