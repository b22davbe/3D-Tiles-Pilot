// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MWVmMWFiNi00YWM1LTQxZWUtOTFkYy0xM2M2MmUzYTZjMDIiLCJpZCI6MjgxMDQ1LCJpYXQiOjE3NDEwOTkyNjl9.Ji4X--LQ3PLpuJoBnA-aipNj642E9aSV3SWi-TIP86g";

// Ladda Cesium World Terrain (Ion asset ID 1)
const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

// Skapa Cesium Viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: terrainProvider,
});
viewer.scene.globe.depthTestAgainstTerrain = true;
window.viewer = viewer; // Exponera viewer globalt om du vill

// Fly to Skara Domkyrka
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(13.43450246, 58.38425682, 407.51),
  orientation: {
    heading: Cesium.Math.toRadians(46.79851),
    pitch: Cesium.Math.toRadians(-33.11150),
    roll: 0.00044,
  },
  duration: 2,
});

try {
  const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188); // OSM Buildings
  viewer.scene.primitives.add(tileset);
  await viewer.zoomTo(tileset);

  // Apply default style om det finns extra info
  const extras = tileset.asset.extras;
  if (
    Cesium.defined(extras) &&
    Cesium.defined(extras.ion) &&
    Cesium.defined(extras.ion.defaultStyle)
  ) {
    tileset.style = new Cesium.Cesium3DTileStyle({
      ...extras.ion.defaultStyle,
      show: {
        conditions: [
          // ["${name} === 'Skara Domkyrka'", "false"], // Hides the church from OSM Buildings 
          ["true", "true"],
        ],
      },
    });
  }
} catch (error) {
  console.log(error);
}

// Debugger for setting cameraposition in the flyTo() function

// viewer.camera.changed.addEventListener(() => {
//   const cartesian = viewer.camera.position;
//   const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

//   if (!cartographic) return;

//   const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
//   const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
//   const height = cartographic.height.toFixed(2);

//   const heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(5);
//   const pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(5);
//   const roll = Cesium.Math.toDegrees(viewer.camera.roll).toFixed(5);

//   console.clear();
//   console.log(`cameraposition:`);
//   console.log(`Lon: ${lon}, Lat: ${lat}, Height: ${height}`);
//   console.log(`Heading: ${heading}, Pitch: ${pitch}, Roll: ${roll}`);
// });

