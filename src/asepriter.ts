type AseJson = {
	frames: { [key: string]: Frame} | Frame[],
	meta: {
		app: string,
		version: string,
		image: string,
		format: string,
		size: Size,
		scale: string,
		frameTags: TagDefinition[],
		layers: LayerDefinition[],
		slices: SliceDefinition[],
	}
}

type Pos = { x: number, y: number };
type Size = { w: number, h: number };

type Rect = Pos & Size;

type Frame = {
	name: string | undefined,
	frame: Rect,
	roteted: boolean,
	trimmed: boolean,
	spriteSourceSize: Rect,
	sourceSize: Size,
	duration: number,
};

type TagDefinition = {
	name: string,
	from: number,
	to: number,
	direction: 'forward' | 'backward',
};

type LayerDefinition = {
	name: string,
	opacity: number,
	blendMode: string,
};

type SliceDefinition = {
};

type AsepriterEvent = 'load';
class Animation {
	private _elapsed: number = 0;
	private _done: boolean = false;
	public isLoop: boolean = false;
	private _frameNumber: number = 0;
	private _frames: (Frame & { image: CanvasImageSource })[] = [];

	get isDone() {
		return this._done;
	}

	get currentFrame() {
		return this._frames[this._frameNumber];
	}

	constructor(private _parent: Asepriter, data: TagDefinition) {
		this._parseData(data);
	}

	private _parseData(data: TagDefinition) {
		for(let i = data.from; i <= data.to; i++) {
			const frm = this._parent.getFrame(i);
			this._frames.push(frm);
		}
		if (data.direction !== 'forward') {
			this.isLoop = true;
		}
	}

	update(deltaTime: number) {
		if (this._done) {
			return;
		}

		this._elapsed += deltaTime;
		let t = this._elapsed, frame = 0;

		while(t > 0) {
			t -= this._frames[frame].duration;
			if ( t > 0 ) {
				frame = (frame + 1) % this._frames.length;
			}
			if (!this.isLoop && frame >= this._frames.length - 1) {
				this._done = true;
				break;
			}
		}
		
		this._frameNumber = frame;
	}

	reset() {
		this._elapsed = 0;
		this._frameNumber = 0;
		this._done = false;
	}
}


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
		this._sprites = frames.map((frm) => { return this._parseFrame(frm); });
	}

	private _parseFrame(frm: Frame) {
		const canv = document.createElement('canvas');
		canv.width = frm.frame.w;
		canv.height = frm.frame.h;
		const ctx = canv.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(this._image, frm.frame.x, frm.frame.y, frm.frame.w, frm.frame.h, 0, 0, frm.frame.w, frm.frame.h);
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
