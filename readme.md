# Summary

A library for loading and rendering animations exported by Aseprite.

# Install

```shell
> yarn add asepriter
```

# Usage

## Simple Usage

```typescript
import { Asepriter } from "asepriter";

const jsonUrl = '/assets/animation.json';
const imageUrl = '/assets/animation.png';

(async () => {
	const canvas = document.querySelector('#canv') as HTMLCanvasElement;
	const instance = await Asepriter.create(jsonUrl, imageUrl);

	let lastTimestamp = performance.now();
	let deltaTime = 0;

	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	const render = (timestamp: number) => {

		deltaTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		const animation = instance.getAnimation(instance.animationKeys[0]);
		animation.update(deltaTime);

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(animation.currentFrame.image, 0, 0);

		requestAnimationFrame(render);
	}

	instance.on('load', () => {
			render(performance.now());
	});
})();
```

## Other Usage

See `example/index.ts`

# Development

## check example code

```shell
> yarn dev
```

# Todos

* [x] load the json and the image file
	* [x] parse the json data
	* [x] get frames and create separated images
	* [x] load tags into animations
* [x] draw a sprite
	* [x] get a specific sprite
* [x] draw an animation
	* [x] get an animation by a tag name
	* [x] update the frame number of the animation by time
	* [x] get the current sprite of the animation
* [x] clone an Asepriter instance.
* [x] share sprite images among animations that have the same data
* [x] emit 'done' event when an animation has ended
* [ ] build script
