"use strict";

import chr = require("chrome");

var Cu = chr.Cu;

var devtools = Cu.import("resource:///modules/devtools/gDevTools.jsm", {}).devtools;
var TargetFactory = devtools.TargetFactory;

// Thanks Heather Arthur for the coup de pouce https://gist.github.com/harthur/a66594aed65e331189fd

function isDevToolsOpen(xulTab : XulTab){
    return devtools.gDevTools._toolboxes.has( TargetFactory.forTab(xulTab) );
}

export = isDevToolsOpen;