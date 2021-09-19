
/* jshint esversion: 6 */
/* global sqrt */

// create a point of elevation e, biome b, created by agent a
class Point {
  constructor (e, b, xpos, ypos) {
    this.elevation = e;
    this.biome = b;
    this.x = xpos;
    this.y = ypos;
  }

  getX () {
    return this.x;
  }

  getY () {
    return this.y;
  }

  getElevation () {
    return this.elevation;
  }

  getBiome () {
    return this.biome;
  }

  setElevation (e) {
    this.elevation = e;
  }

  setBiome (b) {
    this.biome = b;
  }

  dist (p) {
    const x1 = this.getX();
    const y1 = this.getY();
    const x2 = p.getX();
    const y2 = p.getY();
    return sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
  }

  // return the direction from this to p.
  dir (p) {
    const x1 = this.getX();
    const y1 = this.getY();
    const x2 = p.getX();
    const y2 = p.getY();
    let phrase1 = '';
    let phrase2 = '';
    if (y1 < y2) phrase1 = 'south';
    if (y1 > y2) phrase1 = 'north';
    if (x1 < x2) phrase2 = 'east';
    if (x1 > x2) phrase2 = 'west';
    return phrase1.concat(phrase2);
  }

  toString () {
    return 'Point: (' + this.x + ', ' + this.y + ')\nElevation: ' + this.elevation + '\nBiome: ' + this.biome;
  }
}
