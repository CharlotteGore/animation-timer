# Animation Timer

[![Build Status](https://travis-ci.org/charlottegore/animation-timer.png?branch=master)](https://travis-ci.org/charlottegore/animation-timer)

Low level animation / LFO module suitable for animations, games development and audio processing. It uses [Tick](https://github.com/charlottegore/tick) as a central controller, giving the ability to pause and resume individual or all animations currently in progress.

Animation Timer literally does nothing but supply you with a normalised, utterly generic 'percentage time elapsed' value. The applications are worryingly diverse.

- Create a new timer and set a duration
- Set your tick event handler
- play, reverse, loop, loop reverse or bounce the animation
- Stop it, Pause it, Resume it. 
- Tick handler gets a value between 0 and 1

This module works extremely well with [Functional Easing](https://github.com/charlottegore/functional-easing) which can wrap your tick handlers with easing functions so that you get eased time values instead of raw linear time elapsed values. It's cool. Not bow-tie cool, but pretty pretty cool. 

## Example

```js
// some dependencies...
var quat = require('gl-matrix-quat');
var mat4 = require('gl-matrix-mat4');
var Easer = require('functional-easing').Easer;

// animation timer module...
var AnimationTimer = require('animation-timer').AnimationTimer;

// making two quaternions.
var q1 = quat.fromValues(0.5, 0.3, 1.0, 1.0);
var q2 = quat.fromValues(0.1, 0.9, 0.2, 1.0);

// make an easing function..
var easer = new Easer().using('in-cubic');

var animation = new AnimationTimer()
  .duration('5s')
  // wrap our tick handler with our easing function...
  .on('tick', easer(function (percent){

    var out = quat.create();
    quat.slerp(out, q1, q2, percent);

    // do something with our new quaternion... 

  }));

animation.bounce();
```

## Installation

Browserify/NPM

```sh
    $ npm install --save animation-timer
```

```js
  var AnimationTimer = require('animation-timer').AnimationTimer;
```

# API

## Core

### new AnimationTimer()

Creates a new instance of AnimationTimer;
  
```js
var animation = new AnimationTimer();
```

### animation.duration( duration )

Specifies how long a single iteration of the animation should last for. Can be given in miliseconds or as a string, '200ms', '2s', '1m' etc.

When the tick handler fires, the value passed as a parameter is the percentage time elapsed (between 0 and 1) since the animation began.

- Animations started with `play` or `reverse` will go from `0` to `1` over the duration.
- Animations started with `loop` or `loopReverse` will loop every `duration`, each cycle behaving like `play` or `reverse`
- Animations started with `bounce` will toggle between `play` and `reverse` every `duration`.

```js
// create a triangle wave LFO for the Web Audio API, toggling direction every beat
var ani = new AnimationTimer()
  .duration(500)
  .on('tick', function(percent){
    filter.frequency.value = lerp(200,500, percent);
  })
  .loop();
```

## Events

### animation.on(event, callback)

Subscribe to an event. The built in events are:

#### .on('tick', func)

Subscribe to the tick event.

- Fires every animationFrame while the animation is running
- `func` is passed `percent` as a parameter. This is value between 0 and 1

#### .on('stop', func)

This handler can be used to do any processing work required after an animation is concluded.

- Fires when `.play()` or `.reverse()` animations are finished
- Fires when the animation is manually stopped
- `func` is passed the current time

#### .on('loop', function)

This handler can be used in leui of a `tick` handler in order to trigger events that occur every `duration`.

- Fires when `.loop()` or `.loopReverse()` animations are about to start the next iteration
- `func` is passed the current time

#### .on('bounce', function)

This handler can be used in leui of a `tick` handler in order to trigger events that occur every `duration`.

- Fires when `.bounce()` animations are about to toggle direction.
- `func` is passed the current time

### .trigger(event, args)

Technically you can trigger any event manually, including any custom events you so desire. 

## Playing Animations

### animation.play()

Fires a tick handler every animationFrame until the duration has elapsed, at which point it stops.

- `time` in the tick handler climbs from 0 to 1, representing the percentage `duration` elapsed.

```js
animation
  .duration(1000)
  .on('tick', function(time){
    console.log(time);
  })
  .play();
```

### animation.loop()

Fires a tick handler every animationFrame indefinitely

- `time` in the tick handler climbs from 0 to 1, representing the percentage `duration` elapsed.
- Each `duration`, `time` loops back to 0 and starts again
- Sawtooth LFO

```js
animation
  .duration(1000)
  .on('tick', function(time){
    console.log(time);
  })
  .loop();
```

### animation.bounce()

Fires a tick handler every animationFrame indefinitely

- `time` in the tick handler climbs from 0 to 1, then 1 to 0, then 0 to 1 and so on.
- Each `duration`, `time` toggles between climbing and falling.
- Triangle LFO

```js
animation
  .duration(1000)
  .on('tick', function(time){
    console.log(time);
  })
  .bounce();
```

### animation.reverse()

Fires a tick handler every animationFrame until the duration has elapsed, at which point it stops.

- `time` in the tick handler falls from 1 to 0, representing the inverted percentage `duration` elapsed.

```js
animation
  .duration(1000)
  .on('tick', function(time){
    console.log(time);
  })
  .reverse();
```

### animation.loopReverse()

Fires a tick handler every animationFrame indefinitely

- `time` in the tick handler falls from 1 to 0, representing the inverted percentage `duration` elapsed.
- Each `duration`, `time` loops back to 0 and starts again
- Reverse Sawtooth LFO

```js
animation
  .duration(1000)
  .on('tick', function(time){
    console.log(time);
  })
  .loopReverse();
```

## Control

### animation.stop()

Immediately stops the running animation. Stopped animations cannot be resumed, only restarted.

```js
animation.stop();
```

### animation.pause()

Pauses the animation. 

```js
animation.pause();
```

### animation.resume()

Resumes an animation

```js
animation.resume();
```

## Tests

Assuming you have `grunt-cli` already installed, and you've cloned the repo:

```sh
# Just the once...
$ npm install
```

```sh
grunt test
```

## License

  MIT
