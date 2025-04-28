// Sätt din Cesium Ion-token (använd den token du har för att få åtkomst till Cesium World Terrain)
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YmU5ZjJhNy0wMzA3LTQxNGItYTc0Zi0zYWFiZWY2MjE0NTMiLCJpZCI6MjgxMDQ1LCJpYXQiOjE3NDQxOTA3NTd9.ELpvWBvugoiGaQJkcJLmUcLMcN0gnhmgE9jT2BOVgko";

// Kör en IIFE för async/await
(async function() {
  // Ladda Cesium World Terrain (Ion asset ID 1)
  const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

  // Skapa Cesium Viewer
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: terrainProvider,
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  window.viewer = viewer; // Exponera viewer globalt om du vill

  // Flyga till en övergripande vy a kyrkan
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(13.43450246, 58.38425682, 407.51),
    orientation: {
      heading: Cesium.Math.toRadians(46.79851),
      pitch: Cesium.Math.toRadians(-33.11150),
      roll: 0.00044,
    },
    duration: 2,
  });

  // Array med dina 9 assets (Church1–Church9) och deras Ion-ID:n
  const churchAssetIDs = [
    3289001, // Church1
    3289004, // Church2
    3289006, // Church3
    3289029, // Church4
    3289031, // Church5
    3289035, // Church6
    3289037, // Church7
    3289039, // Church8
    3289041, // Church9
  ];

  // Variabel som bestämmer hur många av kyrkorna du vill ladda
  // (Se till att inte överskrida arrayens längd)
  const howMany = 9; 

  /**
   * Laddar in en tileset (3D Tiles) från Ion med rätt koordinater redan lagrade
   * i Ion. Vi gör alltså inga extra positionsberäkningar, utan litar på att
   * modellen är placerad rätt i Ion.
   */
  async function loadChurch(assetId) {
    try {
      const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(assetId);
      viewer.scene.primitives.add(tileset);
      console.log(`Loaded church with asset ID: ${assetId}`);
    } catch (error) {
      console.error(`Error loading church (assetId: ${assetId}):`, error);
    }
  }

  // Ladda in "howMany" av kyrkorna i arrayen
  for (let i = 0; i < howMany; i++) {
    if (i < churchAssetIDs.length) {
      const assetId = churchAssetIDs[i];
      await loadChurch(assetId);
    }
  }

  setTimeout(() => {
    console.log("Alla kyrkor laddade!");
    document.dispatchEvent(new CustomEvent("allChurchesLoaded"));
  });
})();
