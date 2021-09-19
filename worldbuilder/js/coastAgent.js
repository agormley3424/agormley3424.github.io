/* global
  noise
*/
/* jshint esversion: 6 */
class CoastAgent {
  constructor (seedPoint, tokens, limit) {
    /*
    seedpoint is a point, where the first agent will begin and the landmass will center around.

    tokens determines how many tokens the first agent starts with, and determines the size
    of the landmass.

    limit defines the threshold above which an agent will split into two smaller agents to divide work, and
    determines the jaggedness of the landscape.

    The agent's preferred direction is randomly assigned.
    */
    this.seed = seedPoint;
    this.tokens = tokens;
    this.limit = limit;
    this.direction = null;
    //this.numAgents = 2 ^ (Math.floor(Math.log2(tokens) - Math.floor(Math.log2(limit))));
  }

  getSeed () {
    /*
    Returns the seed point of the agent
    */
    return this.seed;
  }

  setSeed (newSeed) {
    /*
    Sets the seed point of the agent
    newSeed must be a Point object
    */
    this.seed = newSeed;
  }

  getTokens () {
    /*
    Returns the number of tokens of the agent
    */
    return this.tokens;
  }

  setTokens (newTokens) {
    /*
    Sets the number of tokens of the agent
    newTokens must be an integer
    */
    this.tokens = newTokens;
  }

  getDirection () {
    /*
    Returns the direction of the agent
    */
    return this.direction;
  }

  setDirection (newDirection) {
    /*
    Sets the direction of the agent.
    newDirection must be a string denoting a legal direction.
    */
    this.direction = newDirection;
  }

  randDirection (map) {
    /*
    Sets the direction of the agent to a new random direction.
    */
    this.direction = map.randomDirection();
    // console.log('direction after randDirection: ' + this.direction);
  }

  generate (map) {
    /*
    Generates a new landmass centered around this agent on map.
    */
    if (this.direction === null) this.randDirection(map);
    this.recurCoast(this, map);
  }

  recurCoast (agent, map) {
    /*
    Recursively divides agents into child agents until all child agents are at or below the specified limit.
    Child agents then procedurally move around the map and raise points out of the ocean.
    */
    if (agent.tokens > agent.limit) {
      const child1 = new CoastAgent(map.getRandomNeighbor(agent.seed), Math.floor(agent.tokens / 2), agent.limit);
      child1.randDirection(map);
      const child2 = new CoastAgent(map.getRandomNeighbor(agent.seed), Math.floor(agent.tokens / 2), agent.limit);
      child2.randDirection(map);
      this.recurCoast(child1, map);
      this.recurCoast(child2, map);
    } else {
      // this.raisePoint(agent.seed)
      while (agent.tokens > 0) {
        agent.seed = map.getRandomNeighbor(agent.seed);
        this.moveAgent(agent, map);
        if (agent.seed === null) {
          break;
        }
        const beacons = this.assignBeacons(agent.seed, map);
        let maxScore = Number.NEGATIVE_INFINITY;
        let maxP = null;
        for (const p of map.getNeighbors(agent.seed)) {
          const pointScore = this.score(p, beacons, map);
          if (pointScore > maxScore) {
            maxScore = pointScore;
            maxP = p;
          }
        }
        agent.randDirection(map);
        this.raisePoint(maxP);
        agent.tokens--;
      }
    }
  }

  raisePoint (point) {
    /*
    Raises a point out of the ocean and sets its biome to coast.
    */
    let newElevation = 0;
    //newElevation += Math.ceil(30 * noise(point.getX(), point.getY()));
    newElevation += Math.ceil(20 * noise(point.getX() / 10, point.getY() / 10));
    newElevation += Math.ceil(20 * noise(point.getX() / 100, point.getY() / 100));
    point.setElevation(newElevation);
    point.setBiome('coast');
    return point;
  }

  assignBeacons (point, map) {
    /*
    Creates an attractor and a repulsor near a specified point on a map.
    */
    let repulsor = map.getRandomNeighbor(point);
    let attractor = map.getRandomNeighbor(point);
    while (repulsor === attractor) {
      repulsor = map.getRandomNeighbor(point);
      attractor = map.getRandomNeighbor(point);
    }
    return [repulsor, attractor];
  }

  moveAgent (agent, map) {
    /*
    Moves an agent in its preferred direction until it falls off the map or finds a non-landlocked point.
    */
    while (map.getNeighborsOfType(agent.seed, 'ocean').length === 0) {
      agent.seed = map.getNeighbor(agent.seed, agent.direction);
      if (agent.seed === null) {
        // console.log('agent suicide');
        return;
      }
    }
    // agent.randDirection();
  }

  score (point, beacons, map) {
    /*
    Scores a point relative to an attractor and a repulsor.
    */
    if (point.getBiome() !== 'ocean') {
      return Number.NEGATIVE_INFINITY;
    }
    const repulsor = beacons[0];
    const attractor = beacons[1];
    const dR = point.dist(repulsor);
    const dA = point.dist(attractor);
    const dE = Math.min((map.width - 1 - point.getX()), (point.getX()), (map.height - 1 - point.getY()), (point.getY()));
    return Math.pow(dR, 2) - Math.pow(dA, 2) + 3 * Math.pow(dE, 2);
  }
}
