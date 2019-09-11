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
				girl = sprite;
				sprite.vx = 5;
				sprite.vy = 4;
				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});
	FN.startAnimation({
		update: main,
		fps: 20
	});
});


function main() {
	if (!state) {
		return FN.stopAnimation();
	}

	if (girl.y + girl.height >= screenY) {
		girl.vy = -girl.vy;
	}
	if (girl.x + girl.width >= screenX) {
		girl.vx = -girl.vy;
	}

	if (girl.y <= 0) {
		girl.vy = Math.abs(girl.vy);
	}
	if (girl.x <= 0) {
		girl.vx = Math.abs(girl.vy);
	}

	girl.y += girl.vy;
	girl.x += girl.vx;
}


//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";