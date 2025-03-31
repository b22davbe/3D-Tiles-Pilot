// ==UserScript==
// @name         Userinteraction Cesium - Skara Domkyrka
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Script that rotates while zooming in and out on Skara Domkyrka
// @author
// @match        http://127.0.0.1:5500/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Vänta tills Cesium-viewer är tillgänglig
    function waitForViewer(callback) {
        if (window.viewer && window.viewer.camera) {
            callback(window.viewer);
        } else {
            setTimeout(() => waitForViewer(callback), 100);
        }
    }

    waitForViewer((viewer) => {
        // Lyssna på att kameran slutar röra sig (t.ex. efter flyTo)
        const moveEndHandler = () => {
            // Ta bort lyssnaren så att den bara körs en gång
            viewer.camera.moveEnd.removeEventListener(moveEndHandler);

            // Definiera kyrkecentralen
            const churchCenter = Cesium.Cartesian3.fromDegrees(13.43932313, 58.38658302, 153.34);

            // Starta animationen efter 3 sekunders fördröjning
            setTimeout(() => {
                // Hämta den aktuella offseten vid animationens start
                const currentOffset = Cesium.Cartesian3.subtract(
                    viewer.camera.position,
                    churchCenter,
                    new Cesium.Cartesian3()
                );
                // Beräkna basvinkeln (i XY-planet) utifrån currentOffset
                const baseAngle = Math.atan2(currentOffset.y, currentOffset.x);
                // Beräkna horisontell distans (XY-magnitud)
                const horizontalDistance = Math.sqrt(
                    currentOffset.x * currentOffset.x + currentOffset.y * currentOffset.y
                );
                // Bevara den vertikala offseten (om du vill att den ska vara konstant)
                const verticalOffset = currentOffset.z;

                // Animationsparametrar
                const rotationPeriod = 20000; // ms för ett helt varv
                const zoomPeriod = 10000;     // ms för en zoomcykel
                const zoomAmplitude = 0.8;    // zoom-amplitud

                const startTime = performance.now();

                function animate() {
                    const elapsed = performance.now() - startTime;
                    // Relativ rotationsvinkel (i radianer) baserat på tid
                    const relativeAngle = Cesium.Math.toRadians(
                        (360 * (elapsed % rotationPeriod)) / rotationPeriod
                    );
                    // Slutvinkeln blir basvinkeln plus den relativa rotationen
                    const finalAngle = baseAngle + relativeAngle;
                    // Beräkna zoom-faktor med sinusfunktion
                    const zoomFactor = 1 + zoomAmplitude * Math.sin((2 * Math.PI * elapsed) / zoomPeriod);
                    // Skalad horisontell distans med zoom
                    const finalHorizontalDistance = horizontalDistance * zoomFactor;

                    // Bygg den slutgiltiga offseten: rotera i XY-planet, bevara (eventuellt) konstant höjd
                    const finalOffset = new Cesium.Cartesian3(
                        finalHorizontalDistance * Math.cos(finalAngle),
                        finalHorizontalDistance * Math.sin(finalAngle),
                        verticalOffset  // Ändra gärna till verticalOffset * zoomFactor om du vill zooma även vertikalt
                    );

                    // Uppdatera kameran så att den tittar på kyrkecentralen med den beräknade offseten
                    viewer.camera.lookAt(churchCenter, finalOffset);
                    requestAnimationFrame(animate);
                }

                animate();
            }, 2000);
        };

        // Lägg till lyssnaren så att rotationen startar när flyTo avslutas
        viewer.camera.moveEnd.addEventListener(moveEndHandler);
    });
})();
