(() => {
    'use strict';
    
    console.log('devtool-content-script');
    //console.log('devtool-content-script', document.readyState, document.documentElement.innerHTML);
    
    self.port.on('graph', g => {
        // Full graph. Replace the existing one.
    })

    self.port.on('graph-delta', g => {
        // Description of modifications to the current graph
    })
    
    document.querySelector('button').addEventListener('click', e => {
        console.log('internal clickGraph');
        
        self.port.emit('clickGraph', 'yo');
    });
    
})()

