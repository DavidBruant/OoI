"use strict";

import chr = require("chrome");

var Cu = chr.Cu;

var devtoolsExport = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
var TargetFactory = devtoolsExport.devtools.TargetFactory;

//console.log('devtoolsExp', Object.getOwnPropertyNames(devtoolsExp))
//console.log('devtools', Object.getOwnPropertyNames(devtools))


// Thanks Heather Arthur for the coup de pouce https://gist.github.com/harthur/a66594aed65e331189fd

function isDevToolsOpen(xulTab : XulTab){
    return devtoolsExport.gDevTools._toolboxes.has( TargetFactory.forTab(xulTab) );
}

export = isDevToolsOpen;