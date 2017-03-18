/// <reference path="./defs/typings.d.ts" />

import {data} from 'sdk/self';
import {Cu} from 'chrome';
import {viewFor as frameForPanel} from 'sdk/view/core';
import {setup} from 'sdk/core/disposable';

import OoIPanel from './OoIPanel';
//import devtoolsHooks from './devtoolsHooks';
//import getObjectCreationsLocations from './getObjectCreationsLocations';

const {gDevTools} = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});


var OOI_PANEL_ID = 'ooi';
var OOI_PANEL_ID_READY_EVENT = OOI_PANEL_ID + '-ready';


function ooiPanelMessageManager(toolbox: Toolbox, panel: Panel){

    return new Promise<MessageManager>(resolve => {
        toolbox.on(OOI_PANEL_ID_READY_EVENT, function (ev) {
            console.log(OOI_PANEL_ID_READY_EVENT, 'event');

            var ooiPanelFrame = frameForPanel(panel);
            var ooiPanelMM = ooiPanelFrame.frameLoader.messageManager;

            ooiPanelMM.loadFrameScript(data.url("ooi-panel-content-script.js"), false);

            resolve(ooiPanelMM);
        });
    });


}



export function main() {

    gDevTools.registerTool({
        id: OOI_PANEL_ID,
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: "about:blank",
        label: "Object of Interest",
        isTargetSupported: ((target: DevtoolTarget) => true), // Tool not registered if this function isn't set
        build: function (window: Window, toolbox: Toolbox) {
            console.log('OoiTool build');

            var ooiPanel: OoiPanel = (<any>OoIPanel)();
            setup(ooiPanel, { window: window, toolbox: toolbox, url: ooiPanel.url });
            ooiPanel.ready();

            // Send content script to tab
            var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;
            correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);

            // Send content script to ooi panel
            var ooiPanelMMP = ooiPanelMessageManager(toolbox, ooiPanel);
            ooiPanelMMP.then(ooiPanelMM => {
                ooiPanelMM.addMessageListener('ask-for-graph', () => {
                    correspondingTabMM.sendAsyncMessage('compute-graph-now');
                })
            })

            // hook events between contexts
            correspondingTabMM.addMessageListener('graph', m => {
                var graph = m.data;
                ooiPanelMMP.then(ooiPanelMM => {
                    ooiPanelMM.sendAsyncMessage('graph-arrived', graph);
                })
            });

            return ooiPanel;
        }
    });

    console.info('OoI addon loaded');
}

function onUnload(/*reason*/) {
    //devtoolsHooks.shutdown(reason);
}

// Exports from this module
exports.onUnload = onUnload;


