/// <reference path="../defs/e10s.d.ts" />

'use strict';

console.log('ooi-panel-frame-script');

// listen to messages from chrome-side addon and forward to content
addMessageListener('graph-arrived', (e: MessageManagerMessage) => {
    console.log('In ooi panel frame script, event', e);

    content.dispatchEvent(new content.MessageEvent('message', { data: e.data }));
});


addEventListener('DOMContentLoaded', e => {
    content.addEventListener('ask-for-graph', e =>{
        console.log('Got the event!', e);
        sendAsyncMessage('ask-for-graph')
    })
}, {once: true})

