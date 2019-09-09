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

loader.add('tileSet', "assets/girl.png")


loader.load((loader, resources) => {
    log(['loader',resources])
    let frame = FN.frame(resources.tileSet, 99, 74);
    sprites.girl = frame(0,3);
    //Position the sprite on the canvas
    sprites.girl.x = 64;
    sprites.girl.y = 64;
});

loader.onComplete.add(() => {
    log('onComplete')
    //Add the sprite to the stage
    stage.addChild(sprites.girl);
    //Render the stage
    renderer.render(stage);
})


//Tell the `renderer` to `render` the `stage`
// renderer.resize(1080, 512);
renderer.render(stage);

//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.width = "100vw";
renderer.view.style.height = "100vh";
renderer.view.style.display = "block";