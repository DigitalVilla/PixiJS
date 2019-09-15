import logger from "./logger";
let log = logger('Animate: ');

export default class SpriteX {
	constructor(engine) {
		this.engine = engine;
		this.sprite = null
	}

	frameSingle(texture, tileWidth, tileHeight, xIndex, yIndex) {
		log('singleFrame():', 2);
		let x = xIndex * tileWidth;
		let y = yIndex * tileHeight;
		//size of the sub-image you want to extract from the texture
		let imageFrame = new this.engine.Rectangle(x, y, tileWidth, tileHeight);
		//Tell the texture to use that rectangular section
		texture.frame = imageFrame;
		//Return the sprite from the texture
		return new this.engine.Sprite(texture);
	}

	frameStrip(texture, xIndex, yIndex, spacing = 0) {
		/// to be implemented
	}

	frameAtlas(options) {
		log('frameAtlas():', 2);
		let textures = options.textures;
		let between = options.between || 1;
		// Get a selection of items
		let batch = options.batch;
		let baseTexture = options.baseTexture;
		// Get unordered items
		let list = batch && batch.list;
		// Get order items
		let range = batch && batch.range;
		// batch container
		let count = 0;
		let spritesArr = [];
		let prefix = batch && textures[Object.keys(textures)[0]].textureCacheIds[0];
		prefix = prefix && prefix.slice(0, prefix.indexOf('0'));

		let setSprite = (texture, i) => {
			for (let i = 0; i < between; i++) {
				spritesArr.push(texture);
			}

			if (baseTexture) {
				spritesArr[i].baseTexture.scaleMode = this.engine.SCALE_MODES.NEAREST;
			}
			if (batch && typeof batch.forEach === 'function') {
				batch.forEach(spritesArr[i], i);
			}
			count++;
		};

		if (batch) {
			console.log(textures, list);
			if (prefix && list && list.length) {
				for (let i = 0, len = list.length; i < len; i++) {
					let key = `${prefix}${list[i]}`;
					if (textures.hasOwnProperty(key)) {
						setSprite(textures[key], count);
					}
				}
			} else if (prefix && range && range.length == 2) {
				for (let i = range[0], len = range[1]; i <= len; i++) {
					let key = `${prefix}${i}`;
					if (textures.hasOwnProperty(key)) {
						setSprite(textures[key], count);
					}
				}
			}
		} else {
			for (const key in textures) {
				if (textures.hasOwnProperty(key)) {
					setSprite(textures[key], count);
				}
			}
		}


		// spritesArr = isAnimation ? new this.engine.AnimatedSprite(spritesArr) : spritesArr;
		// return addStatePlayer ? this.addStatePlayer(spritesArr, states) : spritesArr;
		this.sprite = spritesArr;
		return this;
	}
	/**
	 *
	 */
	makeSingleAsSprites() {
		let spritesArr = [];
		let len = this.sprite.length;
		if (len && len > 0)
			for (let i = 0; i < len; i++) {
				spritesArr.push(new this.engine.Sprite(this.sprite[i]));
			}
		this.sprite = spritesArr;
		return this;
	}

	makeAnimatedSprite() {
		this.sprite = new this.engine.AnimatedSprite(this.sprite);
		return this;
	}


	makeTextureAtlas(prefix, texture, countX, countY, totalCount) {
		// log(FN.getTextureAtlas('font',300,160,15,8),1,true);
		log('textureAtlas():', 2);
		let mapWidth = texture.orig.width;
		let mapHeight = texture.orig.height;
		let tileW = mapWidth / countX;
		let tileY = mapHeight / countY;
		totalCount = totalCount || countX * countY;
		let atlas = {};
		atlas.frames = {};
		let count = 0;

		for (let y = 0; y < countY; y++) {
			for (let x = 0; x < countX; x++) {
				if (count === totalCount) break;
				atlas.frames[`${prefix}_${count}`] = {
					frame: {
						x: x * tileW,
						y: y * tileY,
						w: tileW,
						h: tileY
					},
					rotate: false,
					trimmed: false,
					spriteSourceSize: {
						x: 0,
						y: 0,
						w: tileW,
						h: tileY
					},
					sourceSize: {
						w: tileW,
						h: tileY
					},
					pivot: {
						x: 0.5,
						y: 0.5
					}
				}
				count++;
			}
		}

		atlas.meta = {
			app: "http://www.DigitalVilla.com",
			version: "1.0",
			image: prefix + ".png",
			format: "RGBA8888",
			size: {
				"w": mapWidth,
				"h": mapHeight
			},
			scale: "1"
		}
		return JSON.stringify(atlas);
	}

	addStatePlayer() {
		let frameCounter = 0,
			numberOfFrames = 0,
			startFrame = 0,
			endFrame = 0,
			timerInterval = undefined,
			sprite = this.sprite;

		//The `show` function (to display static states)
		function show(frameNumber) {

			//Reset any possible previous animations
			reset();

			//Find the new state on the sprite
			sprite.gotoAndStop(frameNumber);
		}

		//The `stop` function stops the animation at the current frame
		function stopAnimation() {
			reset();
			sprite.gotoAndStop(sprite.currentFrame);
		}

		//The `playSequence` function, to play a sequence of frames
		function playAnimation(sequenceArray) {

			//Reset any possible previous animations
			reset();

			//Figure out how many frames there are in the range
			if (!sequenceArray) {
				startFrame = 0;
				endFrame = sprite.totalFrames - 1;
			} else {
				startFrame = sequenceArray[0];
				endFrame = sequenceArray[1];
			}

			//Calculate the number of frames
			numberOfFrames = endFrame - startFrame;

			//Compensate for two edge cases:
			//1. If the `startFrame` happens to be `0`
			/*
			if (startFrame === 0) {
			  numberOfFrames += 1;
			  frameCounter += 1;
			}
			*/

			//2. If only a two-frame sequence was provided
			/*
			if(numberOfFrames === 1) {
			  numberOfFrames = 2;
			  frameCounter += 1;
			}
			*/

			//Calculate the frame rate. Set the default fps to 12
			if (!sprite.fps) sprite.fps = 12;
			let frameRate = 1000 / sprite.fps;

			//Set the sprite to the starting frame
			sprite.gotoAndStop(startFrame);

			//Set the `frameCounter` to the first frame
			frameCounter = 1;

			//If the state isn't already `playing`, start it
			if (!sprite.animating) {
				timerInterval = setInterval(advanceFrame.bind(this), frameRate);
				sprite.animating = true;
			}
		}

		//`advanceFrame` is called by `setInterval` to display the next frame
		//in the sequence based on the `frameRate`. When the frame sequence
		//reaches the end, it will either stop or loop
		function advanceFrame() {

			//Advance the frame if `frameCounter` is less than
			//the state's total frames
			if (frameCounter < numberOfFrames + 1) {

				//Advance the frame
				sprite.gotoAndStop(sprite.currentFrame + 1);

				//Update the frame counter
				frameCounter += 1;

				//If we've reached the last frame and `loop`
				//is `true`, then start from the first frame again
			} else {
				if (sprite.loop) {
					sprite.gotoAndStop(startFrame);
					frameCounter = 1;
				}
			}
		}

		function reset() {

			//Reset `sprite.playing` to `false`, set the `frameCounter` to 0, //and clear the `timerInterval`
			if (timerInterval !== undefined && sprite.animating === true) {
				sprite.animating = false;
				frameCounter = 0;
				startFrame = 0;
				endFrame = 0;
				numberOfFrames = 0;
				clearInterval(timerInterval);
			}
		}

		//Add the `show`, `play`, `stop`, and `playSequence` methods to the sprite
		sprite.show = show;
		sprite.stopAnimation = stopAnimation;
		sprite.playAnimation = playAnimation;

		//set states

		return this;
	}

	setAnimationStates(states) {
		let sprite = this.sprite;
		if (states) {
			sprite.states = {};
			for (const key in states) {
				if (states.hasOwnProperty(key)) {
					sprite.states[key] = states[key];
				}
			}
		}
		return this;
	}

	setKeyBindings(keyTypes) {
		let binds = [],
			controls = {},
			defaultKeys = typeof keyTypes === 'string';

		if (defaultKeys && keyTypes === 'arrows') {
			binds = [{
				key: 'left',
				bind: 37
			}, {
				key: 'up',
				bind: 38
			}, {
				key: 'right',
				bind: 39
			}, {
				key: 'down',
				bind: 40
			}];
		} else if (defaultKeys && keyTypes === 'letters') {
			binds = [{
				key: 'left',
				bind: 65
			}, {
				key: 'up',
				bind: 87
			}, {
				key: 'right',
				bind: 68
			}, {
				key: 'down',
				bind: 83
			}];
		} else if (!defaultKeys) {
			binds = keyTypes;
		}
		this.sprite.key = {};

		for (let i = 0, len = binds.length; i < len; i++) {
			this.sprite.key[binds[i].key] = this.keyBinds(binds[i].bind);
		}
		return this;
	}

	//The contain helper function
	setCollision(container) {
		let sprite = this.sprite;


		//Create a set called `collision` to keep track of the
		//boundaries with which the sprite is colliding
		sprite.getCollision = function () {
			let collision = new Set();

			// X
			if (sprite.x < container.left) {
				sprite.x = container.left;
				collision.add("left");
			}

			// Y
			if (sprite.y < container.top) {
				sprite.y = container.top;
				collision.add("top");
			}

			// Width
			if (sprite.x + sprite.width > container.right) {
				sprite.x = container.right - sprite.width;
				collision.add("right");
			}

			// Height
			if (sprite.y + sprite.height > container.bottom) {
				sprite.y = container.bottom - sprite.height;
				collision.add("bottom");
			}

			//If there were no collisions, set `collision` to `undefined`
			if (collision.size === 0) collision = undefined;

			//Return the `collision` value
			return collision
		}
		return this;
	}

	sprite(sprite) {
		this.sprite = sprite;
		return this;
	}

	getSprite() {
		return this.sprite;
	}

	keyBinds(keyCode) {
		let key = {};
		key.code = keyCode;
		key.isDown = false;
		key.isUp = true;
		key.press = undefined;
		key.release = undefined;
		//The `downHandler`
		key.downHandler = event => {
			if (event.keyCode === key.code) {
				if (key.isUp && key.press) key.press();
				key.isDown = true;
				key.isUp = false;
			}
			event.preventDefault();
		};

		//The `upHandler`
		key.upHandler = event => {
			if (event.keyCode === key.code) {
				if (key.isDown && key.release) key.release();
				key.isDown = false;
				key.isUp = true;
			}
			event.preventDefault();
		};

		//Attach event listeners
		window.addEventListener(
			"keydown", key.downHandler.bind(key), false
		);
		window.addEventListener(
			"keyup", key.upHandler.bind(key), false
		);

		//Return the key object
		return key;
	}
}