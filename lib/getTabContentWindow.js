"use strict";

const sdkTabToXulTab = require('sdkTabToXulTab');
const { getTabContentWindow } = require("tabs/utils");

module.exports = function getSDKTabContentWindow(sdkTab){
    return getTabContentWindow( sdkTabToXulTab(sdkTab) );
};
