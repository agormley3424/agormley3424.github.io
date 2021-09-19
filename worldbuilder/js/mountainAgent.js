/* global
  noise
*/
/* jshint esversion: 6 */

const NO = 'no';
const HIT_LEFT = 'hit left';
const HIT_RIGHT = 'hit right';
const HIT_FRONT_L = 'hit front l';
const HIT_FRONT_R = 'hit front r';
const MULTI_HIT_LEFT = 'mulit hit left';
const MULTI_HIT_RIGHT = 'mulit hit right';

class MountainAgent {
  constructor (numberOfMountains, tokens, width, heightMin, heightMax, turnPeriodMin, turnPeriodMax, turnMin, turnMax, dropoff, minElevation, rand) {
    this.x = 0;
    this.y = 0;

    this.numberOfMountains = numberOfMountains;
    this.tokens = tokens;
    this.direction = 0;
    this.width = width;
    this.heightMin = heightMin;
    this.heightMax = heightMax;
    this.turnPeriodMin = turnPeriodMin;
    this.turnPeriodMax = turnPeriodMax;
    this.turnMin = turnMin;
    this.turnMax = turnMax;
    this.dropoff = dropoff / 100 * 0.2 + 0.8;
    this.minElevation = minElevation;
    this.rand = rand;
  }

  pickRandomStart (map) {
    this.x = Math.floor(this.rand.callRandom(0, map.width - 1));
    this.y = Math.floor(this.rand.callRandom(0, map.height - 1));
  }

  checkPoint (map, x, y) {
    if (x < 0 || x > map.width - 1 || y < 0 || y > map.height - 1) {
      return null;
    } else {
      return map.point(x, y);
    }
  }

  // true -> bad start, pick new one
  checkStart (map) {
    // console.log('enter checkstart');
    for (let i = -this.width; i < this.width + 1; i++) {
      for (let j = -this.width; j < this.width + 1; j++) {
        if(this.distance(Math.round(this.x + i), Math.round(this.y + j), Math.round(this.x), Math.round(this.y)) < this.width && this.checkPoint(map, Math.round(this.x + i), Math.round(this.y + j)) !== null 
            && map.point(Math.round(this.x + i), Math.round(this.y + j)).getElevation() < this.minElevation) {
          /// console.log('return checkstart true');
          return true;
        }
      }
    }
    // console.log('return checkstart false');
    return false;
  }

  resetTurnTimer () {
    this.turnTime = this.rand.callRandom(this.turnPeriodMin, this.turnPeriodMax);
  }

  generate (map) {
    // console.log('reached generate');
    if (this.numberOfMountains < 1) {
      mountainSuccess = false;
      return;
    }
    let mountainCount;
    for (mountainCount = 0; mountainCount < this.numberOfMountains; mountainCount++) {
      this.pickRandomStart(map);
      this.direction = this.rand.callRandom(0, 360);
      let count = 0;
      while (this.checkPoint(map, this.x, this.y) === null || map.point(this.x, this.y).getElevation() < this.minElevation || this.checkStart(map)) {
        // if our starting point is invalid pick a new one
        this.pickRandomStart(map);
        ++count;
        // console.log(count);
        if (count > 1000) {
          console.error('max mountain attempts reached, aborting range');
          mountainSuccess = false;
          return;
        }
      }
      // console.log('exited first while loop');
      let reachedEdge = NO;
      this.resetTurnTimer();
      let timeSinceTurn = 0;
      for (let i = 0; i < this.tokens; i++) {
        reachedEdge = this.elevateCircle(map);
        switch (reachedEdge) {
          case NO:
            break;
          case HIT_RIGHT:
            this.newTurnLeft(false);
            break;
          case HIT_LEFT:
            this.newTurnRight(false);
            break;
          case MULTI_HIT_RIGHT:
            this.newTurnLeft(true);
            break;
          case MULTI_HIT_LEFT:
            this.newTurnRight(true);
            break;
          case HIT_FRONT_R:
            this.newTurnLeft(true);
            this.newTurnLeft(false);
            break;
          case HIT_FRONT_L:
            this.newTurnRight(true);
            this.newTurnRight(false);
            break;
          default:
            console.log('ERROR: reachedEdge has illegal value');
            break;
        }
        // console.log(this.turnTime + ' ' + timeSinceTurn);
        /*if (this.turnTime > 0 && timeSinceTurn > this.turnTime / 2 && timeSinceTurn < (this.turnTime / 2) + 1) {
          this.makeFoothills(map);
        }*/
        if (this.turnTime > 0 && timeSinceTurn > this.turnTime) {
          this.makeFoothills(map);
          const turnAmount = this.newGetTurn();
          this.newRotateAgent(turnAmount);
          this.resetTurnTimer();
          timeSinceTurn = 0;
        }
        this.newMoveAgent();
        timeSinceTurn++;
      }
    }
  }

  elevateCircle(map) {
    const height = this.rand.callRandom(this.heightMin, this.heightMax);
    let reachedEdge = NO;
    const width = this.width + this.rand.callRandom(-this.width / 5, this.width / 5);
    for (let i = -width; i < width + 1; i++) {
      for (let j = -width; j < width + 1; j++) {
        if(this.distance(this.x + i, this.y + j, this.x, this.y) < width) {
          
          if(reachedEdge === NO) {
            if(this.newSetHeight(map, Math.floor(this.x + i), Math.floor(this.y + j), this.newHeightWithDropoff(this.x, this.y, this.x + i, this.y + j, height/*(height + 
                Math.ceil(30 * noise((this.x + i)) / 10, (this.y + j) / 10) + Math.ceil(30 * noise((this.x + i)) / 100,(this.y + j) / 100))*/))) {
              reachedEdge = HIT_FRONT_L;
            }
          }
          else {
            this.newSetHeight(map, Math.floor(this.x + i), Math.floor(this.y + j), this.newHeightWithDropoff(this.x, this.y, this.x + i, this.y + j, height));
          }
        }
      }
    }
    map.point(Math.round(this.x), Math.round(this.y)).setBiome('ridge');
    return reachedEdge;
  }

  elevateFoothillCircle(map, x, y, height, width) {
    let reachedEdge = NO;
    for (let i = x - width; i < x + width + 1; i++) {
      for (let j = y - width; j < y + width + 1; j++) {
        if(this.distance(i, j, x, y) < width) {
          if(reachedEdge === NO) {
            if(this.newSetHeight(map, Math.floor(i), Math.floor(j), this.newHeightWithDropoff(x, y, i, j, height))) {
              reachedEdge = HIT_FRONT_L;
            }
          }
          else {
            this.newSetHeight(map, Math.floor(i), Math.floor(j), this.newHeightWithDropoff(x, y, i, j, height));
          }
        }
      }
    }
    map.point(Math.round(x), Math.round(y)).setBiome('ridge');
    return reachedEdge;
  }



  newHeightWithDropoff (centerX, centerY, x, y, height) {
    let distance = this.distance(centerX, centerY, x, y);
    if (distance > this.width) {
      distance = this.width;
    }
    return (this.width - distance) * Math.pow(this.dropoff, distance) * height / this.width + this.rand.callRandom(0, this.heightMax / 5);
  }

  newSetHeight (map, x, y, height) {
    if (this.checkPoint(map, x, y) === null || map.point(x, y).getElevation() < this.minElevation) {
      return true;
    }
    if (map.point(x, y).getElevation() < height) {
      map.point(x, y).setElevation(height);
      if(map.point(x, y).getBiome() !== 'ridge') {
        map.point(x, y).setBiome('mountain');
      }
    }
    return false;
  }

  makeFoothills(map) {
    let direction = (this.direction + 90) % 360;
    let direction2 = (this.direction - 90) % 360;
    this.runFoothillAgent(map, map.point(Math.round(this.x), Math.round(this.y)).getElevation(), direction, this.width * 2);
    this.runFoothillAgent(map, map.point(Math.round(this.x), Math.round(this.y)).getElevation(), direction2, this.width * 2);
  }

  runFoothillAgent(map, height, dir, length) {
    let direction = dir;
    let x = this.x;
    let y = this.y;
    let currentHeight = height;

    let reachedEdge = NO;
    let turn = true;
    for (let i = 0; i < length; i++) {
      
      reachedEdge = this.elevateFoothillCircle(map, x, y, currentHeight, this.width / 3);
      if (reachedEdge !== NO) {
        break;
      }
      if (i % Math.round(length / 5) === 0) {
        direction = this.turnFoothill(map, direction, x, y, turn);
        turn = !turn;
      }
      currentHeight -= height / length
      //move foothill agent
      const directionRad = Math.PI * direction / 180;
      x = x + Math.cos(directionRad);
      y = y + Math.sin(directionRad);
    }
  }

  turnFoothill(map, direction, x, y, turn) {
    /*
    const directionRad = Math.PI * (direction + 90) / 180;
    const direction2Rad = Math.PI * (direction - 90) / 180;

    let leftElevation = map.point(Math.round(x + Math.cos(directionRad)), Math.round(y + Math.sin(directionRad))).getElevation();
    let rightElevation = map.point(Math.round(x + Math.cos(direction2Rad)), Math.round(y + Math.sin(direction2Rad))).getElevation();
    
    let turnAmount = this.rand.callRandom(10, 35);
    if(leftElevation < rightElevation) {
      //turn left - downhill
      return (direction - turnAmount) % 360;
    }
    else {
      return (direction + turnAmount) % 360;
    }*/
    let turnAmount = this.rand.callRandom(30, 60);
    if(turn) {
      //turn left - downhill
      return (direction - turnAmount) % 360;
    }
    else {
      return (direction + turnAmount) % 360;
    }
  }
  

  newTurnLeft (hard) {
    let min;
    if (hard) {
      min = (this.turnMin + this.turnMax) / 2;
    } else {
      min = this.turnMin;
    }
    const turn = this.rand.callRandom(min, this.turnMax);
    this.newRotateAgent(turn * -1);
  }

  newTurnRight (hard) {
    let min;
    if (hard) {
      min = (this.turnMin + this.turnMax) / 2;
    } else {
      min = this.turnMin;
    }
    const turn = this.rand.callRandom(min, this.turnMax);
    this.newRotateAgent(turn);
  }

  newRotateAgent (amount) {
    this.direction = (this.direction + amount) % 360;
  }

  newGetTurn () {
    const turn = this.rand.callRandom(this.turnMin, this.turnMax);
    if (this.rand.callRandom(0, 1) > 0.5) {
      return turn;
    } else {
      return turn * -1;
    }
  }

  newMoveAgent () {
    const directionRad = Math.PI * this.direction / 180;

    const newX = this.x + Math.cos(directionRad);
    const newY = this.y + Math.sin(directionRad);
    this.x = newX;
    this.y = newY;
  }

  distance (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  smoothPoint (map, x, y) {
    if (this.checkPoint(map, x, y) === null) return;

    let total = 0;
    let count = 3;
    total += map.point(x, y).getElevation() * 3;
    if (this.checkPoint(map, x + 1, y) !== null) {
      total += map.point(x + 1, y).getElevation();
      count++;
    }
    if (this.checkPoint(map, x - 1, y) !== null) {
      total += map.point(x - 1, y).getElevation();
      count++;
    }
    if (this.checkPoint(map, x + 2, y) !== null) {
      total += map.point(x + 2, y).getElevation();
      count++;
    }
    if (this.checkPoint(map, x - 2, y) !== null) {
      total += map.point(x - 2, y).getElevation();
      count++;
    }
    if (this.checkPoint(map, x, y + 1) !== null) {
      total += map.point(x, y + 1).getElevation();
      count++;
    }
    if (this.checkPoint(map, x, y - 1) !== null) {
      total += map.point(x, y - 1).getElevation();
      count++;
    }
    if (this.checkPoint(map, x, y + 2) !== null) {
      total += map.point(x, y + 2).getElevation();
      count++;
    }
    if (this.checkPoint(map, x, y - 2) !== null) {
      total += map.point(x, y - 2).getElevation();
      count++;
    }
    total /= count;
    map.point(x, y).setElevation(total);
  }

  smoothWedge (map) {
    const direction2 = (this.direction + 90) % 360;
    const directionRad = Math.PI * this.direction / 180;
    const direction2Rad = Math.PI * direction2 / 180;

    this.smoothPoint(map, Math.floor(this.x), Math.floor(this.y));
    this.smoothPoint(map, Math.ceil(this.x), Math.ceil(this.y));

    let i;
    for (i = 0; i <= this.width; i++) {
      let j;
      for (j = 0; j <= this.width - i; j++) {
        let pointX = this.x + i * Math.cos(directionRad) + j * Math.cos(direction2Rad);
        let pointY = this.y + i * Math.sin(directionRad) + j * Math.sin(direction2Rad);
        this.smoothPoint(map, Math.floor(pointX), Math.floor(pointY));
        this.smoothPoint(map, Math.ceil(pointX), Math.ceil(pointY));

        pointX = this.x + i * Math.cos(directionRad) - j * Math.cos(direction2Rad);
        pointY = this.y + i * Math.sin(directionRad) - j * Math.sin(direction2Rad);
        this.smoothPoint(map, Math.floor(pointX), Math.floor(pointY));
        this.smoothPoint(map, Math.ceil(pointX), Math.ceil(pointY));

        pointX = this.x - i * Math.cos(directionRad) + j * Math.cos(direction2Rad);
        pointY = this.y - i * Math.sin(directionRad) + j * Math.sin(direction2Rad);
        this.smoothPoint(map, Math.floor(pointX), Math.floor(pointY));
        this.smoothPoint(map, Math.ceil(pointX), Math.ceil(pointY));

        pointX = this.x - i * Math.cos(directionRad) - j * Math.cos(direction2Rad);
        pointY = this.y - i * Math.sin(directionRad) - j * Math.sin(direction2Rad);
        this.smoothPoint(map, Math.floor(pointX), Math.floor(pointY));
        this.smoothPoint(map, Math.ceil(pointX), Math.ceil(pointY));
      }
    }
  }
}
