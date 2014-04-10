"use strict";

import sdkTabToXulTab = require('sdkTabToXulTab');
import utils = require("sdk/tabs/utils");
var getTabContentWindow = utils.getTabContentWindow;


function getSDKTabContentWindow(sdkTab: SdkTab){
    return getTabContentWindow( sdkTabToXulTab(sdkTab) );
}

export = getSDKTabContentWindow;