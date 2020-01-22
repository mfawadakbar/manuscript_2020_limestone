var roi = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.MultiPoint(
        [[72.8569507902588, 33.846128436459566],
         [72.8753110329269, 33.82922728668108]]),
    DSregion = 
    /* color: #102ad6 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[72.85542612651057, 33.86657236776155],
          [72.85542612651057, 33.81267642754365],
          [72.95155649760432, 33.81267642754365],
          [72.95155649760432, 33.86657236776155]]], null, false);
      
  var area = ee.Geometry.Rectangle([72.836, 33.822,73.002,33.900]);
            //LOAD PREFILTERED IMAGES OF ALL THREE DATASETS
// Load a ASTER image, select the bands of interest.
var asterImage = ee.Image('ASTER/AST_L1T_003/20070415055955')    // Filtered Image of ASTER L1T
var asterBands = ['B04', 'B06', 'B07', 'B08', 'B13', 'B14'];
// Load a Sentinel - 2 image, select the bands of interest.
var sentImage = ee.Image('COPERNICUS/S2_SR/20181227T055231_20181227T055233_T43SCT')// Filtered Image of Sentinel- 2 MSI L2A   
var sentBands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'];
// Load a Landsat 8 image, select the bands of interest.
var landImage = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_150036_20140410') // Filtered Image of Landsat - 8 OLI Raw Scenes
var landBands = ['B2', 'B3', 'B4', 'B7', 'B10', 'B11'];

            //FUNCTIONS DEFINITION
// Decorrelation Stretching Main Function     
function decStr(bandsImage, location, scale) {
  var bandNames = bandsImage.bandNames();
  // Naming the axis for intuition
  var dataAxis = 0;
  var bandsAxis = 1;
  // Calculate the mean for each band image
  var meansAll = bandsImage.reduceRegion(ee.Reducer.mean(), location, scale);
  // Generate an array (1D Matrix) of mean of each band
  var arrayOfmeans = ee.Image(meansAll.toArray());
  // Collapse the bands data such that each pixel is a matrix of pixel values of each band
  var pixelArrays = bandsImage.toArray();
  // Use the means array and the collapsed band data to center each pixel of each band by subtracting its corresponding mean from it
  var meanCent = pixelArrays.subtract(arrayOfmeans);
  // Calculate the Covariance matrix for the bands data
  var covar = meanCent.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
    geometry: location,
    scale: scale
  });
  
  // Get the covariance in array format which shows the band-band covarince of the data
  var covarArray = ee.Array(covar.get('array'));
  // Perform eigen decomposition of the covariance matrix to obtain eigen values and eigen vector pairs
  var eigenPairs = covarArray.eigen();
  var eigenValues = eigenPairs.slice(bandsAxis, 0, 1); // slice(axis, start, end, step)
  var eigenVectors = eigenPairs.slice(bandsAxis, 1);
  // Rotate by the eigenvectors, scale to a variance of 30, and rotate back.
  //Store a diagonal matrix in i
  var i = ee.Array.identity(bandNames.length()); // i will be used to isolate each band data and scale its variance e.g i = [1,0,0,0,0] = isolate first band from 5 bands
  // Calculate variance from the eigenvalues ---> variance = 1/sqrt(eigenvalues)
  // matrixToDiag = Computes a square diagonal matrix from a single column matrix for multiplication purposes
  var variance = eigenValues.sqrt().matrixToDiag();
  //Multiply diagonal matrix i by 30 and divide by vaiance to obtain scaling variance matrix
  var scaled = i.multiply(30).divide(variance); //Changed from 30 -> 50, It was observed that changing variance scale increases contrast. Best contrast obtained for 30
  // Calculate a rotation matrix ---> rotationMatrix =  Eigenvect.Transpose * ScaledVariance * Eigenvect
  var rotation = eigenVectors.transpose()
    .matrixMultiply(scaled)
    .matrixMultiply(eigenVectors);
  // Convert 1-D nomalized array image data to 2-D and transpose it so it can be multiplied with rotation matrix
  var transposed = meanCent.arrayRepeat(bandsAxis, 1).arrayTranspose();
  // Multiply the transposed data with the rotation matrix
  return transposed.matrixMultiply(ee.Image(rotation))
    .arrayProject([bandsAxis])   //This drop unecessary axis from the transposed data and only retains 2 axis
    .arrayFlatten([bandNames])  //Flatten collections of collections
    .add(127).byte(); // Conver pixel values to 127 means so it can be visualized between 0 - 255 range.
    
    // .byte is used to force element wise operation
}
// Principal Component Analysis Main Function
function PCA(meanCent, scale, location) {
  // Flatten the band image data in from 2D to a 1D array
  var arrays = meanCent.toArray();
  print('PCA applying on', meanCent);
  // Calculate the covariance matrix for the bands data of the region
  var covar = arrays.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
    geometry: location,
    scale: scale,
    maxPixels: 1e9
  });
  // Get the band to band covariance of the region in 'array' format. Here .get('array') --> casts to an array
  var covarArray = ee.Array(covar.get('array'));
  // Perform an eigen analysis and slice apart the values and vectors.
  var eigenPairs = covarArray.eigen();
  // This is a P-length vector of Eigenvalues. Here P = number of PCs
  var eigenValues = eigenPairs.slice(1, 0, 1);
  // This is a PxP matrix with eigenvectors in rows.
  var eigenVectors = eigenPairs.slice(1, 1);
  //Print and store eigen pairs in eigenCollection variable and export to drive
  print('eigen Values', eigenValues);
  print('eigen Vector', eigenVectors);
    //Make feature collection out of eigenpairs so it can be exported to excel. From there we Convert it to a table using a python script
  eigenCollection = ee.Feature(null,{values:ee.Array.cat([eigenValues,eigenVectors],1)}); 
  print('Eigen Collection Length',eigenCollection);
    // Export the FeatureCollection to excel sheet in drive
  Export.table.toDrive({
  collection: ee.FeatureCollection([eigenCollection]),
  description: 'eigenAnalysis',
  fileFormat: 'CSV'
  });
  // Convert the 1D image array back to 2D matrix for multiplication
  var imageMat = arrays.toArray(1);
  // To obtain PC = EigenVectors * 2D Image Matrix
  var PCs = ee.Image(eigenVectors).matrixMultiply(imageMat);
  // Turn the square roots of the Eigenvalues into a P-band image.
  var sdImage = ee.Image(eigenValues.sqrt())
    .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);
  // Turn the PCs into a P-band image, normalized by SD.
  return PCs
    // Throw out an an unneeded dimension, [[]] -> [].
    .arrayProject([0])
    // Make the one band array image a multi-band image, [] -> image.
    .arrayFlatten([getNewBandNames('pc')])
    // Normalize the PCs by their SDs.
    .divide(sdImage);
}
//Function to get band names
var getNewBandNames = function(prefix) {
  var seq = ee.List.sequence(1, bandNames.length());
  return seq.map(function(b) {
    return ee.String(prefix).cat(ee.Number(b).int());
  });
};
// Plot Insividual PC images as Individual layers


              //APPLYING DS ON ALL DATA
// Selecting bands to apply DS
var asterBandsImage = asterImage.select(asterBands);
var sentBandsImage = sentImage.select(sentBands);
var landBandsImage = landImage.select(landBands);
//Obtain DS Results for All Satelites using dcs function
var DSaster = decStr(asterBandsImage, DSregion, 1000);
var DSsent = decStr(sentBandsImage, DSregion, 1000);
var DSlandsat = decStr(landBandsImage, DSregion, 1000);

//Ignore this, this is only used to avoid errors while concatinting eigen pairs
var eigenCollection = ee.Array([[0],[1],[2],[3],[4]]);


             //APPLYING PCA ON ASTER L1T
var region = asterImage.geometry();
var image =  asterImage.select(asterBands);
var scale = 30;
var bandNames = image.bandNames();
var meanDict = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: scale,
    maxPixels: 1e9
});
var means = ee.Image.constant(meanDict.values(bandNames));
var centered = image.subtract(means);
var pcImage = PCA(centered, scale, region);
Map.addLayer(pcImage, {bands: ['pc6', 'pc4', 'pc2'], min: -2, max: 2}, 'ASTER L1T  PCA (PC6,PC4,PC2)');

for (var i = 0; i < bandNames.length().getInfo(); i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  //Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band); //Uncomment this line to visualize individual PCs
}



             //APPLYING PCA ON SENTINEL - 2 MSI L2A
var region = sentImage.geometry();
var image =  sentImage.select(sentBands);
var scale = 30;
var bandNames = image.bandNames();
var meanDict = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: scale,
    maxPixels: 1e9
});
var means = ee.Image.constant(meanDict.values(bandNames));
var centered = image.subtract(means);
var pcImage = PCA(centered, scale, region);
Map.addLayer(pcImage, {bands: ['pc5', 'pc3', 'pc2'], min: -2, max: 2}, 'Sentinel 2 L2C - PCA (PC5,PC3,PC2)');

for (var i = 0; i < bandNames.length().getInfo(); i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  //Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band); //Uncomment this line to visualize individual PCs
}


             //APPLYING PCA ON LANDSAT - 8 OLI RAW
var region = landImage.geometry();
var image =  landImage.select(landBands);
var scale = 30;
var bandNames = image.bandNames();
var meanDict = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: scale,
    maxPixels: 1e9
});
var means = ee.Image.constant(meanDict.values(bandNames));
var centered = image.subtract(means);
var pcImage = PCA(centered, scale, region);
Map.addLayer(pcImage, {bands: ['pc5', 'pc4', 'pc2'], min: -2, max: 2}, 'Landsat - 8 - PCA (PC5,PC4,PC2)'); 

for (var i = 0; i < bandNames.length().getInfo(); i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  //Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band); //Uncomment this line to visualize individual PCs
}

Map.addLayer(ee.Image().paint(area, 0, 2), {}, 'Region');
Map.setCenter(72.8622547123706,33.84620015218969, 13.3);
