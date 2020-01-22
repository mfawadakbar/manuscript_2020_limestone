# IJRS_2020_Limestone
This repository contains code used to generate all the results in the manuscript titled, "Applications of Machine learning Algorithms for Limestone Mapping using ASTER – L1T, Sentinel – 2 MSI and Landsat – 8 OLI Data".

## Requirements
The code can be executed online by opening the link (given above) in any browser (Chrome Recommended). No specific system requirements needed. The code is executed on Google Earth Engine cloud computing platform. In our study, this code was developed and executed on a system with the following specifications, Intel® Core™ i5-8400 CPU @ (2.8 GHz and 2.81 GHz) and 8 GB RAM.
You will need a Google Account to run any code in this repository.

## Contact details
The authors of the manuscript are reserarchers at Intelligent Information Processing Lab, National Center of Artificial Intelligence University of Engineering and Technology Peshawar, Khyber Pakhtunkhwa, Pakistan;
* Emails:  mfawadakbar@uetpeshawar.edu.pk; khan.m@uetpeshswar.edu.pk; shahabuddin@uetpeshawar.edu.pk

## Code Description
The repository contains 6 files each containing codes to generate results of the linked manuscript. All codes are well organized and commented.

## Image Filtering
Some of the codes doesn't have the filtering code. These codes have imported filtered images using image IDs. The images were filtered using the following code snippet.
```
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
print("ASTER Scene",ASTERImage);

```
## Image Region and Scale
Images in the manuscript were taken at 500m scale as shown on Google Earth Engine Platform. The codes will print the results at 1km scale where the region of interest will be marked by a black rectangle.

### Limestone Paper (PCA Submission Code).js
This file contains code to generate individual PCs and FCCs of PCs for all three datasets. You may need to uncomment (remove '//') `//Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);` to print the individual PC images as layers in the GEE platform. To run this code automatically you will need to click on the link given below.

GEE Link: https://code.earthengine.google.com/1416f372ccbd81aad9d0aa5e38ca8843

### Limestone Paper (Decorrelation Stretching Submission Code).js
This file contains code to stretch bands of for all three datasets using Decorrelation Stretching algorithm. Each data source is first filtered to obtain the best image within the specified date range. To run this code automatically you will need to click on the link given below.

GEE Link: https://code.earthengine.google.com/a51bd26a8d68318e17e70134aebacdc8

### Limestone Paper (Clustering Submission Code).js
WekaXmeans algorithm is used to select suitable number of clusters within the specified clusters range of 2 - 30 clusters for each satellite image. Clustering results are printed as seperate layers for each data source.

GEE Link: https://code.earthengine.google.com/3c253702db2e1a5d076a333b83d07d62

### Limestone Paper (Classification Submission Code) - Sentinel.js
CART, Random Forest, Naive Bayes, SVM classificaiton results for sentinel - 2 MSI L2A satellite Image.

GEE Link: https://code.earthengine.google.com/08146ecd555c5c854f215b831cb71083

### Limestone Paper (Classification Submission Code) - Landsat.js
CART, Random Forest, Naive Bayes, SVM classificaiton results for Landsat - 8 OLI raw satellite Image.

GEE Link: https://code.earthengine.google.com/bba5bd99ab5b37810e05f6c2c1068d37

### Limestone Paper (Classification Submission Code) - ASTER.js
CART, Random Forest, Naive Bayes, SVM classificaiton results for ASTER L1T satellite Image.

GEE LInk: https://code.earthengine.google.com/3fcae076c97674cab991f143e1ae032e
