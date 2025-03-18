// ==UserScript==
// @name         Cesium user simulator
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Simulerar mjuk in- och utzoomning i Cesium
// @match        http://127.0.0.1:5500/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function waitForCesiumViewer(callback) {
        let checkInterval = setInterval(() => {
            if (window.viewer && window.viewer.camera) {
                clearInterval(checkInterval);
                setTimeout(callback, 3000); // Vänta 3 sekunder innan start
            }
        }, 500);
    }

    function smoothInterpolate(start, end, duration, callback, onComplete) {
        let startTime = performance.now();

        function step() {
            let elapsed = performance.now() - startTime;
            let t = Math.min(elapsed / duration, 1);
            let value = start + (end - start) * t;

            callback(value);

            if (t < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        }

        requestAnimationFrame(step);
    }

    function startZoomOscillation() {
        const camera = window.viewer.camera;
        const initialPosition = camera.positionCartographic.clone(); // Spara startposition

        function zoomCycle() {
            let zoomAmount = Math.random() * 30 + 70; // Sets the zoom
            let randomHeading = camera.heading + (Math.random() * 0.6 - 0.3); // Roterar mellan -0.3 och +0.3 radianer

            smoothInterpolate(0, zoomAmount, 2000, (value) => camera.zoomIn(value), () => {
                setTimeout(() => {
                    smoothInterpolate(zoomAmount, 0, 2000, (value) => camera.zoomOut(value), () => {
                        camera.setView({
                            destination: Cesium.Cartesian3.fromRadians(initialPosition.longitude, initialPosition.latitude, initialPosition.height),
                            orientation: { heading: randomHeading, pitch: camera.pitch, roll: camera.roll }
                        });

                        setTimeout(zoomCycle, 1000); // Vänta 3 sekunder innan nästa cykel
                    });
                }, 2000); // Vänta mellan zoom-in och zoom-out
            });
        }

        zoomCycle();
    }

    waitForCesiumViewer(startZoomOscillation);
})();
