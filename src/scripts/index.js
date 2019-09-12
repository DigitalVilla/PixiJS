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
let renderer = autoRender({ width: screenY, height: screenX, backgroundColor: 0xDDDDDD });

// initialize Helper Library
const FN = new Animate({ renderer: renderer, engine: PIXI, stage: stage });
//Add the canvas to the HTML document
scene.appendChild(renderer.view);

///SPRITES
const loader = new Loader();
let girl = null;
const sprites = {};
sprites.Girl = {};
sprites.Font = {};

loader.add('girlAtlas', "assets/girlAtlas.json")
	.add('fontAtlas', "assets/fontAtlas.json");

loader.load((loader, resources) => {
	log('loader', 5)

	sprites.Font.Numeric = FN.frameBatch({
		textures: resources.fontAtlas.textures,
		batchName: 'Num',
		baseTexture:true,
		batch: {
			textureKey: 'font_',
			range: [16, 25],
			forEach: function (sprite, i) {
				sprite.x = i * sprite.width + (10 * i);
				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});

	sprites.Font.Alpha = FN.frameBatch({
		textures: resources.fontAtlas.textures,
		batchName: 'Alpha',
		batch: {
			baseTexture:true,
			textureKey: 'font_',
			range: [33, 58],
			forEach: function (sprite, i) {
				sprite.x = i * sprite.width + (1 * i);
				sprite.y = 100;
				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});

	sprites.Girl.Walk = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'Walk',
		batch: {
			textureKey: 'girl_',
			list: [11],
			forEach: function (sprite, i) {
				sprite.getCollision = FN.setCollision(sprite, { left: -40, top: -10, right: screenX + 45, bottom: screenY + 15 });
				sprite.accelerationX = 0;
				sprite.accelerationY = 0;
				sprite.frictionX = 1;
				sprite.frictionY = 1;
				sprite.speed = 0.2;
				sprite.drag = 0.6;
				sprite.vx = 0;
				sprite.vy = 0;
				sprite.x = 0;
				sprite.y = 400;

				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});

	girl = sprites.Girl.Walk[0];
	const key = FN.keyBinding({ arrows: true });

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
	};
	key.up.release = () => {
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