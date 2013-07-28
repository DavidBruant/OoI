/// <reference path="./defs/devtoolsDefs.d.ts" />
/// <reference path="./defs/jetpack-promise.d.ts" />
/// <reference path="./defs/jetpack-chrome.d.ts" />

import jetpackPromise = require('sdk/core/promise');
import chrome = require('chrome')

var Cu = chrome.Cu;

var EventEmitter = Cu.import("resource:///modules/devtools/shared/event-emitter.js", {}).EventEmitter;

var defer = jetpackPromise.defer;

class OoIPanel /* +should implements JetPackEventTarget*/{
    constructor(
        public panelWin : HTMLIFrameElement,
        public _toolbox : DevToolsToolbox)
    {
        EventEmitter.decorate(this);
    }

    get target() { return this._toolbox.target; }

    open(){
        var def = defer();
        // returning undefined may be the cause of a Devtools bug. Investigate. Return a JetpackPromise<Panel>
        // https://github.com/mozilla/mozilla-central/blob/91dff2cc04601096b2481081faec21b5aab62a15/browser/devtools/framework/toolbox.js#L463

        def.resolve(this);

        return def.promise;
    }

    destroy(){

    }
}

export = OoIPanel