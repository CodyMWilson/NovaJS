import { FrameInfo } from "nova_data_interface/SpriteSheetData";
import * as PIXI from "pixi.js";

export function texturesFromFrames(frames: { [index: string]: FrameInfo }) {
    const allTextures: PIXI.Texture[] = [];
    const frameNames = Object.keys(frames);
    for (let frameIndex = 0; frameIndex < frameNames.length; frameIndex++) {
        let frameName = frameNames[frameIndex];
        // PIXI itself requests the texture image from the server.
        allTextures[frameIndex] = PIXI.Texture.from(frameName);
    }
    return allTextures;
}
