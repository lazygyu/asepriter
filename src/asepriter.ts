import {AseJson, AsepriterEvent, Frame} from "./types";
import {Animation} from './animation';
import {SpriteCache} from "./sprite-cache";

export class Asepriter {
	private _loaded: boolean = false;
	private _sprites: HTMLCanvasElement[] = [];
	private _frames: Frame[] = [];
	private _image: HTMLImageElement;
	private _json: AseJson;
	private _handlers: {[key in AsepriterEvent]?: (() => void)[]} = {};
	private _animations: Map<string, Animation> = new Map();

	public get isLoaded() {
		return this._loaded;
	}

	constructor(json: AseJson, img: HTMLImageElement) {
		console.log('create Asepriter', json, img);
		this._json = json;
		this._image = img;

		setTimeout(() => {
			this._parseJson();
		});
	}

	private async _parseJson() {
		console.log('parse json');
		const json = this._json;
		const frames: Frame[] = [];
		if (!Array.isArray(json.frames)) {
			Object.keys(json.frames).map(frmKey => {
				const frm = (json.frames as {[key: string]: Frame})[frmKey] as Frame;
				frm.name = frmKey;
				frames.push(frm);
			});
		} else {
			frames.push(...json.frames);
		}

		this._frames = frames;
		this._loadFrames(frames);
		this._parseTags();
		this._emit('load');
		this._loaded = true;
	}

	private _loadFrames(frames: Frame[]) {
		console.log('load frames');
		this._sprites = frames.map((frm, idx) => { return this._parseFrame(frm, idx); });
	}

	private _parseFrame(frm: Frame, frameNumber: number) {
		const key = SpriteCache.getKey(this._json, this._image.src, frameNumber);
		if (SpriteCache.has(key)) {
			return SpriteCache.get(key)!;
		}
		const canv = document.createElement('canvas');
		canv.width = frm.frame.w;
		canv.height = frm.frame.h;
		const ctx = canv.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(this._image, frm.frame.x, frm.frame.y, frm.frame.w, frm.frame.h, 0, 0, frm.frame.w, frm.frame.h);
		SpriteCache.put(key, canv);
		return canv;
	}

	private _parseTags() {
		console.log('parse tags');
		const tags = this._json.meta.frameTags;
		tags.forEach(tag => { 
			this._animations.set(tag.name, new Animation(this, tag)); 
		});
	}

	public getFrame(frameNumber: number) {
		if (frameNumber < 0 || frameNumber >= this._frames.length) {
			throw new Error('Invalid frame number');
		}
		return { ...this._frames[frameNumber], image: this._sprites[frameNumber]};
	}

	public getAnimation(animationName: string): Animation {
		if (!this._animations.has(animationName)) {
			throw new Error('Invalid animation name: ' + animationName);
		}
		return this._animations.get(animationName)!;
	}

	get animationKeys() {
		return this._animations.keys();
	}


	static async create(jsonPath: string, imageUrl: string) {
		const [json, img] = await Promise.all([
			fetch(jsonPath).then(res => res.json()),
			this._loadImage(imageUrl)
		]);

		console.log(json);
		console.log(img);
		return new Asepriter(json, img);
	}

	private static async _loadImage(imageUrl: string): Promise<HTMLImageElement> {
		  return new Promise(rs => {
				const img = new Image();
				img.src = imageUrl;
				img.addEventListener('load', () => { rs(img); });
			});
	}

	public on(eventName: AsepriterEvent, handler: () => void) {
		if (!(eventName in this._handlers) || !this._handlers[eventName]) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName]!.push(handler);
		console.log(`add a handler to the event ${eventName}`);
	}

	private _emit(eventName: AsepriterEvent) {
		if (!this._handlers[eventName]) return;
		console.log(`emit ${eventName}`);
		this._handlers[eventName]?.forEach(handler => handler());
	}
}
