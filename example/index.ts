import { Asepriter } from '../src/index';

async function main() {
	const canv = document.querySelector('#exampleViewer') as HTMLCanvasElement;
	const ctx = canv.getContext('2d') as CanvasRenderingContext2D;

	const character = await Asepriter.create('assets/example.json', 'assets/example.png');
	let character2: Asepriter | null = null;
	let animation2 = 0;

	let anims: string[] = [];
	character.on('load', () => {
		console.log('character loaded');
		character2 = character.clone();
		character2.on('load', () => {
			console.log('character 2 loaded');
			const anims2 = Array.from(character2!.animationKeys);
			anims2.forEach(animName => {
				const anim = character2?.getAnimation(animName);
				if (anim) {
					anim.on('done', () => {
						animation2 = (animation2 + 1) % 3;
						character2?.getAnimation(anims[animation2]).reset();
					});
				}
			});	
		});
		anims = Array.from(character.animationKeys);
		anims.forEach(anim => {
			character.getAnimation(anim).isLoop = true;
		});
	});

	let elapsed = 0;
	let lastTime = performance.now();
	let currentAnim = 1;

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
			if (character2 !== null && character2.isLoaded) {
				ctx.save();
				const anim = character2.getAnimation(anims[animation2]);
				anim.update(elapsed);
				ctx.translate(40, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(anim.currentFrame.image, 0, 0);
				ctx.restore();
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
