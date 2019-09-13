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
const sprites = {};
let girl = {};
let digits = {};
let pixi = {};

loader.add('girlAtlas', "assets/girlAtlas.json")
	.add('tileset', "assets/tilesetAtlas.json")
	.add('fontAtlas', "assets/fontAtlas.json");

loader.load((loader, resources) => {
	log('loader', 5)

	girl = sprites.GirlWalk = FN.frameAtlas({
		textures: resources.girlAtlas.textures,
		batch: { list: [0, 1, 1, 1, 2, 3, 3, 3, 4] },
		isAnimation: true,
		addStatePlayer: true,
		setStates: {

		}
		// between:2,
	});


	pixi = sprites.GirlWalk = FN.frameAtlas({
		textures: resources.tileset.textures,
		batch: { list: [128,129,130,144,145,146,160,161,162,176,177,178] },
		isAnimation: true,
		addStatePlayer: true,
		baseTexture:true,
		setStates: {

		}
		// between:2,
	});

	pixi.play();
	pixi.animationSpeed = 0.1;
	pixi.position.set(100, 100)
	pixi.scale.set(2)
	stage.addChild(pixi);


	digits = sprites.Numbers = FN.frameAtlas({
		textures: resources.fontAtlas.textures,
		isAnimation: true,
		// baseTexture:true,
		batch: { range: [16, 25] }
	});


	// girl.play();
	girl.animationSpeed = .25;


	girl.getCollision = FN.setCollision(girl, {
		left: -40,
		top: -10,
		right: screenX + 45,
		bottom: screenY + 15
	});
	girl.accelerationX = 0;
	girl.accelerationY = 0;
	girl.frictionX = 1;
	girl.frictionY = 1;
	girl.speed = 0.2;
	girl.drag = 0.6;
	girl.vx = 0;
	girl.vy = 0;
	girl.x = 0;
	girl.y = 400;

	stage.addChild(girl);

	digits.play();
	digits.animationSpeed = 0.1;
	digits.position.set(10, 10)
	digits.scale.set(2)

	stage.addChild(digits);


	const key = FN.keyBinding({
		arrows: true
	});

	//Left arrow key `press` method
	key.left.press = () => {
		girl.accelerationX = -girl.speed;

		girl.frictionX = 1;
	};

	key.left.release = () => {
		if (!key.right.isDown) {
			girl.accelerationX = 0;
			girl.frictionX = girl.drag;
		}
	};

	key.up.press = () => {
		girl.accelerationY = -girl.speed;
		girl.frictionY = 1;
		girl.play();
	};
	key.up.release = () => {
		girl.stop();
		if (!key.down.isDown) {
			girl.accelerationY = 0;
			girl.frictionY = girl.drag;
		}
	};

	key.right.press = () => {
		girl.accelerationX = girl.speed;
		girl.frictionX = 1;
	};
	key.right.release = function () {
		if (!key.left.isDown) {
			girl.accelerationX = 0;
			girl.frictionX = girl.drag;
		}
	};

	key.down.press = () => {
		girl.accelerationY = girl.speed;
		girl.frictionY = 1;
	};
	key.down.release = () => {
		if (!key.up.isDown) {
			girl.accelerationY = 0;
			girl.frictionY = girl.drag;
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
	let collision = girl.getCollision();
	girl.vx += girl.accelerationX;
	girl.vy += girl.accelerationY;
	girl.vx *= girl.frictionX;
	girl.vy *= girl.frictionY;
	girl.x += girl.vx;
	girl.y += girl.vy;

	girl.y += 0.8;

	//Check for a collision. If the value of `collision` isn't
	//`undefined` then you know the sprite hit a boundary
	if (collision) {
		//Reverse the sprite's `vx` value if it hits the left or right
		if (collision.has("left") || collision.has("right")) {
			girl.vx = -girl.vx;
		}

		//Reverse the sprite's `vy` value if it hits the top or bottom
		if (collision.has("top") || collision.has("bottom")) {
			girl.vy = -(girl.vy * .5);
		}
	}
}

btn.addEventListener('click', () => FN.pauseAnimation())

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";