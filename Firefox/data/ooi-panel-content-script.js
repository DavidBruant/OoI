'use strict';

console.log('ooi-panel-content-script');

const {content, addMessageListener, sendAsyncMessage, removeMessageListener} = this;

// listen to messages from chrome-side addon and forward to content
addMessageListener('graph-arrived', e => {
    console.log('In ooi panel content script, event', e);

    content.dispatchEvent(new content.MessageEvent('message', { data: e.data }));
});


addEventListener('DOMContentLoaded', e => {
    content.addEventListener('ask-for-graph', e =>{
        console.log('Got the event!', e);
        sendAsyncMessage('ask-for-graph')
    })
}, {once: true})

