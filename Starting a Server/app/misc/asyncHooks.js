/*
 * Async Hooks Example
 *
 */

// Dependencies
const assync_hooks = require('async_hooks');
const fs = require('fs');

// Target execution context
const targetExecutionContext = false;

// Write an arbitrary async function
const whatTimeIsIt = function(callback){
    setInterval(function(){
        fs.writeSync(1,"When the setInterval runs, the execution context is "+assync_hooks.executionAsyncId()+"\n");
        callback(Date.now());
    },1000);
};

// Call that function
whatTimeIsIt(function(time){
    fs.writeSync(1,"The time is "+time+"\n");
});

// Hooks
const hooks = {
    init(asyncId,type,triggerAyncsId,resource){
        fs.writeSync(1,"Hook init "+asyncId+"\n");
    },
    before(asyncId){
        fs.writeSync(1,"Hook before "+asyncId+"\n");
    },
    after(asyncId){
        fs.writeSync(1,"Hook after "+asyncId+"\n");
    },
    destroy(asyncId){
        fs.writeSync(1,"Hook destroy "+asyncId+"\n");
    },
    promiseResolve(asyncId){
        fs.writeSync(1,"Hook promiseResolve "+asyncId+"\n");
    },  
};

// Create a new iAsyncHooks instance
const asyncHook = assync_hooks.createHook(hooks);
asyncHook.enable();
