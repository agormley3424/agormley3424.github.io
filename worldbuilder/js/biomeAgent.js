/* global
  noise
*/
/* jshint esversion: 6 */

class BiomeAgent {
  generate (map) {
    /*
    Assigns water to be ocean or lake as appropriate for a whole map.
    Also assigns coastpoints as land adjacent to ocean.
    */
    this.approximateLakes(map);
    const unvisitedLakes = map.getPointsOfType('lake');
    const visitedLakes = [];
    while (unvisitedLakes.length > 0) {
      const lakePoint = unvisitedLakes.pop();
      visitedLakes.push(lakePoint);
      if (this.findOcean(lakePoint, map, visitedLakes)) {
        this.assignOcean(lakePoint, map);
      }
    }
  }

  defineShore (map) {
    const c = map.getPointsOfType('coast');
    const shoreList = [];
    for (const p of c) {
      if (map.getNeighborsOfType(p, 'ocean').length > 0) {
        shoreList.push(p);
      }
    }
    return shoreList;
  }

  approximateLakes (map) {
    /*
    Overestimates the number of lake points in the map
    */
    const shorePoints = this.defineShore(map);
    for (const b of shorePoints) {
      const oceanPoints = map.getNeighborsOfType(b, 'ocean');
      for (const o of oceanPoints) {
        const direction = b.dir(o);
        this._moveAlong(o, direction, map);
      }
    }
  }

  _moveAlong (point, direction, map) {
    /*
    Helper function for approximateLakes, recursively checks a line of water to determine if it's a set of lake or ocean points.
    */
    if (point === null) {
      return 'ocean';
    } else if (point.getBiome() !== 'ocean') {
      return 'lake';
    } else {
      const type = this._moveAlong(map.getNeighbor(point, direction), direction, map);
      point.setBiome(type);
      return type;
    }
  }

  findOcean (point, map, visitedLakes) {
    /*
    Returns true if the point is connected to an ocean point, otherwise false.
    */
    const fringe = [];
    fringe.push(point);
    while (fringe.length > 0) {
      const parent = fringe.pop();
      if (parent === null) {
        console.log('biomeAgent error in findOcean: point is null');
        return null;
      } else if (parent.getBiome() === 'ocean') {
        return true;
      } else if (parent.getBiome() === 'lake') {
        const successors = map.getNeighbors(parent);
        for (const s of successors) {
          if (!visitedLakes.includes(s)) {
            fringe.push(s);
            visitedLakes.push(s);
          }
        }
      }
    }
    return false;
  }

  assignOcean (point, map) {
    /*
    Discovers and sets the biomes of all reachable lake points from point ocean.
    */
    const fringe = [];
    const visitedNodes = [];
    fringe.push(point);
    while (fringe.length > 0) {
      const parent = fringe.pop();
      if (parent === null) {
        console.log('biomeAgent error in findOcean: point is null');
        return null;
      } else if (parent.getBiome() === 'lake') {
        parent.setBiome('ocean');
        const successors = map.getNeighbors(parent);
        for (const s of successors) {
          if (!visitedNodes.includes(s)) {
            fringe.push(s);
            visitedNodes.push(s);
          }
        }
      }
    }
  }
}
