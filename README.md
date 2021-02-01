pixi-tween
======================

Monkey-patches `themoonrat/pixi-tween` to work as an ES module.

pixi-tween is a plugin for PixiJS v5.0.0 or higher to create tween animations.

## API documentation
[JSDocs](https://themoonrat.github.io/pixi-tween/docs/index.html)

## Usage
### Rollup / Browserify / Webpack
If you use Browserify or Webpack you can use pixi-tween like this:

```js
import * as PIXI from ('pixi.js');
import tweenManager from ('pixi-tween');

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

// Listen for animate update and update the tween manager
app.ticker.add(function(delta) {
    PIXI.tweenManager.update();
});
```

### Prebuilt files
If not, the namespaces are automatically added to global anyway

```js
const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

// Listen for animate update and update the tween manager
app.ticker.add(function(delta) {
    PIXI.tweenManager.update();
});
```

## How it works
This plugin add a new namespace names `tween` to the PIXI namespace, and this new namespace has 3 new classes Tween, TweenPath and TweenManager, also add an Easing object.

A tweenManager is automatically created for you in PIXI.tweenManager, which you need to update on ticks via `PIXI.tweenManager.update()`.
You can create your own tweenManagers via `new PIXI.tween.TweenManager`, and you can also manually update the timings of a manager via `PIXI.tweenManager.update(deltaMS)`

When a tween is ended, the instance will kept be automatically removed from the tweenManager. Keep a reference to it yourself it you want to re-use; it will re-add itself if required.

### Events
Tween extends from [PIXI.utils.EventEmitter](https://github.com/primus/eventemitter3), and emit some events: start, end, repeat, update, stop and pingpong. You can read about these in the api documentation under PIXI.tween.Tween.

### Paths
Move an object along a path it's easy with TweenPath. TweenPath use a similar PIXI.Graphics API to create paths, and once it's created our path we just need to add it to a tween with .path = ourPathCreated.

If you need draw your path (useful to debug), PIXI.Graphics has been enhanced with a new method named .drawPath(path). Use it the same way like .drawRectanle, .drawShape, etc...

## Basic example
```js
const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
const tween = PIXI.tweenManager.createTween(sprite);
tween.from({ x: 0 }).to({ x: 250 })
tween.time = 1000;
tween.repeat = 10;
tween.on('start', () => { console.log('tween started') });
tween.on('repeat', ( loopCount ) => { console.log('loopCount: ' + loopCount) });
tween.start();

// Listen for animate update and update the tween manager
app.ticker.add(function(delta) {
    PIXI.tweenManager.update();
});
```

## Other examples
 [Easing](https://themoonrat.github.io/pixi-tween/examples/easing.html)
 [TweenPath](https://themoonrat.github.io/pixi-tween/examples/path.html)
