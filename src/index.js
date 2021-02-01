import TweenManager from './TweenManager';
import Tween from './Tween';
import TweenPath from './TweenPath';
import Easing from './Easing';

// extend pixi graphics to draw tweenPaths
// PIXI.Graphics.prototype.drawPath = function drawPath(path) {
// 	path.parsePoints();
// 	this.drawShape(path.polygon);

// 	return this;
// };

/**
 * @namespace PIXI.tween
 */
const tween = {
	TweenManager,
	Tween,
	Easing,
	TweenPath,
};

// if (!PIXI.tweenManager) {
// 	PIXI.tweenManager = new TweenManager();

// 	PIXI.tween = tween;
// }

export default tween;

export { TweenManager };
export { Tween };
export { TweenPath };
export { Easing };