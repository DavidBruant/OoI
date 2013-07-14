"use strict";

import sdkTabToXulTab = require('sdkTabToXulTab');
import utils = require("tabs/utils");
var getTabContentWindow = utils.getTabContentWindow;


function getSDKTabContentWindow(sdkTab){
    return getTabContentWindow( sdkTabToXulTab(sdkTab) );
}

export = getSDKTabContentWindow;