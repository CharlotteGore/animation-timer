// bind polyfill.. mostly just for phantomjs support really.

require('bindpolyfill');

// instead of using requestAnimation frame directly, we're using tick, which provides
// a single requestAnimationFrame loop which can be globally paused and resumed and provides
// this module with the ability to pause and resume individual animations.

// It also abstracts the differences between browsers, always providing the highest resolution
// time information available. It's quite cool.
var tick = require('animation-loops');

tick.add(function(){});

// is is just a simple type checking utility
var is = require('gm-is');
// underscore's each
var each = require('foreach');
// convert strings containing time information into miliseconds
var parser = require('gm-parse-duration');

// Some flags... 
var IDLE = 0;
var PLAYONCE = 1;
var LOOP = 2;
var BOUNCE = 4;
var FORWARD = 8;
var BACKWARD = 16;
var PAUSED = 32;

function AnimationTimer ( ) {
  // default duration is 1 second. 
  this._duration = 1000;
  this._state = IDLE;
  // user callback containter
  this.fn = {};

  return this;
}

AnimationTimer.prototype = {
  // set the duration. can be string, '10ms', '2.4s', '5m' or miliseconds, 1022.
  duration : function (duration) {
    this._duration = parser(duration);
    return this;
  },
  // subscribe to an event, e.g, .on('tick', function(time){ .. })
  on : function (event, callback){

    if (is.string(event) && is['function'](callback)){
      this.fn[event] = callback;
    } else if (is.object(event)){
      each(event, function (callback, event){
        this.fn[event] = callback;
      }, this);
    } else {
      console.warn('Not able to bind event handlers for .on() input:', arguments);
    }

    return this;
  },
  // trigger an event, e.g, .on('stop', function(time){ .. })
  trigger : function (event){

    if(this.fn[event]){
      var args = Array.prototype.splice.call(arguments, 1);
      this.fn[event].apply(this.fn[event], args);
    }

  },
  // play through once, stopping at '1'
  play : function () {

    this._lastTick = 0;
    this._state = PLAYONCE;
    this._forwards = true;
    this._handle = tick.add(playOnceHandler.bind(this));

  },
  // play through once, in reverse, stopping at '0'
  reverse : function () {

    this._lastTick = 0;
    this._state = PLAYONCE;
    this._forwards = false;
    this._handle = tick.add(playOnceHandler.bind(this));

  },
  // play through repeatedly, going from '0' to '1' every 'duration'
  loop : function () {

    this._lastTick = 0;
    this._state = LOOP;
    this._forwards = true;
    this._handle = tick.add(loopHandler.bind(this));

  },
  // play in reverse repeatedly, going fmor '1' to '0' every 'duration'
  loopReverse : function () {

    this._lastTick = 0;
    this._state = LOOP;
    this._forwards = false;
    this._handle = tick.add(loopHandler.bind(this));

  },
  // repeatedly toggling between play() and reverse() every 'duration'
  bounce : function () {

    this._lastTick = 0;
    this._state = BOUNCE;
    this._forwards = true;
    this._handle = tick.add(bounceHandler.bind(this));

  },
  // immediately stop. Stopped animations cannot be resumed.
  stop : function () {

    this._state = IDLE;
    if(this._handle){
      this._handle.stop();
      this.trigger('stop', tick.now());
    }

  },
  // pause the animation with the intention of resuming
  pause : function () {

    this._state += PAUSED;
    if (this._handle){
      this._handle.pause();
    }

  },
  // resume the animation.
  resume : function () {

    this._state -= PAUSED;
    if (this._handle){
      this._handle.resume();
    }

  },
  // query the state (debug)
  state : function (){

    return this._state;

  }
};

// In order to minimse the complexity of tick handlers, there are three
// discrete functions here. Less branching, less 'if' statements etc.
// more code to write, less code to execute.

// handles single play animations
function playOnceHandler (elapsed, delta, stop){

  // when playing only once, we need to guaranteed the highest number is 1.
  var percent = Math.min(1, elapsed / this._duration);

  this.trigger('tick', (this._forwards ? percent : 1 - percent ), delta);

  // are we at the end now? 
  if (percent === 1){
    // stop the animation
    this._state = IDLE;
    stop();

    this.trigger('stop', tick.now());

  }

}

// handles looping animations
function loopHandler (elapsed, delta, stop){

  var percent = (elapsed / this._duration) % 1;

  if(percent < this._lastTick){
    this.trigger('loop', tick.now());
  }
    // update the last tick for next time...
  this._lastTick = percent;

  this.trigger('tick', (this._forwards ? percent : 1 - percent ), delta);

}

// handles bounding animations
function bounceHandler (elapsed, delta, stop){

  var percent = (elapsed / this._duration) % 1;

  if(percent < this._lastTick){

    this.trigger('bounce', tick.now());

    this._forwards = !this._forwards;

  }

  this._lastTick = percent;

  this.trigger('tick', (this._forwards ? percent : 1 - percent ), delta);

}


module.exports.AnimationTimer = AnimationTimer;

