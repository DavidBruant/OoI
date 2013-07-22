var jetpackPromise = require('sdk/core/promise');
var chrome = require('chrome');

var Cu = chrome.Cu;

var EventEmitter = Cu.import("resource:///modules/devtools/shared/event-emitter.js", {}).EventEmitter;

var defer = jetpackPromise.defer;

var OoIPanel = (function () {
    function OoIPanel(panelWin, _toolbox) {
        this.panelWin = panelWin;
        this._toolbox = _toolbox;
        EventEmitter.decorate(this);
    }
    Object.defineProperty(OoIPanel.prototype, "target", {
        get: function () {
            return this._toolbox.target;
        },
        enumerable: true,
        configurable: true
    });

    OoIPanel.prototype.open = function () {
        var def = defer();

        def.resolve(this);

        return def.promise;
    };

    OoIPanel.prototype.destroy = function () {
    };
    return OoIPanel;
})();


module.exports = OoIPanel;

//@ sourceMappingURL=OoIPanel.js.map
