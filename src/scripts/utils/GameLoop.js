
	export default class GameLoop {
		constructor(engine,options) {
			this.engine = engine.engine;
			this.stage = engine.stage;
			this.renderer = engine.renderer;

			let start = performance.timing.navigationStart + performance.now();
			this.animation = {};
			this.animation.fpsInterval = 1000 / options.logicFps;
			this.animation.update = options.update;
			this.animation.fps = options.logicFps;
			this.animation.startTime = start;
			this.animation.lag = 0;
			this.animation.interpolate = true;
			this.animation.pause = false;
			this.animation.frameCount = 0;

			// Reneder clamping
			this.animation.renderStartTime = 0;
			this.animation.renderFps = options.renderFps;
			this.animation.renderDuration = 1000 / options.renderFps;

			this.animation.properties = {};
			this.animation.properties.position = true;
			this.animation.properties.rotation = true;
			this.animation.properties.alpha = true;
			this.animation.properties.scale = true;
			this.animation.properties.size = true;
			this.animation.properties.tile = true;

			this.animate = this.animate.bind(this);
		}

		pauseAnimation() {
			this.animation.pause = true
		}

		playAnimation(options) {
			this.animation.pause = false;
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
	}