/// <reference path="./defs/jetpack-tabs.d.ts" />

"use strict";

import tabsUtils = require('sdk/tabs/utils');
var getTabs = tabsUtils.getTabs;
var getTabId = tabsUtils.getTabId;

// There are low-level XUL tabs and high-level SDK tabs.
// This function does high-level tab -> low-level tab
// https://groups.google.com/d/msg/mozilla-labs-jetpack/F1scPBoCCVU/IF2LFWSZkCkJ
function sdkTabToXulTab(sdkTab : SdkTab) : XulTab{
    var foundTab;

    getTabs().forEach((tab) => {
        if (sdkTab.id === getTabId(tab))
            foundTab = tab;
    });

    return foundTab;
}

export = sdkTabToXulTab;