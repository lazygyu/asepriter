import { Asepriter } from '../src/index';

async function main() {
	const canv = document.querySelector('#exampleViewer') as HTMLCanvasElement;
	const ctx = canv.getContext('2d') as CanvasRenderingContext2D;

	const character = await Asepriter.create('assets/example.json', 'assets/example.png');
	let anims: string[] = [];
	character.on('load', () => {
		console.log('character loaded');
		anims = Array.from(character.animationKeys);
		anims.forEach((key) => {
			character.getAnimation(key).isLoop = true;
		});
	});

	let elapsed = 0;
	let lastTime = performance.now();
	let currentAnim = 0;

	const render = (timestamp: number) => {
		elapsed = timestamp - lastTime;
		lastTime = timestamp;

		if (character.isLoaded) {
			const animationName = anims[currentAnim];
			if (animationName) {
				const anim = character.getAnimation(animationName);
				if (anim) {
					anim.update(elapsed);
					ctx.clearRect(0, 0, canv.width, canv.height);
					ctx.drawImage(anim.currentFrame.image, 0, 0);
				}
			}
		} else {
			loading();
		}
		requestAnimationFrame(render);
	}

	const loading = () => {
		ctx.clearRect(0, 0, canv.width, canv.height);
		ctx.fillText('loading...', 0, canv.height - 10);
	}

	window.addEventListener('keydown', (e) => {
		if (e.key=== ' ') {
			currentAnim = (currentAnim + 1) % anims.length;
			const anim = character.getAnimation(anims[currentAnim]);
			anim?.reset();
		}
	});

	render(0);
}

document.addEventListener('DOMContentLoaded', () => {
	main();
});
