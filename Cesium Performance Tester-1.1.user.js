// ==UserScript==
// @name         Cesium Performance Tester
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Mäter hur många ms det tar för sidan att helt ladda in (load time) per test, samt FPS och minnesanvändning, med avrundade värden.
// @match        http://127.0.0.1:5500/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const testRuns = 5; // Antal testomgångar

    let results = JSON.parse(localStorage.getItem("results")) || [];
    let currentRun = parseInt(localStorage.getItem("currentRun")) || 0;

    // Funktion för att mäta page load time (mellan navigationStart och loadEventEnd) och avrunda till närmaste ms
    function measurePageLoadTime() {
        let loadTime = 0;
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries && navEntries.length > 0) {
            loadTime = navEntries[0].loadEventEnd;
        } else {
            loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        }
        return Math.round(loadTime);
    }

    // Kör testet när sidan är helt inladdad
    function runTest() {
        const renderTime = measurePageLoadTime();
        console.log(`Page load time: ${renderTime} ms`);

        // Starta FPS-mätning i 15 sekunder
        measureFPS(renderTime);
    }

    // Mäter FPS under 15 sekunder och anropar sedan finalizeTest()
    function measureFPS(renderTime) {
        let fpsValues = [];
        let frames = 0;
        let startTime = performance.now();
        const globalStartTime = performance.now();

        function calculateFPS() {
            frames++;
            const now = performance.now();
            const elapsed = now - startTime;

            if (elapsed >= 1000) {
                const fps = frames / (elapsed / 1000);
                fpsValues.push(fps);
                console.log(`FPS: ${Math.round(fps)}`);
                frames = 0;
                startTime = now;
            }

            if (performance.now() - globalStartTime < 15000) {
                requestAnimationFrame(calculateFPS);
            } else {
                finalizeTest(renderTime, fpsValues);
            }
        }
        calculateFPS();
    }

    function finalizeTest(renderTime, fpsValues) {
        if (fpsValues.length === 0) {
            console.warn("Error, no FPS-values collected.");
            return;
        }

        const minFPS = Math.round(Math.min(...fpsValues));
        const maxFPS = Math.round(Math.max(...fpsValues));
        const medianFPS = Math.round(calculateMedian(fpsValues));
        const stdDevFPS = Math.round(calculateStdDev(fpsValues));

        const memoryUsage = window.performance.memory
            ? Math.round(window.performance.memory.usedJSHeapSize / 1048576)
            : "N/A";

        results.push({ renderTime, minFPS, maxFPS, medianFPS, stdDevFPS, memoryUsage });

        currentRun++;
        localStorage.setItem("currentRun", currentRun);
        localStorage.setItem("results", JSON.stringify(results));

        if (currentRun < testRuns) {
            // Ladda om sidan för nästa testomgång
            location.reload();
        } else {
            exportResults();
            localStorage.removeItem("currentRun");
            localStorage.removeItem("results");
        }
    }

    function exportResults() {
        const csvContent =
            "data:text/csv;charset=utf-8,Load Time (ms)\tMin FPS\tMax FPS\tMedian FPS\tStd Dev FPS\tMemory (MB)\n" +
            results.map(e => `${e.renderTime}\t${e.minFPS}\t${e.maxFPS}\t${e.medianFPS}\t${e.stdDevFPS}\t${e.memoryUsage}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `test_results_${testRuns}.csv`);
        document.body.appendChild(link);
        link.click();

        console.log("✅ All tests done! CSV downloaded.");
    }

    function calculateMedian(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    function calculateStdDev(arr) {
        const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
        const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }

    // Om sidan redan är klar, kör runTest direkt, annars vänta på load-eventet.
    if (document.readyState === "complete") {
        runTest();
    } else {
        window.addEventListener("load", runTest);
    }
})();
