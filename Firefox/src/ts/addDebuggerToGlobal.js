/*
    Compiling TypeScript with browserify leads to a CommonJS-related prologue
    This prevents access to the global this in a frame script.
    This file is meant to be preprended to what's generated by browserify
 */
'use strict';

Components.utils.import("resource://gre/modules/jsdebugger.jsm", {}).addDebuggerToGlobal(this);