import * as PIXI from 'pixi.js';
import logger from './utils/logger';
import '../sass/main.scss';
const log = logger('PixiJS: ');
//Docs
// http://pixijs.download/release/docs/PIXI.htm

// game loop renderer
// https://github.com/pixijs/pixi.js/wiki/v5-Custom-Application-GameLoop

// var app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x001144 });
// document.body.appendChild(app.view);


// Aliases
let Container = PIXI.Container,
    autoRender = PIXI.autoDetectRenderer,
    Loader = PIXI.Loader,
    Sprite = PIXI.Sprite,
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
// renderer.resize(1080, 512);

///SPRITES
const loader = new Loader();
const sprites = {};

/*  throughout the process multiple signals can be dispatched.
    loader.onProgress.add(() => {}); // called once per loaded/errored file
    loader.onError.add(() => {}); // called once per errored file
    loader.onLoad.add(() => {}); // called once per loaded file
    loader.onComplete.add(() => {}); // called once when the queued resources all load.
*/
loader.add('kid', "assets/explorer.png")
    .add('cat', "assets/cat64x64.png")
    .add('boar', "assets/boar.gif")

loader.load((loader, resources) => {
    log('loader')
    //Create the sprite from the texture
    // sprites.cat = new PIXI.TilingSprite(resources.cat.texture); //tiles
    sprites.cat = new Sprite(resources.cat.texture); // sprites
    sprites.kid = new Sprite(resources.kid.texture); // sprites
    sprites.kid = new Sprite(resources.boar.texture); // sprites
    //Add the sprite to the stage
    // sprites.cat.x = 400; sprites.cat.y = 100;
    sprites.boar.position.set(400, 60);
});

loader.onComplete.add(() => {
    log('onComplete')
    //Add the sprite to the stage
    stage.addChild(sprites.cat);
    stage.addChild(sprites.kid);
    stage.addChild(sprites.boar);

    // stage.removeChild(sprites.cat); // remove
    // sprites.cat.visible = false;; // hide - best!!
    // sprites.cat.destroy(true, true); // extreme -> frees GPU

    //Update renderer
    renderer.render(stage);
})


//Tell the `renderer` to `render` the `stage`
renderer.render(stage);
//responsive directives
renderer.view.style.position = "absolute";
renderer.view.style.width = "100vw";
renderer.view.style.height = "100vh";
renderer.view.style.display = "block";