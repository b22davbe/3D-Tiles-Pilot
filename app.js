// Starta timer direkt när sidan laddas
const startTime = performance.now();
// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MWVmMWFiNi00YWM1LTQxZWUtOTFkYy0xM2M2MmUzYTZjMDIiLCJpZCI6MjgxMDQ1LCJpYXQiOjE3NDEwOTkyNjl9.Ji4X--LQ3PLpuJoBnA-aipNj642E9aSV3SWi-TIP86g";

window.viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
});

viewer.scene.globe.depthTestAgainstTerrain = true;

try {
  const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(69380);
  viewer.scene.primitives.add(tileset);
  await viewer.zoomTo(tileset);

  const checkCesiumReady = setInterval(() => {
    if (window.viewer.scene.frameState.frameNumber > 5) {
      clearInterval(checkCesiumReady);

      const renderTime = Math.round(performance.now() - startTime);
      console.log(` Rendertime: ${renderTime} ms`);

      // 🟢 Skicka eventet så att Userscriptet kan ta
      window.dispatchEvent(new CustomEvent("cesiumRenderTime", { detail: renderTime }));
    }
  }, 100);
} catch (error) {
  console.log(error);
}


