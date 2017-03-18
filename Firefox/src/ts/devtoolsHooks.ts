import {Cu} from 'chrome'
import {data} from 'sdk/self';

const {gDevTools} = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});

export default {

    initialize: function (onGraph: (g: Graph) => void) {
        this.onToolboxCreated = function(e: any, toolbox: Toolbox) {
            var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;

            correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);
            correspondingTabMM.addMessageListener('graph', (m: MessageManagerMessage) => onGraph(m.data))
        };
        gDevTools.on("toolbox-created", this.onToolboxCreated);
    },

    shutdown: function () {
        gDevTools.off("toolbox-created", this.onToolboxCreated);
        this.onToolboxCreated = undefined;
    }

}
