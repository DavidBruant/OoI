import {data} from 'sdk/self';
import {Panel} from 'dev/panel';
import {Class} from 'sdk/core/heritage';


/**
 * This object represents a new {@Toolbox} panel
 */
var OoiPanel = new Class({
    extends: Panel,

    label: "OoI",
    tooltip: "Object of Interest",
    icon: "./icon-16.png",
    url: data.url("./ooi-panel.html"),

    /**
     * Executed by the framework when an instance of this panel is created.
     * There is one instance of this panel per {@Toolbox}. The panel is
     * instantiated when selected in the toolbox for the first time.
     */
    initialize: function () {
    },

    /**
     * Executed by the framework when the panel is destroyed.
     */
    dispose: function () {
    },

    /**
     * Executed by the framework when the panel content iframe is
     * constructed. Allows e.g to connect the backend through
     * `debuggee` object
     */
    setup: function () {
        console.log("OoiPanel.setup");

        //this.debuggee = options.debuggee;

        return this;
    },

    onReady: function () {
        console.log("OoiPanel.onReady ", this.debuggee);

    },

    // Chrome <-> Content Communication
    /**
     * Send message to the content scope (see 'frame-script.js'
     * that is responsible for handling them).
     */
    postContentMessage: function(type: string, data: any) {
        var messageManager = this.panelFrame.frameLoader.messageManager;
        messageManager.sendAsyncMessage("message/from/chrome", {
            type: type,
            data: data,
        });
    },
});


export = OoiPanel