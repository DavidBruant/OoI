/**
 *  SVGPan library 1.2.2
 * ======================
 *
 * Given an unique existing element with id "viewport" (or when missing, the first g
 * element), including the the library into any SVG adds the following capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag with the variables
 * listed in the CONFIGURATION section of this file.
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2.2, xxxx, Andrea Leofreddi
 *	- Fixed viewBox on root tag (#7)
 *	- Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *	- Fixed a regression with mouse wheel (now working on Firefox 5)
 *	- Working with viewBox attribute (#4)
 *	- Added "use strict;" and fixed resulting warnings (#5)
 *	- Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *	Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *	Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *	First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */
(function(global){
    "use strict";

    /// CONFIGURATION
    /// ====>

    var enablePan = 1; // 1 or 0: enable or disable panning (default enabled) // TODO use booleans
    var enableZoom = 1; // 1 or 0: enable or disable zooming (default enabled)
    var enableDrag = 0; // 1 or 0: enable or disable dragging (default disabled)
    var zoomScale = 0.4; // Zoom sensitivity

    /// <====
    /// END OF CONFIGURATION


    var svgRoot = document.querySelector('svg');
    //console.log(svgRoot);
    var zoomRoot = (function getRoot() {
        var r = document.getElementById("viewport");
        var t = r;

        // remove viewBox attributes
        while(t != svgRoot) {
            if(t.getAttribute("viewBox")) {
                setCTM(r, t.getCTM());

                t.removeAttribute("viewBox");
            }

            t = t.parentNode;
        }

        return r;
    })();

    var state = 'none', stateTarget, stateOrigin, stateTf;


    // Register handlers
    svgRoot.addEventListener('mouseup', handleMouseUp);
    svgRoot.addEventListener('mousedown', handleMouseDown);
    svgRoot.addEventListener('mousemove', handleMouseMove);
    // svgRoot.addEventListener('mouseout', handleMouseUp); // uncomment this to stop the pan functionality when dragging out of the SVG element

    // TODO use standard wheel event https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel
    //if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) // TODO feature detection instead of ua sniffing
      //  window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari // TODO remove false
    //else
    //svgRoot.addEventListener('DOMMouseScroll', handleMouseWheel); // Others
    svgRoot.addEventListener('wheel', handleMouseWheel);

    /**
     * Instance an SVGPoint object with given event coordinates.
     */
    function getEventPoint(e) {
        var svgCoords = svgRoot.getBoundingClientRect();
        var p = svgRoot.createSVGPoint();

        p.x = e.clientX;
        p.y = e.clientY;

        return p;
    }

    /**
     * Sets the current transform matrix of an element.
     */
    function setCTM(element, matrix) {
        var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

        element.setAttribute("transform", s);
    }

    /**
     * Dumps a matrix to a string (useful for debug).
     */
    function dumpMatrix(matrix) {
        var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "\n  0, 0, 1 ]";

        return s;
    }

    /**
     * Handle mouse wheel event.
     */
        // TODO slow on the tiger. Find out if it can be improved
    function handleMouseWheel(e) {
        if(!enableZoom)
            return;

        e.preventDefault();

        // var svgDoc = evt.target.ownerDocument;

        var delta;

        if(e.type === "wheel" && e.deltaY){
            delta = e.deltaY / -9;
        }
        else{ // non standard shit
            if(e.wheelDelta) // TODO ? : ;
                delta = e.wheelDelta / 360; // Chrome/Safari
            else
                delta = e.detail / -9; // Mozilla
        }

        //console.log('delta', delta);

        var z = Math.pow(1 + zoomScale, delta);

        var g = zoomRoot;

        var p = getEventPoint(e);

        p = p.matrixTransform(g.getCTM().inverse());

        // Compute new scale matrix in current mouse position
        var k = svgRoot.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

        setCTM(g, g.getCTM().multiply(k));

        if(stateTf === undefined)
            stateTf = g.getCTM().inverse();

        stateTf = stateTf.multiply(k.inverse());
    }

    /**
     * Handle mouse move event.
     */
    function handleMouseMove(e) {
        //console.log('svgpan mouse move')
        e.preventDefault();

        var g = zoomRoot;

        if(state == 'pan' && enablePan) {
            // Pan mode
            var p = getEventPoint(e).matrixTransform(stateTf);

            setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
        } else if(state == 'drag' && enableDrag) {
            // Drag mode
            var p = getEventPoint(e).matrixTransform(g.getCTM().inverse());

            setCTM(stateTarget, svgRoot.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

            stateOrigin = p;
        }
    }

    /**
     * Handle click event.
     */
    function handleMouseDown(e) {
        e.preventDefault();

        var g = zoomRoot;
        console.log('typeof g.getCTM', g, typeof g.getCTM);

        if(
            e.target.tagName == "svg"
                || !enableDrag // Pan anyway when drag is disabled and the user clicked on an element
            ) {
            // Pan mode
            state = 'pan';

            stateTf = g.getCTM().inverse();

            stateOrigin = getEventPoint(e).matrixTransform(stateTf);
        } else {
            // Drag mode
            state = 'drag';

            stateTarget = e.target;

            stateTf = g.getCTM().inverse();

            stateOrigin = getEventPoint(e).matrixTransform(stateTf);
        }
    }

    /**
     * Handle mouse button release event.
     */
    function handleMouseUp(e) {
        e.preventDefault();

        if(state == 'pan' || state == 'drag') {
            // Quit pan mode
            state = '';
        }
    }



})(this);