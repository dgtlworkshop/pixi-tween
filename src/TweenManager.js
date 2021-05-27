import Tween from './Tween';

/**
 * Tween manager class, that handles updating child Tweens
 *
 * @class
 * @memberof PIXI.tween
 */
export default class TweenManager {
	/** */
	constructor() {
		/**
		 * @member {Array.<PIXI.tween.Tween>} - The array of tweens being manager
		 * @type {Array<Tween>}
		 */
		this.tweens = [];

		/**
		 * @member {Array<PIXI.tween.Tween>} - The array of tweens to remove at the end of the next update
		 * @type {Array<Tween>}
		*/
		this._tweensToRemove = [];

		this._lastTime = 0;
	}

	/**
	 * Updating of the tween manager, which will in turn update any active tweens
	 *
	 * @param {number} [deltaMS] - If not provided, an internal deltaMS will be calculated
	 */
	update(deltaMS) {
		if (!deltaMS && deltaMS !== 0) {
			deltaMS = this._getDeltaMS();
		}

		for (let i = 0; i < this.tweens.length; ++i) {
			const tween = this.tweens[i];

			if (tween.active && !tween.target._destroyed) {
				tween.update(deltaMS);
			} else {
				this._tweensToRemove.push(tween);
			}
		}

		if (this._tweensToRemove.length) {
			for (let i = 0; i < this._tweensToRemove.length; ++i) {
				const tweenToRemove = this._tweensToRemove[i];

				if (!tweenToRemove.active) {
					this._remove(tweenToRemove);
				} else if (tweenToRemove.target?._destroyed) {
					// check to verify the tween hasn't been destroyed
					// target._destroyed can be undefined if the object isn't a PIXI.DisplayObject
					tweenToRemove._end(false);
					this._remove(tweenToRemove);
				}
			}
			this._tweensToRemove.length = 0;
		}
	}

	/**
	 * Returns an array with all the tweens for the given target.
	 *
	 * @param {any} target - The target object to check for tweens
	 * @returns {Array.<PIXI.tween.Tween>} - Tweens attached to the given target
	 */
	getTweensForTarget(target) {
		const tweens = [];

		for (let i = 0; i < this.tweens.length; ++i) {
			if (this.tweens[i].target === target) {
				tweens.push(this.tweens[i]);
			}
		}

		return tweens;
	}

	/**
	 * Returns a new tween instance that is managed by this tween manager.
	 *
	 * @param {any} target - The target object to add a tween to
	 * @param {PIXI.tween.Tween#tweenConfig} [config] - object to configure the tween
	 * @returns {PIXI.tween.Tween} - New tween instance
	 */
	createTween(target, config) {
		return new Tween(target, this, config);
	}

	/**
	 * Normally you want to use .createTween(target) to create a tween, but, you can also create a tween
	 * with new PIXI.Tween(target) and add it in the manager with this method.
	 *
	 * @param {PIXI.tween.Tween} tween - Tween to add
	 */
	addTween(tween) {
		if (tween) {
			const index = this.tweens.indexOf(tween);

			if (index === -1) {
				tween.manager = this;
				this.tweens.push(tween);
			}
		}
	}

	/**
	 * Removes a tween from being managed by this instance
	 *
	 * @param {PIXI.tween.Tween} tween - Tween to remove
	 */
	removeTween(tween) {
		if (tween) {
			const index = this.tweens.indexOf(tween);

			if (index !== -1) {
				this._tweensToRemove.push(tween);
			}
		}
	}

	/**
	 * Delets the tween from the array of managed tweens
	 *
	 * @param {PIXI.tween.Tween} tween - Tween to remove
	 * @private
	 */
	_remove(tween) {
		const index = this.tweens.indexOf(tween);

		if (index !== -1) {
			this.tweens.splice(index, 1);
		}
	}

	/**
	 * How much time has passed since the last update
	 *
	 * @returns {number} - How much time in ms has passed since update was last called
	 * @private
	 */
	_getDeltaMS() {
		if (this._lastTime === 0) {
			this._lastTime = Date.now();
		}
		const time = Date.now();
		const deltaMS = time - this._lastTime;

		this._lastTime = time;

		return deltaMS;
	}
}
