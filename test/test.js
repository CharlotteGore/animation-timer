var chai = require('chai');
var expect = chai.expect;

animationModule = require('../index.js');

describe('Animation Core module', function (){

  var AnimationTimer = animationModule.AnimationTimer;

  it('passes a basic sanity checking test', function (){

    expect(new AnimationTimer()).to.be.an('object');

  })

  it('animations last the correct amount of time, done event fires afterwards', function (done){

    var time = Date.now();
    var triggerCount = 0;

    var animation = new AnimationTimer();
    animation.duration(200);
    animation.on('stop', function (){

      triggerCount++;
      var elapsed = Date.now() - time;

      expect(elapsed).to.be.within(200,220);
      expect(triggerCount).to.equal(1);
      done();

    });
    animation.play();

  });

  it('animations fire numerous tick events', function (done){

    var time = Date.now();
    var tickCount = 0;
    var triggerCount = 0;
    var lastTick = -1;

    var animation = new AnimationTimer();
    animation.duration(200);
    animation.on('tick', function (percent){

      expect(percent).to.be.within(0, 1);
      expect(lastTick).to.be.lessThan(percent);
      lastTick = percent;
      tickCount++;

    });
    animation.on('stop', function (){

      triggerCount++;
      expect(tickCount).to.be.within(10,200);
      expect(triggerCount).to.equal(1);
      done();

    });
    animation.play();

  });

  it('can also play animations backwards', function (done){

    var tickCount = 0;
    var triggerCount = 0;
    var lastTick = 2;

    var animation = new AnimationTimer();
    animation.duration(200);
    animation.on('tick', function (percent){

      expect(percent).to.be.within(0, 1);
      expect(lastTick).to.be.greaterThan(percent);
      lastTick = percent;
      tickCount++;

    });
    animation.on('stop', function (){

      triggerCount++;
      expect(tickCount).to.be.within(10,200);
      expect(triggerCount).to.equal(1);
      done();

    });
    animation.reverse();

  });

  it('can play animations more than once', function (done){

    var triggerCount = 0;

    var animation = new AnimationTimer();
    animation.duration(100);
    animation.on('tick', function (percent){

      expect(percent).to.be.within(0, 1);

    });
    animation.on('stop', function (){

      triggerCount ++;

      animation.on('stop', function (){

        triggerCount ++;

        expect(triggerCount).to.equal(2);

        done();

      });

      animation.play();
      
    });
    animation.play();

  });

  it('can pause and resume animations', function (done){

    var time = Date.now();
    var tickCount = 0;
    var triggerCount = 0;
    var lastTick = -1;

    var animation = new AnimationTimer();
    animation.duration(200);
    animation.on('tick', function (percent){

      expect(percent).to.be.within(0, 1);
      // make sure we're not starting again at zero when we resume
      expect(lastTick).to.be.lessThan(percent);
      lastTick = percent;


    });
    setTimeout(function(){
      animation.pause();   
    }, 100);

    setTimeout(function(){
      animation.resume();
    }, 200);

    animation.on('stop', function (){

      expect(Date.now() - time).to.be.within(300, 340);
      done();
      
    });
    animation.play();

  });

  it('can loop an animation which can be stopped', function (done){

    var lastTick = -1;
    var loopCount = 0;
    var hasLooped = false;


    var animation = new AnimationTimer();
    animation.duration(100);
    animation.on('tick', function (percent){

      if(hasLooped){
        hasLooped = false;
        expect(percent).to.be.lessThan(lastTick);
      } else {
        expect(percent).to.be.greaterThan(lastTick);
      }

      lastTick = percent;

    });
    animation.on('loop', function(){

      loopCount++;
      hasLooped = true;

    });

    setTimeout(function(){
      animation.stop();   
    }, 440);

    animation.on('stop', function (){

      expect(loopCount).to.equal(4);
      done();
      
    });
    animation.loop();

  });

  it('can loop a reverse animation which can be stopped', function (done){

    var lastTick = 2;
    var loopCount = 0;
    var hasLooped = false;


    var animation = new AnimationTimer();
    animation.duration(100);
    animation.on('tick', function (percent){

      if(hasLooped){
        hasLooped = false;
        expect(percent).to.be.greaterThan(lastTick);
      } else {
        expect(percent).to.be.lessThan(lastTick);
      }

      lastTick = percent;

    });
    animation.on('loop', function(){

      loopCount++;
      hasLooped = true;

    });

    setTimeout(function(){
      animation.stop();   
    }, 440);

    animation.on('stop', function (){

      expect(loopCount).to.equal(4);
      done();
      
    });
    animation.loopReverse();

  });

  it('can loop a reverse animation which can be stopped', function (done){

    var lastTick = -1;
    var loopCount = 0;
    var goingForwards = true;


    var animation = new AnimationTimer();
    animation.duration(100);
    animation.on('tick', function (percent){

      if(goingForwards){
        expect(percent).to.be.greaterThan(lastTick);
      } else {
        expect(percent).to.be.lessThan(lastTick);
      }

      lastTick = percent;

    });
    animation.on('bounce', function(){

      loopCount++;
      if (goingForwards){
        lastTick = 2;
      } else {
        lastTick = -1;
      }
      goingForwards = !goingForwards;
    });

    setTimeout(function(){
      animation.stop();   
    }, 440);

    animation.on('stop', function (){

      expect(loopCount).to.equal(4);
      done();
      
    });
    animation.bounce();

  });

});
