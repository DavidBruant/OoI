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



/**
 * Listener for message from the inspector panel (chrome scope).
 */
/*function messageListener(message) {
    const { type, data } = message.data;

    console.log("Message from chrome:", data);
};

addMessageListener("message/from/chrome", messageListener);


// Clean up
content.addEventListener("unload", event => {
    removeMessageListener("message/from/chrome", messageListener);
})


// Send a message back to the parent panel (chrome scope).
function postChromeMessage(type, data) {
    sendAsyncMessage("message/from/content", {
        type: type,
        data: data,
    });
}

/**
 * TEST: Send a test message to the chrome scope when
 * the user clicks within the frame.
 */
/*content.addEventListener("click", event => {
    postChromeMessage("click", "Hello from content scope!");
})

document.querySelector('button').addEventListener('click', e => {
    console.log('button', 'yo');
});

document.body.append('COUCOU !');*/

// TODO send message to content. https://github.com/firebug/pixel-perfect/blob/master/data/popup-frame-script.js




