/* jshint esversion: 6 */

// CoastAgent parameters

// User parameter (abstraction for number of tokens)
// 0 <= size <= ceiling(lg(mWidth * mHeight))
// Below ceiling(lg(mWidth * mHeight))/2 is very small
// Approaching the ceiling (ceiling(lg(mWidth * mHeight)) and ceiling(lg(mWidth * mHeight))-1
// results in the same island with two agents) too closely leads to suicides and no growth if few enough agents

let size = 17;

// User parameter (abstraction for number of agents)
// 0 <= smoothness <= floor(size / 2)
// 7-9 is when the star pattern usually starts developing (should probably stick below 7 or 8)
let coastSmoothness = 4;

// Corollary Values
// Used to set the limits for some of the following variables
// Default area is 131072
// Default circumference is 1283.393677

let islandArea = Math.pow(2, size);
let islandCircumference = 2 * Math.PI * Math.sqrt(islandArea / Math.PI);

// BeachAgent parameters

// User parameter (abstraction for tokens)
// Controls how far inland the coastline will go
// 1 <= inland <= 3
let inland = 3;

// User parameter (Abstraction for beachNoiseMax)
// Controls how high beaches can reach
// 0 <= beachHeight <= 10
let beachHeight = 5;

// User parameter (abstraction for octave)
// Controls how uniform the coastline is (i.e. is it one connected beach or many disconnected beaches?)
// 0 <= coastUniformity <= 3
var coastUniformity = 2;

// RiverAgent parameters

// User parameter (number of rivers)
// 0 <= numRivers <= .05(2 * pi * sqrt(islandArea/pi))
// Not an option if there's no mountains
var numRivers = 10;

// MountainAgent parameters

// User parameter
// Set number of mountain ranges
// 0 <= numMountainRanges <= 15?
var numMountainRanges = 15;

// User parameter
// islandCircumference / 10 <= widthMountainRange <= islandCircumference / 3
// THESE BOUNDARIES NEED TO BE REVIEWED AND UPDATED!
// ALSO, YOU NEED TO ACCOUNT FOR LOWER BOUNDS ABOVE 0
// USING 1 TO 10 IN THE MEANTIME
var widthMountainRange = 10;

// User parameter
// 150 <= maxHeightMountainRange <= 250
var maxHeightMountainRange = 200;

// User Parameter
// 1 <= squiggliness <= 90
// Equal to minturnangle, maxturnangle = 2*squiggliness
var squiggliness = 95;

// User parameter
// Controls how quickly mountains drop to the ground
// 0 <= smoothness <= 100
var mountainSmoothness = 50;

function sizeChange () {
  const sizeSlider = document.getElementById('sizeSlider');
  const smoothSlider = document.getElementById('smoothSlider');
  const riverSlider = document.getElementById('riverSlider');
  const widthMountainSlider = document.getElementById('widthMountainSlider');

  setSize(sizeSlider.value);
  setCircum(size);
  setSmooth(smoothSlider.value, size);
  setRiver(riverSlider.value);
  setWidthMountain(widthMountainSlider.value);
}

function smoothChange () {
  const smoothSlider = document.getElementById('smoothSlider');
  const sizeSlider = document.getElementById('sizeSlider');

  setSmooth(smoothSlider.value, sizeSlider.value);
}

function inlandChange () {
  const inlandSlider = document.getElementById('inlandSlider');

  setInland(inlandSlider.value);
}

function heightChange () {
  const heightSlider = document.getElementById('heightSlider');

  setBeachHeight(heightSlider.value);
}

function uniformityChange () {
  const uniformitySlider = document.getElementById('uniformitySlider');

  setUniformity(uniformitySlider.value);
}

function riverChange () {
  const riverSlider = document.getElementById('riverSlider');

  setRiver(riverSlider.value);
}

function numMountainChange () {
  const numMountainSlider = document.getElementById('numMountainSlider');

  setNumMountain(numMountainSlider.value);
}

function widthMountainChange () {
  const widthMountainSlider = document.getElementById('widthMountainSlider');

  setWidthMountain(widthMountainSlider.value);
}

function heightMountainChange () {
  const heightMountainSlider = document.getElementById('heightMountainSlider');

  setHeightMountain(heightMountainSlider.value);
}

function squigglinessChange () {
  const squigglinessSlider = document.getElementById('squigglinessSlider');

  setSquiggliness(squigglinessSlider.value);
}

function smoothMountainChange () {
  const smoothMountainSlider = document.getElementById('smoothMountainSlider');

  setSmoothMountain(smoothMountainSlider.value);
}

function setSize (percent) {
  size = percent * 20;
}

function setSmooth (smoothPercent, islandSize) {
  coastSmoothness = Math.floor(smoothPercent * (size / 2));
}

function setCircum (size) {
  islandArea = Math.pow(2, size);
  islandCircumference = 2 * Math.PI * Math.sqrt(islandArea / Math.PI);
}

function setInland (percent) {
  inland = Math.round(percent * 3);
}

function setBeachHeight (percent) {
  beachHeight = Math.round(percent * 10);
}

function setUniformity (percent) {
  coastUniformity = Math.round(percent * 3);
}

function setRiver (percent) {
  numRivers = Math.round(percent * (0.05 * (2 * Math.PI * Math.sqrt(islandArea / Math.PI))));
}

function setNumMountain (percent) {
  numMountainRanges = Math.round(percent * 15);
}

function setWidthMountain (percent) {
  widthMountainRange = Math.round(percent * 10);
}

function setHeightMountain (percent) {
  maxHeightMountainRange = Math.round(percent * 250);
}

function setSquiggliness (percent) {
  squiggliness = Math.round(percent * 90);
}

function setSmoothMountain (percent) {
  mountainSmoothness = Math.round(percent * 100);
}

function genFunc () {
  genButton = document.getElementById('genButton');
  genButton.value = 'Loading...';
  genTime = true;
}
