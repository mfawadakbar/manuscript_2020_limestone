var region = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[72.83976177206455, 33.88146159491632],
          [72.83976177206455, 33.7902051734997],
          [72.9582081221622, 33.7902051734997],
          [72.9582081221622, 33.88146159491632]]], null, false),
    aster = ee.Image("ASTER/AST_L1T_003/20070415055955"),
    landsat = ee.Image("LANDSAT/LC08/C01/T1_RT/LC08_150037_20180421"),
    sent = ee.ImageCollection("COPERNICUS/S2_SR"),
    roi = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.Geometry.MultiPoint(
        [[72.86937868985217, 33.84498909373099],
         [72.78097523398117, 33.837793980733714],
         [72.92180938153297, 33.73052351559353],
         [72.75426787762672, 33.75293447785871],
         [72.79066008954078, 33.766492407384966],
         [72.78571396379414, 33.81987294961306],
         [72.73721650843754, 33.82447998252083],
         [72.96827272181645, 33.86040942491615],
         [72.58649257352431, 33.83874458405281]]);
 
 
      //Clustering Results of Sentinel - 2, ASTER, Landsat - 8 for Hattar Region

//Region of Interest in Hattar
var area = ee.Geometry.Rectangle([72.836, 33.822,73.002,33.900]);

//Filtering and selecting Sentinel - 2 Image
var sentinel = ee.Image(sent
.filterDate("2015-01-01", "2019-04-29")
.sort('CLOUD_COVERAGE_ASSESSMENT')
.filterBounds(roi)
.first());
print("Sentinel 2 Scene", sentinel);

//Landsat and ASTER filetered images have been imported in the "imports" section

      //Sentinel - 2 Clustering
// Make the training dataset.
var training = sentinel.sample({
  region: region,
  scale: 20,
  numPixels: 5000
});

// Instantiate the clusterer and train it.
var clusterer = ee.Clusterer.wekaXMeans(2,30).train(training);
print('WekaXMeans Clusterer:', clusterer);
// Cluster the input using the trained clusterer.
var result = sentinel.cluster(clusterer);
print('Sentinel WekaXMeans', result)
// Display the clusters with random colors.
Map.addLayer(result.randomVisualizer(), {}, 'Sentinel WekaXMeans Results');

      //Landsat Clustering
// Make the training dataset.
var training = landsat.sample({
  region: region,
  scale: 20,
  numPixels: 5000
});

// Instantiate the clusterer and train it.
var clusterer = ee.Clusterer.wekaXMeans(2,30).train(training);

// Cluster the input using the trained clusterer.
var result = landsat.cluster(clusterer);
print('Landsat WekaXMeans', result)
// Display the clusters with random colors.
Map.addLayer(result.randomVisualizer(), {}, 'Landsat WekaXMeans Results');

      //ASTER Clustering
// Make the training dataset.
var training = aster.sample({
  region: region,
  scale: 20,
  numPixels: 5000
});

// Instantiate the clusterer and train it.
var clusterer = ee.Clusterer.wekaXMeans(2,30).train(training);

// Cluster the input using the trained clusterer.
var result = aster.cluster(clusterer);
//
print('ASTER WekaXMeans', result)
// Display the clusters with random colors.
Map.addLayer(result.randomVisualizer(), {}, 'ASTER WekaXMeans Results');


//Printing region and centering map
Map.addLayer(ee.Image().paint(area, 0, 2), {}, 'Study Region');
Map.setCenter(72.88960418818737,33.820013772390006, 13.3);
