// TO DO: MOVE ALL RANDOMNESS / SEED STUFF INTO THE P5 FUNCTION SETUP OR DRAW

/* jshint esversion: 6 */

// GLOBAL VALUES //

// Setup parameters

// User parameters
// 0 <= mWidth <= 2000
// 0 <= mHeight <= 2000

//var mWidth = 1280;
//var mHeight = 720;

const mWidth = 1200;
const mHeight = 700;


function setWidth (value) {
  mWidth = value;
}

function setHeight (value) {
  mHeight = value;
}

// Initially empty variable used to access heightmap once map is generated
let heightmap;

let m;
let c;
let ma; // mountain agent
let r; // river agent
let b; // biome agent
let be; // beach agent

let genButton;

let genTime = false;
let rand;
let mountainSuccess = true;
let debug = false;

function setup () {
  class Random {
    constructor (seed = 0xcafe00face) {
      this.seed = seed;
      randomSeed(seed);
    }

    setSeed (seed) {
      this.seed = seed;
      randomSeed(seed);
    }

    getSeed () {
      return this.seed;
    }

    callRandom (min = null, max = null) {
      if (min === null && max === null) {
        return random();
      } else if (min !== null && max === null) {
        return random(min);
      } else {
        return random(min, max);
      }
    }
  }
  var worldSeed = 0xa127a3a25f;

  const canvas = createCanvas(mWidth, mHeight);
  canvas.parent('canvasSect');
  randomSeed();
  frameRate(1);
  background(182, 228, 251); // set this to the same color as the ocean.
  rand = new Random(worldSeed);

  heightmap = createImage(mWidth, mHeight);
  heightmap.loadPixels();
}

function draw () {
  if (genTime === true) {
    if (debug) {
      printParams();
    }
    // CoastAgent parameters

    // 1 <= agents <= tokens
    const agents = Math.pow(2, coastSmoothness);

    // 0 <= tokens <= mWidth * mHeight
    const tokens = islandArea;

    // 1 <= limit <= tokens
    const limit = tokens / agents;

    // 1 <= octave <= 1000
    const octave = Math.pow(10, coastUniformity);

    // MountainAgent parameters

    // Controls the length of a mountain range
    const mountainTokens = Math.ceil((islandArea / widthMountainRange) * 0.03);

    // Controls height of mountain peaks
    const maxPeak = maxHeightMountainRange;
    const minPeak = maxPeak * 0.7;

    // Controls how long an agent walks before turning
    const maxWalkTime = Math.ceil((1 - (squiggliness / 100)) * mountainTokens * 0.05);
    const minWalkTime = Math.ceil(maxWalkTime * 0.5);

    // Turn angle in degrees
    const minTurnAngle = squiggliness;
    const maxTurnAngle = squiggliness * 2;

    m = new Map(mWidth, mHeight, rand);
    const sPointX = floor(mWidth / 2);
    const sPointY = floor(mHeight / 2);
    const point = m.point(sPointX, sPointY);
    c = new CoastAgent(point, tokens, limit);
    b = new BiomeAgent();
    be = new BeachAgent(inland, beachHeight / 10, octave);
    ma = new MountainAgent(numMountainRanges, mountainTokens, widthMountainRange, minPeak, maxPeak,
      minWalkTime, maxWalkTime, minTurnAngle, maxTurnAngle, mountainSmoothness, 1, rand);
    r = new RiverAgent(rand, numRivers);
    const l = [c, be, ma, r];
    for (let i = 0; i < l.length; i++) {
      l[i].generate(m);
    }
    makeHeightmap();
    genButton.value = 'Generate!';
    genTime = false;
  }

  imageMode(CENTER);
  if (mHeight > mWidth * 0.5625) {
    image(heightmap, width / 2, height / 2, mWidth, mWidth * (mHeight / mWidth));
  } else {
    image(heightmap, width / 2, height / 2, mHeight * (mWidth / mHeight), mHeight);
  }
}

makeHeightmap = function () {
  for (let i = 0; i < heightmap.width; ++i) {
    for (let j = 0; j < heightmap.height; ++j) {
      const raw = m.point(i, j).getBiome();
      if (raw !== 'ocean' && raw !== 'mountain') {
        smoothPoint(m, i, j);
      }
    }
  }

  for (let i = 0; i < heightmap.width; ++i) {
    for (let j = 0; j < heightmap.height; ++j) {
      const raw = m.point(i, j).getBiome();
      let col = 0;
      col = determineColor(m, raw, col, i, j);
      heightmap.set(i, j, col);
    }
  }
  heightmap.updatePixels();
};

windowResized = function () {
  resizeCanvas(mWidth, mHeight);
};

function determineColor (map, raw, col, i, j) {
  switch (raw) {
    case 'ocean':
      col = color(182, 228, 251);
      break;
    case 'lake':
      col = color(182, 228, 251);
      break;
    case 'river':
      col = color(148, 235, 242);
      break;
    case 'beach':
      col = color(255, 255, 192);
      break;
    case 'shore':
      col = color(255, 255, 192);
      break;
    case 'tallShore':
      col = color(133, 190, 139);
      break;/*
    case 'coast':
      let bCoast = 60 + ((scorePoint(map, i, j) + 6) * 30 / 12);
      col = color('hsb(82, 47%, ' + bCoast + '%)');
      break;
    case 'mountain':
      col = color(205,142,99);
      let bMount = 50 + ((scorePoint(map, i, j) + 6) * 40 / 12);
      col = color('hsb(19, 55%, ' + bMount + '%)');
      break; *//*
    case 'ridge':
      col = color(0, 0, 0);
      console.log('ridge found');
      break; */
    default:
      const elevation = map.point(i, j).getElevation();
      if (elevation < 25) {
        const bCoast = 60 + ((scorePoint(map, i, j) + 6) * 30 / 12);
        col = color('hsb(82, 47%, ' + bCoast + '%)');
      } else if (elevation < 35) {
        const bMount = 80 + ((scorePoint(map, i, j) + 6) * 15 / 12);
        col = color('hsb(45, 33%, ' + bMount + '%)');
      } else if (elevation < 100) {
        const bMount = 70 + ((scorePoint(map, i, j) + 6) * 20 / 12);
        col = color('hsb(39, 42%, ' + bMount + '%)');
      } else if (elevation < 130) {
        const bMount = 70 + ((scorePoint(map, i, j) + 6) * 20 / 12);
        col = color('hsb(31, 43%, ' + bMount + '%)');
      } else if (elevation < 200) {
        const bMount = 50 + ((scorePoint(map, i, j) + 6) * 40 / 12);
        col = color('hsb(19, 55%, ' + bMount + '%)');
      } else {
        const bMount = 50 + ((scorePoint(map, i, j) + 6) * 50 / 12);
        col = color('hsb(19, 0%, ' + bMount + '%)');
      }
  }
  return col;
}

function scorePoint (map, i, j) {
  let score = 0;
  const elevation = map.point(i, j).getElevation();
  const diff = 0.75;
  // console.log(map.point(i+1, j).getElevation() - elevation);

  if (map.point(i + 1, j) !== null && elevation < map.point(i + 1, j).getElevation() && map.point(i + 1, j).getElevation() - elevation > diff) {
    score++;
  } else if (map.point(i + 1, j) !== null && elevation - map.point(i + 1, j).getElevation() > diff) {
    score--;
  }
  if (map.point(i + 1, j + 1) !== null && elevation < map.point(i + 1, j + 1).getElevation() && map.point(i + 1, j + 1).getElevation() - elevation > diff) {
    score++;
  } else if (map.point(i + 1, j + 1) !== null && elevation - map.point(i + 1, j + 1).getElevation() > diff) {
    score--;
  }
  if (map.point(i, j + 1) !== null && elevation < map.point(i, j + 1).getElevation() && map.point(i, j + 1).getElevation() - elevation > diff) {
    score++;
  } else if (map.point(i, j + 1) !== null && elevation - map.point(i, j + 1).getElevation() > diff) {
    score--;
  }

  if (map.point(i, j - 1) !== null && elevation > map.point(i, j - 1).getElevation() && elevation - map.point(i, j - 1).getElevation() > diff) {
    score++;
  } else if (map.point(i, j - 1) !== null && map.point(i, j - 1).getElevation() - elevation > diff) {
    score--;
  }
  if (map.point(i - 1, j - 1) !== null && elevation > map.point(i - 1, j - 1).getElevation() && elevation - map.point(i - 1, j - 1).getElevation() > diff) {
    score++;
  } else if (map.point(i - 1, j - 1) !== null && map.point(i - 1, j - 1).getElevation() - elevation > diff) {
    score--;
  }
  if (map.point(i - 1, j) !== null && elevation > map.point(i - 1, j).getElevation() && elevation - map.point(i - 1, j).getElevation() > diff) {
    score++;
  } else if (map.point(i - 1, j) !== null && map.point(i - 1, j).getElevation() - elevation > diff) {
    score--;
  }

  return score;
}

function smoothPoint (map, i, j) {
  let total = map.point(i, j).getElevation() * 3;
  total += (map.point(i - 1, j) !== null) ? map.point(i - 1, j).getElevation() : 0;
  total += (map.point(i - 2, j) !== null) ? map.point(i - 2, j).getElevation() : 0;
  total += (map.point(i, j - 1) !== null) ? map.point(i, j - 1).getElevation() : 0;
  total += (map.point(i, j - 2) !== null) ? map.point(i, j - 2).getElevation() : 0;
  total += (map.point(i + 1, j) !== null) ? map.point(i + 1, j).getElevation() : 0;
  total += (map.point(i + 2, j) !== null) ? map.point(i + 2, j).getElevation() : 0;
  total += (map.point(i, j + 1) !== null) ? map.point(i, j + 1).getElevation() : 0;
  total += (map.point(i, j + 2) !== null) ? map.point(i, j + 2).getElevation() : 0;
  total /= 11;
  map.point(i, j).setElevation(total);
}

function printParams () {
  console.log('size is ' + size);
  console.log('coastSmoothness is ' + coastSmoothness);
  console.log('islandArea is ' + islandArea);
  console.log('islandCircumference is ' + islandCircumference);
  console.log('inland is ' + inland);
  console.log('beachHeight is ' + beachHeight);
  console.log('coastUniformity is ' + coastUniformity);
  console.log('numRivers is ' + numRivers);
  console.log('numMountainRanges is ' + numMountainRanges);
  console.log('widthMountainRange is ' + widthMountainRange);
  console.log('maxHeightMountainRange is ' + maxHeightMountainRange);
  console.log('squiggliness is ' + squiggliness);
  console.log('mountainSmoothness is ' + mountainSmoothness);
}