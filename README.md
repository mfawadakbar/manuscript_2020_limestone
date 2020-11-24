# Limestone_Mapping_Manuscript_Code
This repository contains code used to generate all the results in the manuscript titled, "Mapping of limestone bearing formations in Hazara, Pakistan: Application of Machine Learning Algorithms on Multispectral Remote Sensing Data using Google Cloud Architecture".

## Requirements
The code can be executed online by opening the link (given above) in any browser (Chrome Recommended). No specific system requirements needed. The code is executed on Google Earth Engine cloud computing platform. In our study, this code was developed and executed on a system with the following specifications, Intel® Core™ i5-8400 CPU @ (2.8 GHz and 2.81 GHz) and 8 GB RAM.

You will need a Google Account to run any code in this repository.

## Contact Details
The authors of the manuscript are reserarchers at Intelligent Information Processing Lab, National Center of Artificial Intelligence University of Engineering and Technology Peshawar, Khyber Pakhtunkhwa, Pakistan;
* Emails:  mfawadakbar@uetpeshawar.edu.pk; khan.m@uetpeshswar.edu.pk; shahabuddin@uetpeshawar.edu.pk

## Image Scale and Region
Images in the manuscript were taken at 500m scale as shown on Google Earth Engine Platform. The codes will print the results at 1km scale where the region of interest will be marked by a black rectangle.

## Code Description
The repository contains 6 files each containing codes to generate results of the linked manuscript. All codes are well organized and commented.

### Image Filtering
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
### Code Files
PCA, DS and Clustering were used to select training and testing patches. The selected representative samples from each class were split into Train and Test data in a 70-30 ratios. Four classifiers (CART, RF, NB, SVM) applied on three data sources (Sentinel - 2, ASTER L1T, Landsat 8).

#### PCA_Limestone_Mapping.js
This file contains code to generate individual PCs and FCCs of PCs for all three datasets. You may need to uncomment (remove '//') `//Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);` to print the individual PC images as layers in the GEE platform. To run this code automatically you will need to click on the link given below.

GEE Link: https://code.earthengine.google.com/1416f372ccbd81aad9d0aa5e38ca8843

#### DS_Limestone_Mapping.js
This file contains code to stretch bands of for all three datasets using Decorrelation Stretching algorithm. Each data source is first filtered to obtain the best image within the specified date range. To run this code automatically you will need to click on the link given below.

GEE Link: https://code.earthengine.google.com/a51bd26a8d68318e17e70134aebacdc8

#### Clustering_Limestone_Mapping.js
WekaXmeans algorithm is used to select suitable number of clusters within the specified clusters range of 2 - 30 clusters for each satellite image. Clustering results are printed as seperate layers for each data source.

GEE Link: https://code.earthengine.google.com/3c253702db2e1a5d076a333b83d07d62

#### Sentinel_Classification.js
CART, Random Forest, Naive Bayes, SVM classificaiton results for Sentinel - 2 MSI L2A satellite Image. 

GEE Link: https://code.earthengine.google.com/08146ecd555c5c854f215b831cb71083

#### Landsat_Classification.js (Including Hyperparameter Tuning, Mask Generation and Formation Classification Code)
CART, Random Forest, Naive Bayes, SVM classificaiton results for Landsat - 8 OLI satellite Image. Furthermore, it includes, hyperparameter tuning codes for SVM (Linear, Polynomial, RBF and Sigmoid kernals), CART, RF and NB. Mask generation and Export to asset code and Oolitic and Fossiliferous formations classification code.

GEE Link (Mask Generation - With Data Annotation Classification): https://code.earthengine.google.com/7461e1c09832d5191c35fd78f58cbc66?accept_repo=users%2Fmfawadakbar%2FLimestoneManuscriptSubmissionCode 

GEE Link (Without Data Annotation Classification): https://code.earthengine.google.com/b450d39ebb667015d7493472f219da07?accept_repo=users%2Fmfawadakbar%2FLimestoneManuscriptSubmissionCode 

GEE Link (Hyperparameter Tuning, Formations Classification): https://code.earthengine.google.com/?accept_repo=users/mfawadakbar/LimestoneManuscriptSubmissionCode

Github Clone (Hyperparameter Tuning, Formations Classification): `git clone https://earthengine.googlesource.com/users/mfawadakbar/LimestoneManuscriptSubmissionCode`

#### ASTER_Classification.js
CART, Random Forest, Naive Bayes, SVM classificaiton results for ASTER L1T satellite Image.

GEE Link: https://code.earthengine.google.com/3fcae076c97674cab991f143e1ae032e
