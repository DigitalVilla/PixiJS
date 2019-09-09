export default class FN {
    constructor(PIXI, options) {
        this.PIXI = PIXI;
        this.frame = this.frame.bind(this);
    }


    frame(source, width, height) {
        //Create the `tileset` sprite from the texture
        let texture = source.texture;

        return (xIndex, yIndex) => {
            let x = xIndex * width;
            let y = yIndex * height;
            //size of the sub-image you want to extract from the texture
            let rectangle = new this.PIXI.Rectangle(x, y, width, height);
            //Tell the texture to use that rectangular section
            texture.frame = rectangle;
            //Return the sprite from the texture
            return new this.PIXI.Sprite(texture);
        }
    }
}