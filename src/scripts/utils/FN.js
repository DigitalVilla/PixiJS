import logger from "./logger";
let log = logger('Animate: ');

var args = [
	("\n %c %c %c Animate " + 1.2 + " - ✰ " + 'Omar Villanueva' + " ✰  %c  %c  http://www.DigitalVilla.co/  %cs \n\n"),
	'background: #0066a5; padding:5px 0;',
	'background: #0066a5; padding:5px 0;',
	'color: #55c3dc; background: #030307; padding:5px 0;',
	'background: #0066a5; padding:5px 0;',
	'background: #aaaabf; padding:5px 0;',
	'background: #0066a5; padding:5px 0;'
];


export default class Animate {
	constructor(options) {
		// console.log.apply(console, args);
		this.stage = options.stage;
		this.engine = options.engine;
		this.renderer = options.renderer;
		this.animation = {
			testLog: document.getElementById('testLog'),
			testFrame: true,
			frameCount: 0,
			properties: {}
		};

		this.animate = this.animate.bind(this);
	}

	randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
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
		let isAnimation = options.isAnimation;
		let addStatePlayer = options.addStatePlayer;
		let states = options.setStates;
		let between = options.between || 1;
		let textures = options.textures;
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
			if (isAnimation) {
				for (let i = 0; i < between; i++) {
					spritesArr.push(texture);
				}
			} else {
				spritesArr.push(new this.engine.Sprite(texture));
			}
			if (baseTexture) {
				spritesArr[i].baseTexture.scaleMode = this.engine.SCALE_MODES.NEAREST;
			}
			if (!isAnimation && batch.forEach) {
				batch.forEach(spritesArr[i], i);
			}
			count++;
		};

		if (batch) {
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

		spritesArr = isAnimation ? new this.engine.AnimatedSprite(spritesArr) : spritesArr;
		return addStatePlayer ? this.addStatePlayer(spritesArr, states) : spritesArr;
	}

	addStatePlayer(sprite, states) {
		let frameCounter = 0,
			numberOfFrames = 0,
			startFrame = 0,
			endFrame = 0,
			timerInterval = undefined;

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
		if (states) {
			sprite.states = {};
			for (const key in states) {
				if (states.hasOwnProperty(key)) {
					sprite.states[key] = states[key];
				}
			}
		}
		return sprite
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

	pauseAnimation() {
		this.animation.pause = !this.animation.pause;
	}

	startAnimation(options) {
		let start = performance.timing.navigationStart + performance.now();
		this.animation.fpsInterval = 1000 / options.logicFps;
		this.animation.update = options.update;
		this.animation.fps = options.logicFps;
		this.animation.startTime = start;
		this.animation.lag = 0;
		this.animation.interpolate = true;
		this.animation.pause = false;

		// Reneder clamping
		this.animation.renderStartTime = 0;
		this.animation.renderFps = options.renderFps;
		this.animation.renderDuration = 1000 / options.renderFps;

		this.animation.properties.position = true;
		this.animation.properties.rotation = true;
		this.animation.properties.alpha = true;
		this.animation.properties.scale = true;
		this.animation.properties.size = true;
		this.animation.properties.tile = true;
		this.animate();
	}

	animate(timestamp) {
		requestAnimationFrame(this.animate.bind(this));
		if (!this.animation.pause) {
			// log('ANIMATE', 3, true)
			//If the `fps` hasn't been defined, call the user-defined update
			//function and render the sprites at the maximum rate the
			//system is capable of
			if (this.animation.fps === undefined) {
				//Run the user-defined game logic function each frame of the
				//game at the maxium frame rate your system is capable of
				this.animation.update();
				this.renderer.render(this.stage);
			} else if (!this.animation.renderFps) {
				this.interpolate();
			} else {
				//Implement optional frame rate rendering clamping
				if (timestamp >= this.animation.renderStartTime) {

					//Update the current logic frame and render with
					//interpolation
					this.interpolate();

					//Reset the frame render start time
					this.animation.renderStartTime = timestamp + this.animation.renderDuration;
				}
			}
		}
	}

	//The `interpolate` function updates the logic function at the
	//same rate as the user-defined fps, renders the sprites, with
	//interpolation, at the maximum frame rate the system is capable
	//of
	interpolate() {
		//Calculate the time that has elapsed since the last frame
		let current = performance.timing.navigationStart + performance.now(), //Date.now()
			elapsed = current - this.animation.startTime;

		//Catch any unexpectedly large frame rate spikes
		if (elapsed > 1000) elapsed = this.animation.fpsInterval;

		//For interpolation:
		this.animation.startTime = current;

		//Add the elapsed time to the lag counter
		this.animation.lag += elapsed;

		//Update the frame if the lag counter is greater than or
		//equal to the frame duration
		while (this.animation.lag >= this.animation.fpsInterval) {
			//Capture the sprites' previous properties for rendering
			//interpolation
			this.getLaggingFrames();

			//Update the logic in the user-defined update function
			this.animation.update();

			//Reduce the lag counter by the frame duration
			this.animation.lag -= this.animation.fpsInterval;

		}
		//Calculate the lag offset and use it to render the sprites
		this.animation.lagOffset = this.animation.lag / this.animation.fpsInterval;
		this.render(this.animation.lagOffset);
		// this.renderer.render(this.stage);
	}

	//`capturePreviousSpritePositions`
	//This function is run in the game loop just before the logic update
	//to store all the sprites' previous positions from the last frame.
	//It allows the render function to interpolate the sprite positions
	//for ultra-smooth sprite rendering at any frame rate
	getLaggingFrames() {
		let self = this;
		//A function that capture's the sprites properties
		var setProperties = function setProperties(sprite) {
			if (self.animation.properties.position) {
				sprite._previousX = sprite.x;
				sprite._previousY = sprite.y;
			}
			if (self.animation.properties.rotation) {
				sprite._previousRotation = sprite.rotation;
			}
			if (self.animation.properties.size) {
				sprite._previousWidth = sprite.width;
				sprite._previousHeight = sprite.height;
			}
			if (self.animation.properties.scale) {
				sprite._previousScaleX = sprite.scale.x;
				sprite._previousScaleY = sprite.scale.y;
			}
			if (self.animation.properties.alpha) {
				sprite._previousAlpha = sprite.alpha;
			}
			if (self.animation.properties.tile) {
				if (sprite.tilePosition !== undefined) {
					sprite._previousTilePositionX = sprite.tilePosition.x;
					sprite._previousTilePositionY = sprite.tilePosition.y;
				}
				if (sprite.tileScale !== undefined) {
					sprite._previousTileScaleX = sprite.tileScale.x;
					sprite._previousTileScaleY = sprite.tileScale.y;
				}
			}

			if (sprite.children && sprite.children.length > 0) {
				for (var i = 0, len = sprite.children.length; i < len; i++) {
					var child = sprite.children[i];
					setProperties(child);
				}
			}
		};

		//loop through the all the sprites and capture their properties
		for (var i = 0, len = this.stage.children.length; i < len; i++) {
			var sprite = this.stage.children[i];
			setProperties(sprite);
		}
	}

	//Smoothie's `render` method will interpolate the sprite positions and
	//rotation for
	//ultra-smooth animation, if Hexi's `interpolate` property is `true`
	//(it is by default)

	render() {
		var lagOffset = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

		//Calculate the sprites' interpolated render positions if
		//`this.interpolate` is `true` (It is true by default)

		if (this.animation.interpolate) {
			(function (self) {

				//A recursive function that does the work of figuring out the
				//interpolated positions
				var interpolateSprite = function interpolateSprite(sprite) {

					//Position (`x` and `y` properties)
					if (self.animation.properties.position) {

						//Capture the sprite's current x and y positions
						sprite._currentX = sprite.x;
						sprite._currentY = sprite.y;

						//Figure out its interpolated positions
						if (sprite._previousX !== undefined) {
							sprite.x = (sprite.x - sprite._previousX) * lagOffset + sprite._previousX;
						}
						if (sprite._previousY !== undefined) {
							sprite.y = (sprite.y - sprite._previousY) * lagOffset + sprite._previousY;
						}
					}

					//Rotation (`rotation` property)
					if (self.animation.properties.rotation) {

						//Capture the sprite's current rotation
						sprite._currentRotation = sprite.rotation;

						//Figure out its interpolated rotation
						if (sprite._previousRotation !== undefined) {
							sprite.rotation = (sprite.rotation - sprite._previousRotation) * lagOffset + sprite._previousRotation;
						}
					}

					//Size (`width` and `height` properties)
					if (self.animation.properties.size) {

						//Only allow this for Sprites or MovieClips. Because
						//Containers vary in size when the sprites they contain
						//move, the interpolation will cause them to scale erraticly
						if (sprite instanceof self.engine.Sprite || sprite instanceof self.engine.extras.MovieClip) {

							//Capture the sprite's current size
							sprite._currentWidth = sprite.width;
							sprite._currentHeight = sprite.height;

							//Figure out the sprite's interpolated size
							if (sprite._previousWidth !== undefined) {
								sprite.width = (sprite.width - sprite._previousWidth) * lagOffset + sprite._previousWidth;
							}
							if (sprite._previousHeight !== undefined) {
								sprite.height = (sprite.height - sprite._previousHeight) * lagOffset + sprite._previousHeight;
							}
						}
					}

					//Scale (`scale.x` and `scale.y` properties)
					if (self.animation.properties.scale) {

						//Capture the sprite's current scale
						sprite._currentScaleX = sprite.scale.x;
						sprite._currentScaleY = sprite.scale.y;

						//Figure out the sprite's interpolated scale
						if (sprite._previousScaleX !== undefined) {
							sprite.scale.x = (sprite.scale.x - sprite._previousScaleX) * lagOffset + sprite._previousScaleX;
						}
						if (sprite._previousScaleY !== undefined) {
							sprite.scale.y = (sprite.scale.y - sprite._previousScaleY) * lagOffset + sprite._previousScaleY;
						}
					}

					//Alpha (`alpha` property)
					if (self.animation.properties.alpha) {

						//Capture the sprite's current alpha
						sprite._currentAlpha = sprite.alpha;

						//Figure out its interpolated alpha
						if (sprite._previousAlpha !== undefined) {
							sprite.alpha = (sprite.alpha - sprite._previousAlpha) * lagOffset + sprite._previousAlpha;
						}
					}

					//Tiling sprite properties (`tileposition` and `tileScale` x
					//and y values)
					if (self.animation.properties.tile) {

						//`tilePosition.x` and `tilePosition.y`
						if (sprite.tilePosition !== undefined) {

							//Capture the sprite's current tile x and y positions
							sprite._currentTilePositionX = sprite.tilePosition.x;
							sprite._currentTilePositionY = sprite.tilePosition.y;

							//Figure out its interpolated positions
							if (sprite._previousTilePositionX !== undefined) {
								sprite.tilePosition.x = (sprite.tilePosition.x - sprite._previousTilePositionX) * lagOffset + sprite._previousTilePositionX;
							}
							if (sprite._previousTilePositionY !== undefined) {
								sprite.tilePosition.y = (sprite.tilePosition.y - sprite._previousTilePositionY) * lagOffset + sprite._previousTilePositionY;
							}
						}

						//`tileScale.x` and `tileScale.y`
						if (sprite.tileScale !== undefined) {

							//Capture the sprite's current tile scale
							sprite._currentTileScaleX = sprite.tileScale.x;
							sprite._currentTileScaleY = sprite.tileScale.y;

							//Figure out the sprite's interpolated scale
							if (sprite._previousTileScaleX !== undefined) {
								sprite.tileScale.x = (sprite.tileScale.x - sprite._previousTileScaleX) * lagOffset + sprite._previousTileScaleX;
							}
							if (sprite._previousTileScaleY !== undefined) {
								sprite.tileScale.y = (sprite.tileScale.y - sprite._previousTileScaleY) * lagOffset + sprite._previousTileScaleY;
							}
						}
					}

					//Interpolate the sprite's children, if it has any
					if (sprite.children.length !== 0) {
						for (var j = 0; j < sprite.children.length; j++) {

							//Find the sprite's child
							var child = sprite.children[j];

							//display the child
							interpolateSprite(child);
						}
					}
				};

				//loop through the all the sprites and interpolate them
				for (var i = 0; i < self.stage.children.length; i++) {
					var sprite = self.stage.children[i];
					interpolateSprite(sprite);
				}
			})(this);
		}

		//Render the stage. If the sprite positions have been
		//interpolated, those position values will be used to render the
		//sprite
		this.renderer.render(this.stage);

		//Restore the sprites' original x and y values if they've been
		//interpolated for this frame
		if (this.animation.interpolate) {
			(function (self) {

				//A recursive function that restores the sprite's original,
				//uninterpolated x and y positions
				var restoreSpriteProperties = function restoreSpriteProperties(sprite) {
					if (self.animation.properties.position) {
						sprite.x = sprite._currentX;
						sprite.y = sprite._currentY;
					}
					if (self.animation.properties.rotation) {
						sprite.rotation = sprite._currentRotation;
					}
					if (self.animation.properties.size) {

						//Only allow this for Sprites or Movie clips, to prevent
						//Container scaling bug
						if (sprite instanceof self.engine.Sprite || sprite instanceof self.engine.extras.MovieClip) {
							sprite.width = sprite._currentWidth;
							sprite.height = sprite._currentHeight;
						}
					}
					if (self.animation.properties.scale) {
						sprite.scale.x = sprite._currentScaleX;
						sprite.scale.y = sprite._currentScaleY;
					}
					if (self.animation.properties.alpha) {
						sprite.alpha = sprite._currentAlpha;
					}
					if (self.animation.properties.tile) {
						if (sprite.tilePosition !== undefined) {
							sprite.tilePosition.x = sprite._currentTilePositionX;
							sprite.tilePosition.y = sprite._currentTilePositionY;
						}
						if (sprite.tileScale !== undefined) {
							sprite.tileScale.x = sprite._currentTileScaleX;
							sprite.tileScale.y = sprite._currentTileScaleY;
						}
					}

					//Restore the sprite's children, if it has any
					if (sprite.children.length !== 0) {
						for (var i = 0; i < sprite.children.length; i++) {

							//Find the sprite's child
							var child = sprite.children[i];

							//Restore the child sprite properties
							restoreSpriteProperties(child);
						}
					}
				};
				for (var i = 0; i < self.stage.children.length; i++) {
					var sprite = self.stage.children[i];
					restoreSpriteProperties(sprite);
				}
			})(this);
		}
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

	keyBinding(defaultKeys) {
		let binds = [],
			controls = {};
		if (defaultKeys.arrows) {
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
		} else {
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
		}

		for (let i = 0, len = binds.length; i < len; i++) {
			controls[binds[i].key] = this.keyBinds(binds[i].bind);
		}
		return controls
	}

	//The contain helper function
	setCollision(sprite, container) {

		//Create a set called `collision` to keep track of the
		//boundaries with which the sprite is colliding
		return function () {
			var collision = new Set();

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
			return collision;
		}
	}
}