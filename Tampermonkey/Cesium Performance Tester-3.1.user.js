// ==UserScript==
// @name         Cesium Performance Tester
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Automatiserar tester i Cesium och loggar FPS och minnesanvändning
// @match        http://127.0.0.1:5500/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const testRuns = 5; // Choose how many iterations for test

    let results = JSON.parse(localStorage.getItem("results")) || [];
    let currentRun = parseInt(localStorage.getItem("currentRun")) || 0;

    window.addEventListener("cesiumRenderTime", function (event) {
        let renderTime = Math.round(event.detail);
        runTest(renderTime);
    });

    function runTest(renderTime) {
        console.log(`test ${currentRun + 1} of ${testRuns}...`);
        measurePerformance(renderTime);
    }

    function measurePerformance(renderTime) {
        let fpsValues = [];
        let frames = 0;
        let startTime = performance.now();

        function calculateFPS() {
            frames++;
            let now = performance.now();
            let elapsed = now - startTime;

            if (elapsed >= 1000) {
                let fps = frames / (elapsed / 1000);
                fpsValues.push(fps);
                console.log(`FPS: ${Math.round(fps)}`);
                frames = 0;
                startTime = now;
            }

            if (elapsed < 30000) {
                requestAnimationFrame(calculateFPS);
            } else {
                finalizeTest(renderTime, fpsValues);
            }
        }

        setTimeout(() => finalizeTest(renderTime, fpsValues), 30000);
        calculateFPS();
    }

    function finalizeTest(renderTime, fpsValues) {
        if (fpsValues.length === 0) {
            console.warn("Error, no FPS-values collected.");
            return;
        }

        let minFPS = Math.round(Math.min(...fpsValues));
        let maxFPS = Math.round(Math.max(...fpsValues));
        let medianFPS = Math.round(calculateMedian(fpsValues));
        let stdDevFPS = Math.round(calculateStdDev(fpsValues));

        let memoryUsage = window.performance.memory
            ? Math.round(window.performance.memory.usedJSHeapSize / 1048576)
            : "N/A";

        results.push({ renderTime, minFPS, maxFPS, medianFPS, stdDevFPS, memoryUsage });

        currentRun++;
        localStorage.setItem("currentRun", currentRun);
        localStorage.setItem("results", JSON.stringify(results));

        if (currentRun < testRuns) {
            location.reload();
        } else {
            exportResults();
            localStorage.removeItem("currentRun");
            localStorage.removeItem("results");
        }
    }

    function exportResults() {
        let csvContent =
            "data:text/csv;charset=utf-8,RenderTime (ms)\tMin FPS\tMax FPS\tMedian FPS\tStd Dev FPS\tMemory (MB)\n" +
            results.map(e => `${e.renderTime}\t${e.minFPS}\t${e.maxFPS}\t${e.medianFPS}\t${e.stdDevFPS}\t${e.memoryUsage}`).join("\n");

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `test_results_${testRuns}.csv`);
        document.body.appendChild(link);
        link.click();

        console.log(`✅ All tests done! CSV downloaded.`);
    }

    function calculateMedian(arr) {
        const sorted = arr.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    function calculateStdDev(arr) {
        const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
        const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }
})();
