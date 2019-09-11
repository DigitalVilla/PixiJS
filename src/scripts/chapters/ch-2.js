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
	height: 200,
	backgroundColor: 0x223344
});
//Add the canvas to the HTML document
scene.appendChild(renderer.view);
//customize

///SPRITES
const loader = new Loader();
const sprites = {};

loader.add('girlAtlas', "assets/girlAtlas.json")
.add('single', "assets/girl.png")


loader.load((loader, resources) => {
	log('loader', 5, true)

	sprites.single = FN.singleFrame(resources.single.texture, 99,74, 3,4);

	sprites.Girl = {}
	sprites.Girl.Idle = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'Idle',
		batch: {
			textureKey: 'girl_',
			list: [0, 11, 24, 27]
		}
	});

	log(sprites.Girl)

	sprites.Girl.Next = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'Next',
		batch: {
			textureKey: 'girl_',
			selection: [0, 4]
		}
	});

	sprites.Girl.All = FN.frameBatch({
		textures: resources.girlAtlas.textures,
		batchName: 'All',
	});


	log(sprites.Girl)

	// let centerY = (renderer.height / 2) - (girl.walk_0.height / 2);
	// girl.walk_0.position.set(0, centerY);

	//Position the sprite on the canvas
	sprites.Girl.Next.next_0.position.set(0, 80);
	sprites.Girl.Next.next_1.position.set(100, 80);
	sprites.Girl.Next.next_2.position.set(200, 80);
	sprites.Girl.Next.next_3.position.set(300, 80);

});

loader.onComplete.add(() => {
	log('onComplete')
	//Add the sprite to the stage
	stage.addChild(sprites.single);

	stage.addChild(sprites.Girl.Next.next_0);
	stage.addChild(sprites.Girl.Next.next_1);
	stage.addChild(sprites.Girl.Next.next_2);
	stage.addChild(sprites.Girl.Next.next_3);
	// stage.addChild(sprites.Girl.Idle[0]);
	// //Render the stage
	renderer.render(stage);
})

// let map = FN.textureAtlas('girl',594,518,6,7,37);
// log(JSON.stringify(map),4,true);

//Tell the `renderer` to `render` the `stage`
renderer.render(stage);

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.width = "100vw";
renderer.view.style.height = "100vh";
renderer.view.style.display = "block";