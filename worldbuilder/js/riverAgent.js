// River agent file
// Contains class definition and generate function
/* global floor random */
/* jshint esversion: 6 */
// let rcount = 0;
class RiverAgent {
  // making weird lines in lakes, and there's a possibility of there not being shorelines
  constructor (rand, maxRivers = 1) {
    this.maxRivers = maxRivers;
    this.rand = rand;
    this.recDepth = 0;
  }

  // will generate maxRivers
  generate (map) {
    if (!mountainSuccess) {
      return;
    }
    const altered = [];
    for (let i = 0; i < this.maxRivers; ++i) {
      //console.log('river ' + (i + 1));
      // rcount++;
      Array.prototype.push.apply(altered, this.generateRiver(map)); // only way I found to concatinate arrays
    }
    this.recDepth = 0;
    return altered;
  }

  // will generate 1 river
  generateRiver (map) {
    if(this.recDepth > 100) return [];
    const points = map.getPointsOfType('shore').concat(map.getPointsOfType('tallShore'));
    const b = this.rand.callRandom(points);
    const m = map.getRandomPointOfType('mountain');
    //console.log(b, m);
    let p = b;
    let d = b.dist(m); // want to reduce the distance between b and m
    const altered = [];
    const prevBiome = [];
    // let count = 0;
    while (p.getBiome() !== 'mountain') {
      // move towards a mountain
      // count++;
      prevBiome.push(p.getBiome());
      if (p.getBiome() !== 'lake') p.setBiome('river');
      const nRaw = map.getNeighbors(p);

      d = p.dist(m);
      const n = [];

      for (const point of nRaw) {
        const biome = point.getBiome();
        if (biome === 'ocean' || biome === 'river') {
          continue;
        }
        if (point.dist(m) <= d) {
          n.push(point);
        }
      }
      if (n.length === 0) {
        //console.error('failed river');
        // return altered;
        for (let a = 0; a < altered.length; ++a) {
          altered[a].setBiome(prevBiome[a]);
        }
        return this.generateRiver(map);
      }
      p = pickN(n);
      // console.log(p, count);
    }
    return altered;
  }
}

function pickN (ns) {
  let result = ns[0];
  for (const n of ns) {
    if (n.getElevation() < result.getElevation()) {
      result = n;
    }
  }
  return result;
}
