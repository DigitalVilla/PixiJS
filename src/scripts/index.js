import * as PIXI from 'pixi.js';
import Animate from './utils/FN';
import logger from './utils/logger';
import '../sass/main.scss';

const log = logger('PixiJS: ');
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
	backgroundColor: 0x223344
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
let girl = null;
let girl1 = null;
let state = true;
const sprites = {};
sprites.Girl = {};

loader.add('girlAtlas', "assets/girlAtlas.json");
loader.load((loader, resources) => {
	log('loader', 5)
	sprites.Girl.Walk = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'Walk',
		batch: {
			textureKey: 'girl_',
			list: [11],
			forEach: function (sprite, i) {
				sprite.vx = 0;
				sprite.vy = 0;
				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});
	girl = sprites.Girl.Walk.walk_0;
	girl1 = sprites.Girl.Walk.walk_1;

	const key = FN.keyBinding({arrows:true});
	key.left.press = () => {
		//Change the girl.s velocity when the key is pressed
		girl.vx = -10;
		girl.vy = 0;
	}
	key.left.release = () => {
		//If the left arrow has been released, and the right arrow isn't down,
		//and the girl isn't moving vertically, stop the sprite from moving
		//by setting its velocity to zero
		if (!key.right.isDown && girl.vy === 0) {
			girl.vx = 0;
		}
	}
	//Ups
	key.up.press = () => {
		girl.vy = -10;
		girl.vx = 0;
	};
	key.up.release = () => {
		if (!key.down.isDown && girl.vx === 0) {
			girl.vy = 0;
		}
	};

	//Right
	key.right.press = () => {
		girl.vx = 10;
		girl.vy = 0;
	};
	key.right.release = () => {
		if (!key.left.isDown && girl.vy === 0) {
			girl.vx = 0;
		}
	};

	//Down
	key.down.press = () => {
		girl.vy = 10;
		girl.vx = 0;
	};
	key.down.release = () => {
		if (!key.up.isDown && girl.vx === 0) {
			girl.vy = 0;
		}
	};

	// log(stage.children[0])
	FN.startAnimation({
		update: main,
		fps: 30
	});
});

// Game logic
function main() {
	girl.x += girl.vx;
	girl.y += girl.vy;
}

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";