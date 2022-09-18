import {AseJson} from "./types";

function simpleHash(str: string) {
	let h = 0, highorder = 0;
	for(let i = 0, l = str.length; i < l; i++) {
		highorder = h & 0xf8000000;
		h <<= 5;
		h = h ^ (highorder >> 27);
		h ^= str.charCodeAt(i);
	}
	return h.toString(16);
}

export class SpriteCache {
	private static _cache: Map<string, HTMLCanvasElement> = new Map();

	static getKey(json: AseJson, imageSrc: string, frameNumber: number): string {
		const src = [JSON.stringify(json), imageSrc, frameNumber].join('_-_-');
		return simpleHash(src);
	}

	static has(key: string): boolean {
		return this._cache.has(key);
	}

	static get(key: string): HTMLCanvasElement | undefined {
		return this._cache.get(key);
	}

	static put(key: string, canv: HTMLCanvasElement) {
		return this._cache.set(key, canv);
	}
}
