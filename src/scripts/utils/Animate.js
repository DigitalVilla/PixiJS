import GameLoop from "./GameLoop";
import SpriteX from "./SpriteX";

import Utils from "./Utils";
import Bump from "./bump";

var args = [
	("\n %c %c %c Animate " + 1.2 + " - ✰ " + 'Omar Villanueva' + " ✰  %c  %c  http://www.DigitalVilla.co/  %cs \n\n"),
	'background: #0066a5; padding:5px 0;',
	'background: #0066a5; padding:5px 0;',
	'color: #55c3dc; background: #030307; padding:5px 0;',
	'background: #0066a5; padding:5px 0;',
	'background: #aaaabf; padding:5px 0;',
	'background: #0066a5; padding:5px 0;'
];

console.log.apply(console, args);

export default class Animate {
	constructor(options) {
		this.engine = options.PIXI;
		this.stage = options.stage;
		this.renderer = options.renderer;
		this.GameLoop = null;
		this.SpriteX = null;
	}

	loop(options) {
		if (!this.GameLoop) {
			return this.GameLoop = new GameLoop({
				stage: this.stage,
				engine: this.engine,
				renderer: this.renderer
			}, options)
		} else {
			return this.GameLoop
		}
	}

	spritex() {
		if (!this.SpriteX) {
			return this.SpriteX = new SpriteX(this.engine);
		} else {
			return this.SpriteX;
		}
	}
}