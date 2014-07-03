// tick is the managed raf utility we're using here..
var tick = require('gm-tick');
var is = require('gm-is');
var each = require('foreach');

var parser = require('gm-parse-duration');

var emptyFunction = function DoAbsolutelyNothing(){};

var IDLE = 0;
var PLAYONCE = 1;
var LOOP = 2;
var BOUNCE = 4;
var FORWARD = 8;
var BACKWARD = 16;
var PAUSED = 32;

function AnimationTimer ( ) {
  this._duration = 1000;
  this._state = IDLE;
  this.fn = {};

  return this;
}

AnimationTimer.prototype = {

  duration : function (duration) {
    this._duration = parser(duration);
    return this;
  },

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

  trigger : function (event){

    if(this.fn[event]){
      var args = Array.prototype.splice.call(arguments, 1);
      this.fn[event].apply(this.fn[event], args);
    }

  },

  // play through once.
  play : function () {

    this._lastTick = 0;
    this._state = PLAYONCE;
    this._forwards = true;
    this._handle = tick.add(playOnceHandler.bind(this));

  },

  reverse : function () {

    this._lastTick = 0;
    this._state = PLAYONCE;
    this._forwards = false;
    this._handle = tick.add(playOnceHandler.bind(this));

  },

  // play through repeatedly.
  loop : function () {

    this._lastTick = 0;
    this._state = LOOP;
    this._forwards = true;
    this._handle = tick.add(loopHandler.bind(this));

  },

  // reverse repeatedly.
  loopReverse : function () {

    this._lastTick = 0;
    this._state = LOOP;
    this._forwards = false;
    this._handle = tick.add(loopHandler.bind(this));

  },

  // play forwards then backwards
  bounce : function () {

    this._lastTick = 0;
    this._state = BOUNCE;
    this._forwards = true;
    this._handle = tick.add(bounceHandler.bind(this));

  },

  // immediately stop
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

  resume : function () {

    this._state -= PAUSED;
    if (this._handle){
      this._handle.resume();
    }

  },

  state : function (){

    return this._state;

  }
};

function playOnceHandler (elapsed, stop){

  // when playing only once, we need to guaranteed the highest number is 1.
  var percent = Math.min(1, elapsed / this._duration);

  this.trigger('tick', (this._forwards ? percent : 1 - percent ));

  // are we at the end now? 
  if (percent === 1){
    // stop the animation
    this._state = IDLE;
    stop();

    this.trigger('stop', tick.now());

  }

}

function loopHandler (elapsed, stop){

  var percent = (elapsed / this._duration) % 1;

  if(percent < this._lastTick){
    this.trigger('loop', tick.now());
  }

    // update the last tick for next time...
  this._lastTick = percent;

  this.trigger('tick', (this._forwards ? percent : 1 - percent ));

}

function bounceHandler (elapsed, stop){

  var percent = (elapsed / this._duration) % 1;

  if(percent < this._lastTick){

    this.trigger('bounce', tick.now());

    this._forwards = !this._forwards;

  }

  this._lastTick = percent;

  this.trigger('tick', (this._forwards ? percent : 1 - percent ));

}


module.exports.AnimationTimer = AnimationTimer;

