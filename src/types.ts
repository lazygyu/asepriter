export type AseJson = {
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

export type Pos = { x: number, y: number };
export type Size = { w: number, h: number };

export type Rect = Pos & Size;

export type Frame = {
	name: string | undefined,
	frame: Rect,
	roteted: boolean,
	trimmed: boolean,
	spriteSourceSize: Rect,
	sourceSize: Size,
	duration: number,
};

export type TagDefinition = {
	name: string,
	from: number,
	to: number,
	direction: 'forward' | 'backward',
};

export type LayerDefinition = {
	name: string,
	opacity: number,
	blendMode: string,
};

export type SliceDefinition = {
};

export type AsepriterEvent = 'load';
