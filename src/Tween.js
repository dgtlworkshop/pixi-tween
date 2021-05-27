import { utils } from 'pixi.js';
import Easing from './Easing';

/**
 * Fired when the tween starts. If the tween has a delay, this event fires when the delay time is ended.
 *
 * @event PIXI.tween.Tween#start
 */

/**
 * Fired when the tween is over. If the .loop option it's true, this event never will be fired.
 * If the tween has an .repeat number, this event will be fired just when all the repeats are done.
 *
 * @event PIXI.tween.Tween#end
 */

/**
 * Fired at every repeat cycle, if your tween has .repeat=5 this events will be fired 5 times.
 *
 * @event PIXI.tween.Tween#repeat
 * @param {number} repeat - Number of times this tween has repeated
 */

/**
 * Fired at each frame
 *
 * @event PIXI.tween.Tween#update
 * @param {number} progress - 0-1 decimal value representing proportion of completion.
 * @param {number} elapsedTime - How much time in ms that has passed since the tween started.
 */

/**
 * Fired only when it's used the .stop() method. It's useful to know when a timer is cancelled.
 *
 * @event PIXI.tween.Tween#stop
 */

/**
 * If the pingPong option it's true, this events will be fired when the tweens returns back.
 *
 * @event PIXI.tween.Tween#pingpong
 */

/**
 * Quickly configure a tween via an object / json
 *
 * @typedef {Object} PIXI.tween.Tween#tweenConfig
 * @property {Object} [from]
 * @property {Object} [to]
 * @property {number} [delay]
 * @property {function|string} [easing]
 * @property {boolean} [loop]
 * @property {Object} [path]
 * @property {boolean} [pathReverse]
 * @property {boolean} [pingPong]
 * @property {number} [repeat]
 * @property {number} [time]
 * @property {number} [speed]
 * @property {Object} [on]
 * @property {function} [on.end]
 * @property {function} [on.pingpong]
 * @property {function} [on.repeat]
 * @property {function} [on.start]
 * @property {function} [on.stop]
 * @property {function} [on.update]
 */

/**
 * Tween class
 *
 * @class
 * @memberof PIXI.tween
 */
export default class Tween extends utils.EventEmitter {
	/**
	 * @param {*} target - Target object to tween
	 * @param {PIXI.tween.TweenManager} [manager] - Tween manager to handle this tween
	 * @param {PIXI.tween.Tween#tweenConfig} [config] - object to configure the tween
	 */
	constructor(target, manager, config) {
		super();

		this.target = target;
		if (manager) {
			this.manager = manager;
		}

		this.clear();

		if (config) {
			this.config(config);
		}
	}

	/**
	 * Clears all class data, meaning that the tween will now do nothing if start is called
	 *
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	clear() {
		/** @member {PIXI.tween.Easing} - Either an easing function from PIXI.tween.Easing or a custom easing */
		this.easing = Easing.linear();

		/** @member {number} - Times to repeat this tween */
		this.repeat = 0;

		/** @member {boolean} - Set true if you want to loop this tween forever */
		this.loop = false;

		/** @member {number} - Set a delay time in milliseconds before the tween starts */
		this.delay = 0;

		/** @member {boolean} - Set true to repeat the tween from the end point back to the start point */
		this.pingPong = false;

		/** @member {PIXI.tween.TweenPath} - Set an instance of TweenPath to animate an object along the path */
		this.path = null;

		/** @member {boolean} - Set true to reverse the direction along the path */
		this.pathReverse = false;

		/** @member {number} - How long to animate this tween over */
		this.time = 0;

		/** @member {number} - The speed that the tween will play at. 0 effectively pauses it, 1 is normal speed */
		this.speed = 1;

		this._active = false;
		this._isStarted = false;
		this._isEnded = false;

		this._to = {};
		this._from = {};
		this._resetFromOnStart = false;
		this._delayTime = 0;
		this._elapsedTime = 0;
		this._progress = 0;
		this._repeat = 0;
		this._pingPong = false;

		this._pathFrom = 0;
		this._pathTo = 0;

		this._chainTween = null;
		this._resolvePromise = null;

		return this;
	}

	/**
	 * Configures the tween via a config object
	 *
	 * @param {PIXI.tween.Tween#tweenConfig} config - object to configure the tween
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	config(config) {
		if (!config || typeof config !== 'object') {
			return this;
		}

		if (typeof config.from === 'object') {
			this.from(config.from);
		}
		if (config.to && typeof config.to === 'object') {
			this.to(config.to);
		}
		if (typeof config.delay === 'number') {
			this.delay = config.delay;
		}
		if (config.easing) {
			if (typeof config.easing === 'string' && Easing[config.easing]) {
				this.easing = Easing[config.easing]();
			} else if (typeof config.easing === 'function') {
				this.easing = config.easing;
			}
		}
		if (typeof config.loop === 'boolean') {
			this.loop = config.loop;
		}
		if (typeof config.path === 'object') {
			this.path = config.path;
		}
		if (typeof config.pathReverse === 'boolean') {
			this.pathReverse = config.pathReverse;
		}
		if (typeof config.pingPong === 'boolean') {
			this.pingPong = config.pingPong;
		}
		if (typeof config.repeat === 'number') {
			this.repeat = config.repeat;
		}
		if (typeof config.time === 'number') {
			this.time = config.time;
		}
		if (typeof config.speed === 'number') {
			this.speed = config.speed;
		}

		if (config.on && typeof config.on === 'object') {
			if (typeof config.on.end === 'function') {
				this.on('end', config.on.end);
			}
			if (typeof config.on.pingpong === 'function') {
				this.on('pingpong', config.on.pingpong);
			}
			if (typeof config.on.repeat === 'function') {
				this.on('repeat', config.on.repeat);
			}
			if (typeof config.on.start === 'function') {
				this.on('start', config.on.start);
			}
			if (typeof config.on.stop === 'function') {
				this.on('stop', config.on.stop);
			}
			if (typeof config.on.update === 'function') {
				this.on('update', config.on.update);
			}
		}

		return this;
	}

	/**
	 * True if the tween is running
	 *
	 * @member {boolean}
	 * @readonly
	 */
	get active() {
		return this._active;
	}

	/**
	 * How much time has passed on an active tween
	 *
	 * @member {number}
	 * @readonly
	 */
	get elapsedTime() {
		return this._elapsedTime;
	}

	/**
	 * 0-1 decimal value representing proportion of completion
	 *
	 * @member {number}
	 * @readonly
	 */
	get progress() {
		return this._progress;
	}

	/**
	 * True if the tween has started running
	 *
	 * @member {boolean}
	 * @readonly
	 */
	get isStarted() {
		return this._isStarted;
	}

	/**
	 * True if a tween has ended running
	 *
	 * @member {boolean}
	 * @readonly
	 */
	get isEnded() {
		return this._isEnded;
	}

	/**
	 * Remove the tween from the manager if it has one
	 *
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	remove() {
		if (!this.manager) {
			return this;
		}

		this.manager.removeTween(this);

		return this;
	}

	/**
	 * Starts the tween
	 *
	 * @param {Promise} resolve - Promise to resolve when the tween has ended
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	start(resolve) {
		this._active = true;
		this._isStarted = false;

		if (this._resetFromOnStart) {
			this._from = {};
		}

		if (!this._resolvePromise && resolve) {
			this._resolvePromise = resolve;
		}

		this.manager.addTween(this);

		return this;
	}

	/**
	 * Starts the tween, whilst returning a new promise
	 *
	 * @returns {Promise} - Promsie that will resolve when the tween has finished
	 */
	startPromise() {
		if (!Promise) {
			return this.start();
		}

		if (this._resolvePromise) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			this.start(resolve);
		});
	}

	/**
	 * Stop the tweens progress
	 *
	 * @fires PIXI.tween.Tween#stop
	 *
	 * @param {boolean} [end=false] - Force end to be called
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	stop(end = false) {
		this._active = false;
		this.emit('stop');

		if (end) {
			this._end();
		} else if (this._resolvePromise) {
			this._resolvePromise()
		}

		return this;
	}

	/**
	 * Set the end data for the tween
	 *
	 * @example
	 * tween.to({ x:100, y:100 });
	 *
	 * @param {Object} data - Object containing end point data for the tween
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	to(data = {}) {
		this._to = data;

		return this;
	}

	/**
	 * Set the start point data for the tween.
	 * If nothing is set, data is reset so that starting the tween will use the objects current state as the start point
	 *
	 * @example
	 * tween.from({ x:50, y:50 });
	 *
	 * @param {Object} [data] - Object containing start point data for the tween
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	from(data) {
		if (!data || typeof data !== 'object') {
			this._resetFromOnStart = true;
			this._from = {};
		} else {
			this._resetFromOnStart = false;
			this._from = data;
		}

		return this;
	}

	/**
	 * Chain another tween to play after this tween has ended
	 *
	 * @param {PIXI.tween.Tween} tween - Tween to chain
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	chain(tween) {
		if (!tween) {
			tween = new Tween(this.target);
		}
		this._chainTween = tween;

		return tween;
	}

	/**
	 * Resets the tween to it's default state, but keeping any to and from data, so start can be called to replay the tween
	 *
	 * @returns {PIXI.tween.Tween} - This tween instance
	 */
	reset() {
		this._elapsedTime = 0;
		this._progress = 0;
		this._repeat = 0;
		this._delayTime = 0;
		this._isStarted = false;
		this._isEnded = false;

		if (this.pingPong && this._pingPong) {
			const _to = this._to;
			const _from = this._from;

			this._to = _from;
			this._from = _to;

			this._pingPong = false;
		}

		return this;
	}

	/**
	 * Updating of the tween; usually automatically called by its manager
	 *
	 * @fires PIXI.tween.Tween#start
	 * @fires PIXI.tween.Tween#update
	 * @fires PIXI.tween.Tween#pingpong
	 * @fires PIXI.tween.Tween#repeat
	 *
	 * @param {number} deltaMS - Time elapsed in milliseconds from last update to this update.
	 */
	update(deltaMS) {
		if (!this._canUpdate() && (this._to || this.path)) {
			return;
		}

		deltaMS *= this.speed;

		if (this.delay > this._delayTime) {
			this._delayTime += deltaMS;

			return;
		}

		if (!this._isStarted) {
			this._parseData();
			this._isStarted = true;
			this._isEnded = false;
			this.emit('start');
		}

		const time = (this.pingPong) ? this.time / 2 : this.time;
		let _to;
		let _from;

		if (time >= this._elapsedTime) {
			const t = this._elapsedTime + deltaMS;
			const ended = (t >= time);

			this._elapsedTime = ended ? time : t;
			this._apply(time);

			const realElapsed = this._pingPong ? time + this._elapsedTime : this._elapsedTime;

			this._progress = this.time > 0 ? Math.min(realElapsed / this.time, 1) : 1;

			this.emit('update', this._progress, realElapsed);

			if (ended) {
				if (this.pingPong && !this._pingPong) {
					this._pingPong = true;
					_to = this._to;
					_from = this._from;
					this._from = _to;
					this._to = _from;

					if (this.path) {
						_to = this._pathTo;
						_from = this._pathFrom;
						this._pathTo = _from;
						this._pathFrom = _to;
					}

					this.emit('pingpong');
					this._elapsedTime = 0;
					this._progress = 0.5;

					return;
				}

				if (this.loop || this.repeat > this._repeat) {
					++this._repeat;
					this.emit('repeat', this._repeat);
					this._elapsedTime = 0;
					this._progress = 0;

					if (this.pingPong && this._pingPong) {
						_to = this._to;
						_from = this._from;
						this._to = _from;
						this._from = _to;

						if (this.path) {
							_to = this._pathTo;
							_from = this._pathFrom;
							this._pathTo = _from;
							this._pathFrom = _to;
						}

						this._pingPong = false;
					}

					return;
				}

				this._end();
			}

			return;
		}
	}

	/**
	 * Called when the tween has finished
	 *
	 * @fires PIXI.tween.Tween#end
	 *
	 * @private
	 */
	_end() {
		this._isEnded = true;
		this._active = false;
		this.emit('end');
		this._elapsedTime = 0;

		if (this._chainTween) {
			if (!this._chainTween.manager) {
				this._chainTween.manager = this.manager;
			}
			this._chainTween.start(this._resolvePromise);
			this._resolvePromise = null;
		} else if (this._resolvePromise) {
			const resolvePromise = this._resolvePromise;

			this._resolvePromise = null;
			resolvePromise();
		}
	}

	/**
	 * Parses the from and to data to extract details about how the tween should progress
	 *
	 * @private
	 */
	_parseData() {
		if (this._isStarted) {
			return;
		}

		_parseRecursiveData(this._to, this._from, this.target);

		if (this.path) {
			const distance = this.path.totalDistance();

			if (this.pathReverse) {
				this._pathFrom = distance;
				this._pathTo = 0;
			} else {
				this._pathFrom = 0;
				this._pathTo = distance;
			}
		}
	}

	/**
	 * Updates the object with the tween settings
	 *
	 * @param {number} time - Time duration for the tween
	 * @private
	 */
	_apply(time) {
		_recursiveApplyTween(this._to, this._from, this.target, time, this._elapsedTime, this.easing);

		if (this.path) {
			const time = (this.pingPong) ? this.time / 2 : this.time;
			const b = this._pathFrom;
			const c = this._pathTo - this._pathFrom;
			const d = time;
			const t = time ? this._elapsedTime / d : 1;

			const distance = b + (c * this.easing(t));
			const pos = this.path.getPointAtDistance(distance);

			this.target.position.set(pos.x, pos.y);
		}
	}

	/**
	 * Can this tween be updated (must be active and have a target destination)
	 *
	 * @returns {boolean} - True if this tween can be updated
	 * @private
	 */
	_canUpdate() {
		return (this._active && this.target);
	}
}

function _recursiveApplyTween(to, from, target, time, elapsedTime, easing) {
	for (const k in to) {
		if (!_isObject(to[k])) {
			const b = from[k];
			const c = to[k] - from[k];
			const d = time;
			const t = time ? elapsedTime / d : 1;

			target[k] = b + (c * easing(t));
		} else {
			_recursiveApplyTween(to[k], from[k], target[k], time, elapsedTime, easing);
		}
	}
}

function _parseRecursiveData(to, from, target) {
	for (const k in to) {
		if (from[k] !== 0 && !from[k]) {
			if (_isObject(target[k])) {
				from[k] = {};
				_parseRecursiveData(to[k], from[k], target[k]);
			} else {
				from[k] = target[k];
			}
		}
	}
}

function _isObject(obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
}
