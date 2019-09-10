import logger from "./logger";
let log = logger('FN: ');
export default class FN {
	constructor(PIXI) {
		log('constructor():', 2);
		this.PIXI = PIXI;
		this.animation = {
			testLog: document.getElementById('testLog'),
			testFrame: true,
			frameCount: 0
		};

		this.singleFrame = this.singleFrame.bind(this);
		this.textureAtlas = this.textureAtlas.bind(this);
		this.frameBatch = this.frameBatch.bind(this);
		this.startAnimation = this.startAnimation.bind(this);
		this.stopAnimation = this.stopAnimation.bind(this);
		this.animate = this.animate.bind(this);
	}

	singleFrame(texture, tileWidth, tileHeight, xIndex, yIndex) {
		log('singleFrame():', 2);
		let x = xIndex * tileWidth;
		let y = yIndex * tileHeight;
		//size of the sub-image you want to extract from the texture
		let rectangle = new this.PIXI.Rectangle(x, y, tileWidth, tileHeight);
		//Tell the texture to use that rectangular section
		texture.frame = rectangle;
		//Return the sprite from the texture
		return new this.PIXI.Sprite(texture);
	}

	frameBatch(options) {
		log('frameBatch():', 2);
		let textures = options.textures;
		// Name of this new batch
		let batchName = options.batchName || 'batchImage';
		// Get a selection of items
		let batch = options.batch;
		let prefix = batch && batch.textureKey;
		// Get unordered items
		let list = batch && batch.list;
		// Get order items
		let selection = batch && batch.selection;
		// batch container
		let sprites = {}
		sprites[batchName] = {}

		if (batch) {
			if (prefix && list && list.length) {
				for (let i = 0, len = list.length; i < len; i++) {
					let key = `${prefix}${list[i]}`;
					if (textures.hasOwnProperty(key)) {
						let batchKey = `${batchName.toLowerCase()}_${i}`;
						sprites[batchName][batchKey] = new this.PIXI.Sprite(textures[key]);
					}
				}
			} else if (prefix && selection && selection.length == 2) {
				let count = 0;
				for (let i = selection[0], len = selection[1]; i <= len; i++) {
					let key = `${prefix}${i}`;
					if (textures.hasOwnProperty(key)) {
						let batchKey = `${batchName.toLowerCase()}_${count++}`;
						sprites[batchName][batchKey] = new this.PIXI.Sprite(textures[key]);
					}
				}
			}
		} else {
			for (const key in textures) {
				if (textures.hasOwnProperty(key)) {
					sprites[batchName][key] = new this.PIXI.Sprite(textures[key]);
				}
			}
		}

		return sprites[batchName];
	}

	textureAtlas(prefix, mapWidth, mapHeight, countX, countY, totalCount) {
		log('textureAtlas():', 2);
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
					frame: { x: x * tileW, y: y * tileY, w: tileW, h: tileY },
					rotate: false,
					trimmed: false,
					spriteSourceSize: { x: 0, y: 0, w: tileW, h: tileY },
					sourceSize: { w: tileW, h: tileY },
					pivot: { x: 0.5, y: 0.5 }
				}
				count++;
			}
		}

		atlas.meta = {
			app: "http://www.DigitalVilla.com",
			version: "1.0",
			image: prefix + ".png",
			format: "RGBA8888",
			size: { "w": mapWidth, "h": mapHeight },
			scale: "1"
		}
		return atlas;
	}


	stopAnimation() {
		this.animation.stop = true;
	}

	startAnimation(fps, callback) {
		this.animation.callback = callback;
		this.animation.stop = false;
		this.animation.fps = fps;
		this.animation.fpsInterval = 1000 / fps;
		this.animation.then = Date.now();
		this.animation.startTime = this.animation.then;
		log(['startAnimating(): startTime', this.animation.startTime]);
		this.animate();
	}


	animate() {
		log('animate',3,true)
		const { fpsInterval, startTime, now, then, elapsed, stop, testFrame, testLog } = this.animation;
		if (stop) return;

		// request another frame
		requestAnimationFrame(this.animate);

		// calc elapsed time since last loop
		this.animation.now = Date.now();
		this.animation.elapsed = now - then;

		// if enough time has elapsed, draw the next frame
		if (elapsed > fpsInterval) {
			// Get ready for next frame by setting then=now, but...
			// Also, adjust for fpsInterval not being multiple of 16.67
			this.animation.then = now - (elapsed % fpsInterval);

			// draw stuff here
			this.animation.callback();

			if (testFrame) {
				// TESTING...Report #seconds since start and achieved fps.
				var sinceStart = now - startTime;
				var currentFps = Math.round(1000 / (sinceStart / ++this.animation.frameCount) * 100) / 100;
				testLog.innerText = "Elapsed time: " + Math.round(sinceStart / 1000 * 100) / 100 + " secs @ " + currentFps + " fps.";
			}

		}
	}
}