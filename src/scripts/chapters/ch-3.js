import * as PIXI from 'pixi.js';
import Funcs from './utils/FN';
import logger from './utils/logger';
import '../sass/main.scss';
const FN = new Funcs(PIXI);
const log = logger('PixiJS: ');
//Docs
// http://pixijs.download/release/docs/PIXI.htm

// Aliases
let Container = PIXI.Container,
	autoRender = PIXI.autoDetectRenderer,
	Loader = PIXI.Loader,
	scene = document.getElementById('scene');


//Create a container object called the `stage`
let stage = new Container();
//Create the renderer
let renderer = autoRender({
	width: 600,
	height: 600,
	backgroundColor: 0x223344
});
//Add the canvas to the HTML document
scene.appendChild(renderer.view);
//customize

///SPRITES
const loader = new Loader();
const sprites = {};
sprites.Girl = {};
let y = 0

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
				//`xOffset` determines the point from the left of the screen
				sprite.scale.set(2)
				let x = (renderer.width / 2) - (sprite.width / 2);
				y = (renderer.height / 2) - (sprite.height / 2);
				//Set the blob's position
				sprite.position.set(x, y)
				//Add the sprite to the stage
				stage.addChild(sprite);
			}
		}
	});


	// let centerY = (renderer.height / 2) - (girl.walk_0.height / 2);
	// girl.walk_0.position.set(0, centerY);
});

loader.onComplete.add(() => {
	log('onComplete')
	// gameLoop();
	FN.startAnimation(20, updateScene);
	// setTimeout(() => {
	// 	FN.stopAnimation();
	// }, 3000);
	// setTimeout(() => {
	// 	FN.startAnimation(4, updateScene);
	// }, 6000);
})


function updateScene() {
	let girl = sprites.Girl.Walk;
	for (const sprite in girl) {
		if (girl.hasOwnProperty(sprite)) {
			girl[sprite].y = y + FN.randomInt(0, 10);
		}
	}

	//Render the stage
	renderer.render(stage);
}

function gameLoop() {
	//Loop this function 60 times per second
	requestAnimationFrame(gameLoop);
	updateScene();
}
//Call the `gameLoop` function once to get it started





//Tell the `renderer` to `render` the `stage`
renderer.render(stage);

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.top = "20%";
renderer.view.style.left = "50%";
renderer.view.style.transform = "translate(-50%,0)";