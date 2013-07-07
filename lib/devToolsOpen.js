"use strict";

// Thanks Heather Arthur for the coup de pouce https://gist.github.com/harthur/a66594aed65e331189fd

const {Cu} = require("chrome");
let {devtools} = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const TargetFactory = devtools.TargetFactory;

module.exports = function(devtools, xulTab){
    return devtools.gDevTools._toolboxes.has( TargetFactory.forTab(xulTab) );
};