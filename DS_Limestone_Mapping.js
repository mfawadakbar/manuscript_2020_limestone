var aster = ee.ImageCollection("ASTER/AST_L1T_003"),
    sentinel = ee.ImageCollection("COPERNICUS/S2_SR"),
    landsat = ee.ImageCollection("LANDSAT/LC08/C01/T1_RT"),
    region = /* color: #d63000 */ee.Geometry.MultiPoint(
        [[72.8622547123706, 33.84620015218969],
         [72.85156879165527, 33.84933665420364]]);
         
         
var area = ee.Geometry.Rectangle([72.836, 33.822,73.002,33.900]);

//Select and Filter Sentinel 2 L1C Image
var sentImage = ee.Image(sentinel
.filterDate("2015-01-01", "2019-04-29")
.sort('CLOUD_COVERAGE_ASSESSMENT')
.filterBounds(region)
.first());
print("Sentinel 2 Scene", sentImage);
 
//Select and Filter Landsat 2 Image
var landImage = ee.Image(landsat
.filterDate("2015-01-01", "2019-10-01")
.sort('CLOUDCOVER')
.filterBounds(region)
.first());
print("Landsat Scene",landImage);

//Select and Filter Landsat 2 Image
var ASTERImage = ee.Image(aster
.filterDate("2007-01-01", "2007-10-01")
.sort('CLOUDCOVER')
.filterBounds(region)
.first());
print("ASTER Scene", ASTERImage);

Map.setCenter(72.8622547123706,33.84620015218969, 13.3);

// Main Function of Decorrelation Stretching
function dcs(bandsImage, location, scale){
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

// Bands used for each satellite image
var asterBands = ['B01','B02','B04','B05','B06','B07','B08','B09'];
var sentBands = ['B2','B3','B4','B8','B7','B11','B12'];
var landBands = ['B1','B2','B3','B4','B5','B6','B7','B10','B11'];

var asterImage = ASTERImage.select(asterBands);
var sentImage = sentImage.select(sentBands);
var landImage = landImage.select(landBands);

var bands = [0,1,2];

Map.addLayer(asterImage, {bands: ['B04', 'B01', 'B02'], max: 300}, 'ASTER FCC');
Map.addLayer(landImage, {bands: ['B4', 'B3', 'B2'], max: 20000}, 'Landsat TCC');
Map.addLayer(sentImage, {bands: ['B4', 'B3', 'B2'], max: 3000}, 'Sentinel TCC');
Map.addLayer(dcs(asterImage, region, 30).select(bands), {}, 'Aster DS (B01,B02,B04)');
Map.addLayer(dcs(sentImage, region, 30).select(bands), {}, 'Sentinel DS (B2,B3,B4)');
Map.addLayer(dcs(landImage, region, 30).select(bands), {}, 'Landsat DS (B1,B2,B3)');
Map.addLayer(ee.Image().paint(area, 0, 2), {}, 'Region');
