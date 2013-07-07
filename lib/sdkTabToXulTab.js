"use strict";


const { getTabs, getTabId } = require('sdk/tabs/utils');

// There are low-level XUL tabs and high-level SDK tabs.
// This function does high-level tab -> low-level tab
module.exports = function sdkTabToXulTab(sdkTab) {
    for (let tab of getTabs())
        if (sdkTab.id === getTabId(tab))
            return tab;

    return null;
}