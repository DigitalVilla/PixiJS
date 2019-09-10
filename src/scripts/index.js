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
let girl = {}

loader.add('girlAtlas', "assets/girlAtlas.json");


loader.load((loader, resources) => {
	log('loader', 5, true)
	sprites.Girl = {}

	girl = sprites.Girl.Walk = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'Walk',
		batch: {
			textureKey: 'girl_',
			selection: [6, 11]
		}
	});

	let centerY = (renderer.height / 2) - (girl.walk_0.height / 2);
	girl.walk_0.position.set(0, centerY);
});

loader.onComplete.add(() => {
	log('onComplete')
	stage.addChild(girl.walk_0);

	// gameLoop();
	FN.startAnimation(4, updateScene);
	renderer.render(stage);
	setTimeout(() => {
		FN.stopAnimation();
	}, 3000);
	setTimeout(() => {
		FN.startAnimation(4, updateScene);
	}, 6000);
})


function updateScene() {
//Move the sprite 1 pixel per frame
	girl.walk_0.x += 4;
	//Render the stage
	renderer.render(stage);
}

function gameLoop() {
	// velocity
	girl.vx = 0;
	girl.vy = 0;

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