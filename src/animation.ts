import type {Asepriter} from "./asepriter";
import {Frame, TagDefinition} from "./types";

type AnimationEvent = 'done';

export class Animation {
	private _elapsed: number = 0;
	private _done: boolean = false;
	public isLoop: boolean = false;
	private _frameNumber: number = 0;
	private _frames: (Frame & { image: CanvasImageSource })[] = [];
	private _handlers: { [key in AnimationEvent]?: (() => void)[] } = {};

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
				this._emit('done');
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

	public on(eventName: AnimationEvent, handler: () => void) {
		if (!this._handlers[eventName]) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName]!.push(handler);
	}

	private _emit(eventName: AnimationEvent) {
		if (this._handlers[eventName]) {
			this._handlers[eventName]!.forEach(handler => handler());
		}
	}
}
