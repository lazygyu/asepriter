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

const enum AsepriterEvent {
	load = 'load',
};


export class Asepriter {
	private _loaded: boolean = false;
	private _sprites: HTMLCanvasElement[] = [];
	private _frames: Frame[] = [];
	private _image: HTMLImageElement;
	private _json: AseJson;
	private _handlers: {[key in AsepriterEvent]?: (() => {})[]} = {};

	public get isLoaded() {
		return this._loaded;
	}

	constructor(json: AseJson, img: HTMLImageElement) {
		this._json = json;
		this._image = img;

		this._parseJson();
	}

	private async _parseJson() {
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
		this._loaded = true;
		this._emit(AsepriterEvent.load);
	}

	private _loadFrames(frames: Frame[]) {
		this._sprites = frames.map(this._parseFrame);
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
		throw new Error("Method not implemented.");
	}


	static async create(jsonPath: string, imageUrl: string) {
		const [json, img] = await Promise.all([
			fetch(jsonPath).then(res => res.json()),
			this._loadImage(imageUrl)
		]);
		return new Asepriter(json, img);
	}

	private static async _loadImage(imageUrl: string): Promise<HTMLImageElement> {
		  return new Promise(rs => {
				const img = new Image();
				img.src = imageUrl;
				img.addEventListener('load', () => { rs(img); });
			});
	}

	public on(eventName: AsepriterEvent, handler: () => {}) {
		if (!(eventName in this._handlers) || !this._handlers[eventName]) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName]!.push(handler);
	}

	private _emit(eventName: AsepriterEvent) {
		if (!this._handlers[eventName]) return;
		this._handlers[eventName]?.forEach(handler => handler());
	}
}
