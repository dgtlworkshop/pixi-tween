import { Graphics, Point } from 'pixi.js';
/**
 * Class that allows drawing a path using PIXI.Graphics, which can then be followed and used as a tween
 *
 * @class
 * @memberof PIXI.tween
 */
export default class TweenPath extends Graphics {
	/**
	 *
	 */
	constructor() {
		super();

		/** @member {PIXI.Polygon} - PIXI object to use as the path */
		this.polygon = new PIXI.Polygon();
		this.polygon.closeStroke = false;

		/**
		* @member {boolean}
		* Used to detect if the graphics object has changed.
		* If this is set to true then the graphics object will be recalculated.
		*/
		this.dirty = true;

		// assign a brightly coloured line style to use for debugging purposes.
		// just add the tween path as a child of a container, and it will be visible.
		const brightColor = Math.floor((0xffffff / 2)) + (Math.random() * 0xffffff / 2);

		this.lineStyle(4, brightColor, 1, 0.5, false);

		this._tmpPoint = new Point();
		this._tmpPoint2 = new Point();
		this._tmpDistance = [];
	}

	/**
	 * The number of points along the path
	 *
	 * @member {number}
	 * @readonly
	 */
	get length() {
		return (this.polygon.points.length) ? (this.polygon.points.length / 2) + ((this.polygon.closeStroke) ? 1 : 0) : 0;
	}

	/**
	 * Clear the path
	 *
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	clear() {
		super.clear();

		this.polygon.points.length = 0;
		this.polygon.closeStroke = false;
		this.dirty = false;

		return this;
	}

	/**
	 * Finds the distance between two points
	 *
	 * @param {number} num1 - First point
	 * @param {number} num2 - Second point
	 * @returns {number} - Distance in pixels
	 */
	distanceBetween(num1, num2) {
		this.parsePoints();
		const { x: p1X, y: p1Y } = this.getPoint(num1);
		const { x: p2X, y: p2Y } = this.getPoint(num2);
		const dx = p2X - p1X;
		const dy = p2Y - p1Y;

		return Math.sqrt((dx * dx) + (dy * dy));
	}

	/**
	 * Finds the nth point along the path
	 *
	 * @param {number} num - Point
	 * @returns {PIXI.Point} - Point co-ordinates
	 */
	getPoint(num) {
		this.parsePoints();
		const len = (this.polygon.closeStroke && num >= this.length - 1) ? 0 : num * 2;

		this._tmpPoint.set(this.polygon.points[len], this.polygon.points[len + 1]);

		return this._tmpPoint;
	}

	/**
	 * Finds the nth point along the path
	 *
	 * @param {number} num - Point
	 * @returns {PIXI.Point} - Point co-ordinates
	 */
	getPointAt(num) {
		this.parsePoints();
		if (num > this.length) {
			return this.getPoint(this.length - 1);
		}

		if (num % 1 === 0) {
			return this.getPoint(num);
		}
		this._tmpPoint2.set(0, 0);
		const diff = num % 1;
		const { x: ceilX, y: ceilY } = this.getPoint(Math.ceil(num));
		const { x: floorX, y: floorY } = this.getPoint(Math.floor(num));

		const xx = -((floorX - ceilX) * diff);
		const yy = -((floorY - ceilY) * diff);

		this._tmpPoint2.set(floorX + xx, floorY + yy);

		return this._tmpPoint2;
	}

	/**
	 * Finds the nearest point for the distance to be travelled
	 *
	 * @param {number} distance - how far to travel
	 * @returns {PIXI.Point} - Point co-ordinates
	 */
	getPointAtDistance(distance) {
		this.parsePoints();
		if (!this._tmpDistance) {
			this.totalDistance();
		}
		const len = this._tmpDistance.length;
		let n = 0;

		const totalDistance = this._tmpDistance[this._tmpDistance.length - 1];

		if (distance < 0) {
			distance = totalDistance + distance;
		} else if (distance > totalDistance) {
			distance = distance - totalDistance;
		}

		for (let i = 0; i < len; ++i) {
			if (distance >= this._tmpDistance[i]) {
				n = i;
			}

			if (distance < this._tmpDistance[i]) { break; }
		}

		if (n === this.length - 1) {
			return this.getPointAt(n);
		}

		const diff1 = distance - this._tmpDistance[n];
		const diff2 = this._tmpDistance[n + 1] - this._tmpDistance[n];

		return this.getPointAt(n + (diff1 / diff2));
	}

	/**
	 * Parse the list of points from the path
	 *
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	parsePoints() {
		if (!this.dirty) {
			return this;
		}

		this.dirty = false;
		this.polygon.points.length = 0;
		this.finishPoly();

		for (let i = 0; i < this.geometry.graphicsData.length; ++i) {
			const shape = this.geometry.graphicsData[i].shape;

			if (shape && shape.points) {
				this.polygon.points = this.polygon.points.concat(shape.points);
			}
		}

		return this;
	}

	/**
	 * Calculates the total distance along the entire path
	 *
	 * @returns {number} - Distance in pixels
	 */
	totalDistance() {
		this.parsePoints();
		this._tmpDistance.length = 0;
		this._tmpDistance.push(0);

		const len = this.length;
		let distance = 0;

		for (let i = 0; i < len - 1; ++i) {
			distance += this.distanceBetween(i, i + 1);
			this._tmpDistance.push(distance);
		}

		return distance;
	}

	/**
	 * The arc method creates an arc/curve (used to create circles, or parts of circles).
	 *
	 * @param {number} cx - The x-coordinate of the center of the circle
	 * @param {number} cy - The y-coordinate of the center of the circle
	 * @param {number} radius - The radius of the circle
	 * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
	 *  of the arc's circle)
	 * @param {number} endAngle - The ending angle, in radians
	 * @param {boolean} [anticlockwise=false] - Specifies whether the drawing should be
	 *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
	 *  indicates counter-clockwise.
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	arc(cx, cy, radius, startAngle, endAngle, anticlockwise) {
		super.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
		this.dirty = true;

		return this;
	}

	/**
	 * The arcTo() method creates an arc/curve between two tangents on the canvas.
	 *
	 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
	 *
	 * @param {number} x1 - The x-coordinate of the beginning of the arc
	 * @param {number} y1 - The y-coordinate of the beginning of the arc
	 * @param {number} x2 - The x-coordinate of the end of the arc
	 * @param {number} y2 - The y-coordinate of the end of the arc
	 * @param {number} radius - The radius of the arc
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	arcTo(x1, y1, x2, y2, radius) {
		super.arcTo(x1, y1, x2, y2, radius);
		this.dirty = true;

		return this;
	}

	/**
	 * Calculate the points for a bezier curve and then draws it.
	 *
	 * @param {number} cpX - Control point x
	 * @param {number} cpY - Control point y
	 * @param {number} cpX2 - Second Control point x
	 * @param {number} cpY2 - Second Control point y
	 * @param {number} toX - Destination point x
	 * @param {number} toY - Destination point y
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
		super.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws a circle.
	 *
	 * @param {number} x - The X coordinate of the center of the circle
	 * @param {number} y - The Y coordinate of the center of the circle
	 * @param {number} radius - The radius of the circle
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawCircle(x, y, radius) {
		super.drawCircle(x, y, radius);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws an ellipse.
	 *
	 * @param {number} x - The X coordinate of the center of the ellipse
	 * @param {number} y - The Y coordinate of the center of the ellipse
	 * @param {number} width - The half width of the ellipse
	 * @param {number} height - The half height of the ellipse
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawEllipse(x, y, width, height) {
		super.drawEllipse(x, y, width, height);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws a rectangle shape.
	 *
	 * @param {number} x - The X coord of the top-left of the rectangle
	 * @param {number} y - The Y coord of the top-left of the rectangle
	 * @param {number} width - The width of the rectangle
	 * @param {number} height - The height of the rectangle
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawRect(x, y, width, height) {
		super.drawRect(x, y, width, height);
		this.dirty = true;

		return this;
	}

	/**
	 * Draw a rectangle shape with rounded/beveled corners.
	 *
	 * @param {number} x - The X coord of the top-left of the rectangle
	 * @param {number} y - The Y coord of the top-left of the rectangle
	 * @param {number} width - The width of the rectangle
	 * @param {number} height - The height of the rectangle
	 * @param {number} radius - Radius of the rectangle corners
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawRoundedRect(x, y, width, height, radius) {
		super.drawRoundedRect(x, y, width, height, radius);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws a polygon using the given path.
	 *
	 * @param {number[]|PIXI.Point[]|PIXI.Polygon} path - The path data used to construct the polygon.
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawPolygon(path) {
		super.drawPolygon(path);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws the given shape to this TweenPath object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
	 *
	 * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - Shape to draw
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawShape(shape) {
		super.drawShape(shape);
		this.dirty = true;

		return this;
	}

	/**
	 * Draw a star shape with an arbitrary number of points.
	 *
	 * @param {number} x - Center X position of the star
	 * @param {number} y - Center Y position of the star
	 * @param {number} points - The number of points of the star, must be > 1
	 * @param {number} radius - The outer radius of the star
	 * @param {number} [innerRadius] - The inner radius between points, default half `radius`
	 * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	drawStar(x, y, points, radius, innerRadius, rotation = 0) {
		super.drawStar(x, y, points, radius, innerRadius, rotation);
		this.dirty = true;

		return this;
	}

	/**
	 * Draws a line using the current line style from the current drawing position to (x, y);
	 * The current drawing position is then set to (x, y).
	 *
	 * @param {number} x - the X coordinate to draw to
	 * @param {number} y - the Y coordinate to draw to
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	lineTo(x, y) {
		super.lineTo(x, y);
		this.dirty = true;

		return this;
	}

	/**
	 * Moves the current drawing position to x, y.
	 *
	 * @param {number} x - the X coordinate to move to
	 * @param {number} y - the Y coordinate to move to
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	moveTo(x, y) {
		super.moveTo(x, y);
		this.dirty = true;

		return this;
	}

	/**
	 * Calculate the points for a quadratic bezier curve and then draws it.
	 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
	 *
	 * @param {number} cpX - Control point x
	 * @param {number} cpY - Control point y
	 * @param {number} toX - Destination point x
	 * @param {number} toY - Destination point y
	 * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
	 */
	quadraticCurveTo(cpX, cpY, toX, toY) {
		super.quadraticCurveTo(cpX, cpY, toX, toY);
		this.dirty = true;

		return this;
	}
}
