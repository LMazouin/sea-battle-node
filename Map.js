const prompt = require("prompt-sync")({ sigint: true });
const Random = require("./Random.js");
const Colors = require("./Colors.js");

// character code
const WATER = 0;
const SHIP = 1;
const ADJACENT = 2;
const VISITED = -1;
const HIT = 3;
const MISS = 4;
const SUNK = 5;
const HIT_BLINK = 6;
const MISS_BLINK = 7;

// strings for rendering the game interface
const WATER_CHARACTER = "\x1b[36m░\x1b[0m";
const SHIP_CHARACTER = "\x1b[33m0\x1b[0m";
const ADJACENT_CHARACTER = "\x1b[34m0\x1b[0m";
const HIT_CHARACTER = "\x1b[31mX\x1b[0m";
const MISS_CHARACTER = "X\x1b[0m";
const SUNK_CHARACTER = HIT_CHARACTER;
const HIT_BLINK_CHARACTER = "\x1b[5m" + HIT_CHARACTER;
const MISS_BLINK_CHARACTER = "\x1b[5m" + MISS_CHARACTER;

// mapping the character codes to the character strings
const CHARACTERS = [
  WATER_CHARACTER,
  SHIP_CHARACTER,
  ADJACENT_CHARACTER,
  HIT_CHARACTER,
  MISS_CHARACTER,
  SUNK_CHARACTER,
  HIT_BLINK_CHARACTER,
  MISS_BLINK_CHARACTER,
];

// orientations of the ships
const HORIZONTAL = "H";
const VERTICAL = "V";
const ORIENTATIONS = [HORIZONTAL, VERTICAL];

// translations to access all adjacent cells of a cell
const ADJACENT_CELLS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

/**
 * Function that returns a map object
 * @param {integer} - height: the number of rows of the map
 * @param {integer} - width: the number of columns of the map
 * @returns {object} map object
 */
const createMap = (height = 10, width = 10) => {
  return {
    height: height,
    width: width,
    cells: [],
    shipPositions: [],
    sunkPositions: [],
    hitPositions: [],
    missPositions: [],
    maxLength: 5,

    /**
     * Function that initializes the map.
     * @method
     */
    init() {
      this.cells = [];
      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          this.cells.push({
            type: WATER,
            i: i,
            j: j,
          });
        }
      }
    },

    /**
     * A function that updates the map to its current status.
     * @method
     */
    update(hideShips = true) {
      if (this.cells.length === 0) {
        return;
      }
      for (const cell of this.cells) {
        cell.type = WATER;
      }
      if (!hideShips) {
        this.shipPositions.forEach((index) => {
          this.cells[index].type = SHIP;
        });
      }
      this.missPositions.forEach((index) => {
        this.cells[index].type = MISS;
      });
      this.hitPositions.forEach((index) => {
        this.cells[index].type = HIT;
      });
      this.sunkPositions.forEach((index) => {
        this.cells[index].type = SUNK;
      });
    },

    /**
     * A function checks whether a given cell at positions (i, j) is within
     * the boundaries of the map.
     * @param {integer} - i: row index of the cell
     * @param {integer} - j: column index of the cell
     * @returns {boolean}
     */
    isWithinBoundaries(i, j) {
      if (i >= 0 && i < this.height && j >= 0 && j < this.width) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * A function that returns the positions of the adjacent cells of a map
     * @param {array} - positions: array containing the positions of all the
     * cells of a ship
     * @returns {array} adjacentPosittions: array conating the positions of
     * all the adjacent cells of a ship
     */
    getAdjacentPositions(positions) {
      const adjacentPositions = [];
      for (const index of positions) {
        const { i, j } = this.cells[index];
        for (const cell of ADJACENT_CELLS) {
          const newI = i + cell[0];
          const newJ = j + cell[1];
          const newIndex = this.width * newI + newJ;
          if (!this.isWithinBoundaries(newI, newJ)) {
            continue;
          }
          if (
            this.cells[newIndex].type === VISITED ||
            this.cells[newIndex].type === SHIP
          ) {
            continue;
          }
          adjacentPositions.push(newIndex);
          this.cells[newIndex].type = VISITED;
        }
      }
      return adjacentPositions;
    },

    /**
     * Function that checks whether a ship at the posituons (startI, startJ) has
     * been sunk.
     * @param {integer} - startI: row index of the first cell of the ship
     * @param {integer} - startJ: column index of the first cell of the ship
     * @param {object} - ship: ship object
     * @returns {boolean}
     */

    checkIfSunk1(startI, startJ, ship) {
      // special case when is ship has length = 1
      const sunkPositions = [];
      const i = startI;
      const j = startJ;
      if (ship.length === 1 && this.maxLength !== 1) {
        if (j - 1 >= 0) {
          const startIndex = this.width * i + j - 1;
          if (this.cells[startIndex].type !== MISS) {
            return false;
          }
        }

        if (j + 1 < this.width) {
          const endIndex = this.width * i + j + 1;
          if (this.cells[endIndex].type !== MISS) {
            return false;
          }
        }

        if (i - 1 >= 0) {
          const startIndex = this.width * (i - 1) + j;
          if (this.cells[startIndex].type !== MISS) {
            return false;
          }
        }

        if (i + 1 < this.height) {
          const endIndex = this.width * (i + 1) + j;
          if (this.cells[endIndex].type !== MISS) {
            return false;
          }
        }

        const index = this.width * i + j;
        if (j >= this.width || i >= this.height) {
          return false;
        }
        if (this.cells[index].type !== HIT) {
          return false;
        } else if (this.cells[index].type === HIT) {
          sunkPositions.push(index);
        }
      }

      if (this.maxLength === 1) {
        const index = this.width * i + j;
        if (j >= this.width || i >= this.height) {
          return false;
        }
        if (this.cells[index].type !== HIT) {
          return false;
        } else if (this.cells[index].type === HIT) {
          sunkPositions.push(index);
        }
      }
      // store the positions of the sunk ship
      // remove the corresponding hit positions
      sunkPositions.forEach((position) => {
        const hitIndex = this.hitPositions.indexOf(position);
        const hitPosition = this.hitPositions.splice(hitIndex, 1)[0];
        this.sunkPositions.push(hitPosition);
      });
      return true;
    },

    checkIfSunk2(startI, startJ, ship) {
      const sunkPositions = [];

      // special case when the ship has length = maxLength
      if (ship.orientation === HORIZONTAL && ship.length === this.maxLength) {
        const i = startI;
        let count = 0;
        for (let j = startJ; j < startJ + ship.length; j++) {
          const index = this.width * i + j;
          if (j >= this.width) {
            break;
          }
          if (this.cells[index].type !== HIT) {
            return false;
          } else if (this.cells[index].type === HIT) {
            sunkPositions.push(index);
            count++;
          }
        }

        if (count < ship.length) {
          return false;
        }
      }

      if (ship.orientation === VERTICAL && ship.length === this.maxLength) {
        const j = startJ;
        let count = 0;
        for (let i = startI; i < startI + ship.length; i++) {
          const index = this.width * i + j;
          if (i >= this.height) {
            break;
          }
          if (this.cells[index].type !== HIT) {
            return false;
          } else if (this.cells[index].type === HIT) {
            sunkPositions.push(index);
            count++;
          }
        }

        if (count < ship.length) {
          return false;
        }
      }
      // if ship is horizontal
      else if (
        ship.orientation === HORIZONTAL &&
        ship.length < this.maxLength
      ) {
        const i = startI;
        if (startJ - 1 >= 0) {
          const startIndex = this.width * i + startJ - 1;
          if (this.cells[startIndex].type !== MISS) {
            return false;
          }
        }

        let count = 0;
        for (let j = startJ; j < startJ + ship.length; j++) {
          const index = this.width * i + j;
          if (j >= this.width) {
            break;
          }
          if (this.cells[index].type !== HIT) {
            return false;
          } else if (this.cells[index].type === HIT) {
            sunkPositions.push(index);
            count++;
          }
        }

        if (count < ship.length) {
          return false;
        }

        if (startJ + ship.length < this.width) {
          const endIndex = this.width * startI + startJ + ship.length;
          if (this.cells[endIndex].type !== MISS) {
            return false;
          }
        }
      }

      // if ship is vertical
      else if (ship.orientation === VERTICAL && ship.length < this.maxLength) {
        const j = startJ;
        if (startI - 1 >= 0) {
          const startIndex = this.width * (startI - 1) + j;
          if (this.cells[startIndex].type !== MISS) {
            return false;
          }
        }

        let count = 0;
        for (let i = startI; i < startI + ship.length; i++) {
          const index = this.width * i + j;
          if (i >= this.height) {
            break;
          }
          if (this.cells[index].type !== HIT) {
            return false;
          } else if (this.cells[index].type === HIT) {
            sunkPositions.push(index);
            count++;
          }
        }

        if (count < ship.length) {
          return false;
        }

        if (startI + ship.length < this.height) {
          const endIndex = this.width * (startI + ship.length) + startJ;
          if (this.cells[endIndex].type !== MISS) {
            return false;
          }
        }
      }

      // store the positions of the sunk ship
      // remove the corresponding hit positions
      sunkPositions.forEach((position) => {
        const hitIndex = this.hitPositions.indexOf(position);
        const hitPosition = this.hitPositions.splice(hitIndex, 1)[0];
        this.sunkPositions.push(hitPosition);
      });
      return true;
    },

    /**
     * Function that checks whether a ship has been sunk
     * @param {object} - ship: ship object
     * @returns {boolean}
     */
    isSunk(ship) {
      for (const cell of this.cells) {
        const { i, j } = cell;
        if (ship.length === 1) {
          if (this.checkIfSunk1(i, j, ship)) {
            console.log(`SHIP OF LENGTH ${ship.length} IS SUNK!`);
            return true;
          }
        } else {
          for (const orientation of ORIENTATIONS) {
            ship.orientation = orientation;
            if (this.checkIfSunk2(i, j, ship)) {
              console.log(
                `SHIP OF LENGTH ${ship.length} AND ORIENTATION ${ship.orientation} IS SUNK!`
              );
              return true;
            }
          }
        }
      }
      return false;
    },

    /**
     * Function that places a ship at the positions (startI, startJ) and returns
     * its positions and the positions of tll he adjacent cells
     * @param {integer} - startI: row index of the first cell of the ship
     * @param {integer} - startJ: column index of the first cell of the ship
     * @param {object} - ship: ship object
     * @returns {array} array containing 3 elements: [0] boolean that indicates
     * whether the placement is successful, [1] array containg the positions of
     * all the cells of the ship, [2] array containg the positions of all the
     * adjacent cells
     */
    getShipPositions(startI, startJ, ship) {
      const positions = [];
      // if the ship is horizontal
      if (ship.orientation === HORIZONTAL) {
        const i = startI;
        for (let j = startJ; j < startJ + ship.length; j++) {
          const index = this.width * i + j;
          if (j >= this.width) {
            return [false, [], []];
          }
          if (
            this.cells[index].type === MISS ||
            this.cells[index].type === SHIP ||
            this.cells[index].type === ADJACENT ||
            this.cells[index].type === SUNK
          ) {
            return [false, [], []];
          }
          positions.push(index);
        }
      }
      // if the ship is vertical
      if (ship.orientation === VERTICAL) {
        const j = startJ;
        for (let i = startI; i < startI + ship.length; i++) {
          const index = this.width * i + j;
          if (i >= this.height) {
            return [false, [], []];
          }
          if (
            this.cells[index].type === MISS ||
            this.cells[index].type === SHIP ||
            this.cells[index].type === ADJACENT ||
            this.cells[index].type === SUNK
          ) {
            return [false, [], []];
          }
          positions.push(index);
        }
      }

      // store the postions of the ship
      positions.forEach((index) => {
        this.cells[index].type = SHIP;
      });
      // get the positions of all adjacent cells
      const adjacentPositions = this.getAdjacentPositions(positions);
      adjacentPositions.forEach((index) => {
        this.cells[index].type = ADJACENT;
      });
      return [true, positions, adjacentPositions];
    },

    /**
     * Function that returns all possible placements of a given ship.
     * @param {object} - ship: ship object
     * @returns {array} shipPlacements: array that contains the positions of the
     * cells of the ship for every possible placement
     */
    getShipPlacements(ship) {
      const shipPlacements = [];
      for (const cell of this.cells) {
        const { i, j } = cell;
        if (ship.length === 1) {
          const [status, positions, adjacentPositions] = this.getShipPositions(
            i,
            j,
            ship
          );
          if (!status) {
            continue;
          }
          this.update();
          shipPlacements.push({
            positions: positions,
            adjacentPositions: adjacentPositions,
          });
        } else {
          for (const orientation of ORIENTATIONS) {
            ship.orientation = orientation;
            const [status, positions, adjacentPositions] =
              this.getShipPositions(i, j, ship);
            if (!status) {
              continue;
            }
            this.update();
            shipPlacements.push({
              positions: positions,
              adjacentPositions: adjacentPositions,
            });
          }
        }
      }
      return shipPlacements;
    },

    /**
     * Function that removes one ship as soon as it has been sunk.
     * @param {array} - array of ship objects
     */
    removeSunkShip(ships) {
      this.update();
      for (let s = 0; s < ships.length; s++) {
        if (this.isSunk(ships[s])) {
          ships.splice(s, 1)[0];
          break;
        }
      }
    },

    /**
     * Function that samples a reasonable amount of configurations via the
     * Monte Carlo method and returns a list of valid configurations.
     * @param {array} - ships: array of ship objects
     * @param {integer} - numberOfSamples: the number of valid configurations
     * that the method retain
     * @returns {array} array containg all valid configurations
     */
    sampleConfigurations(ships, numberOfSamples = 10000) {
      // only keep floating ships
      this.removeSunkShip(ships);
      this.update();

      // get length of the longest remaining ship
      const lengthList = [];
      ships.forEach((ship) => {
        lengthList.push(ship.length);
      });
      this.maxLength = Math.max(...lengthList);

      // get all placements for each ship
      const shipPlacements = [];
      for (const ship of ships) {
        const placements = this.getShipPlacements(ship);
        let validPlacements = [];
        if (this.hitPositions.length > 0) {
          for (const placement of placements) {
            const { positions } = placement;
            if (this.hitPositionsOverlap(positions)) {
              validPlacements.push(placement);
            }
          }
        } else {
          validPlacements = placements;
        }
        shipPlacements.push(validPlacements);
      }

      // under development
      // calculate the upper bound of possible confiurations
      let maxNumberOfSamples = 1;
      shipPlacements.forEach((placements) => {
        if (placements.length > 0) {
          maxNumberOfSamples *= placements.length;
        }
      });
      // reduce the number of samples to save computation time
      // if (maxNumberOfSamples < numberOfSamples) {
      //   numberOfSamples = maxNumberOfSamples;
      // }

      // pick the ship placements randomly and superpose them
      // to obtain a reasonable amount of configurations
      const configurations = [];
      let status = true;
      let n = 0;
      while (n < numberOfSamples) {
        const configuration = [];
        // randomize the order of placement
        const randomPlacements = Random.shuffleList(shipPlacements);

        for (const placements of randomPlacements) {
          const randomIndex = Random.getRandomNumber(0, placements.length);
          const randomPlacement = placements[randomIndex];
          if (!randomPlacement) {
            continue;
          }
          const { positions, adjacentPositions } = randomPlacement;

          // check if the if ships do not intersect
          // and do not touch each other
          if (
            (this.overlap(positions, adjacentPositions, configuration) ||
              this.overlap(positions, adjacentPositions, this.sunkPositions)) &&
            this.hitPositions.length === 0
          ) {
            status = false;
            break;
          }
          status = true;
          configuration.push(...positions);
        }
        if (status) {
          configurations.push(configuration);
          n++;
        }
      }
      return configurations;
    },

    /**
     * Function that checks whether ships intersect or touch each other on the
     * map.
     * @param {array} - positions: array containing the positions of the cells
     * a ship
     * @param {array} - adjacentPositions: array containing the positions of a
     * the adjacent cells of a ship
     * @param {array} - configuration: array containing all the positions of the
     * already placed ships
     * returns {boolean} true if there is no overlap or touching and false
     * otherwise
     */
    overlap(positions, adjacentPositions, configuration) {
      if (configuration.length === 0) {
        return false;
      }
      for (const configurationIndex of configuration) {
        if (
          configurationIndex ===
            positions.find((index) => index === configurationIndex) ||
          configurationIndex ===
            adjacentPositions.find((index) => index === configurationIndex)
        ) {
          //if (indicesA.find((indexA) => indexA === indexB)) {
          return true;
        }
      }
      return false;
    },

    /**
     * Function that checks whether the ships positions overlap with the hit
     * positions.
     * @param {array} - positions: array containing the positions of the cells
     * of a ship
     * @returns {boolean} true if the positions overlap and false otherwise
     */
    hitPositionsOverlap(positions) {
      if (this.hitPositions.length === 0) {
        return true;
      }
      // const randomHitPositions = shuffleList(this.hitPositions);
      if (this.hitPositions.length <= positions.length) {
        for (const index of this.hitPositions) {
          if (
            index !==
            positions.find((positionsIndex) => positionsIndex === index)
          ) {
            return false;
          }
        }
        return true;
      } else if (this.hitPositions.length > positions.length) {
        for (const positionIndex of positions) {
          if (
            positionIndex !==
            this.hitPositions.find((index) => index === positionIndex)
          ) {
            return false;
          }
        }
        return true;
      }
    },

    /**
     * Function that places a single ship on the map.
     * @param {integer} - length
     * @param {string} - orientation
     * @param {integer} - i: row index of the first cell of the ship
     * @param {integre} - j: column index of the first cell of the ship
     * @returns {array} array containing 2 elemnts:
     * [0] boolean that indeciates whether the placement was successful
     * [1] object that represents a ship
     */
    placeShip(length, orientation, i, j) {
      const ship = {
        length: length,
        orientation: orientation,
        type: "",
        hits: 0,
        positions: [],
        adjacentPositions: [],
      };
      const [status, positions, adjacentPositions] = this.getShipPositions(
        i,
        j,
        ship
      );
      if (!status) {
        return [false, {}];
      }
      ship.positions = positions;
      ship.adjacentPositions = adjacentPositions;
      this.shipPositions.push(...positions);
      return [true, ship];
    },

    /**
     * Function that places the ship on the map randomly.
     * @param {array} - lengthList: array containing the lengths of all ships
     * @returns {array} array of ship objects
     */
    placeShipsRandomly(lengthList) {
      const choices = Random.getChoices(this.height, this.width);
      const ships = [];
      let count = 0;
      while (count < lengthList.length) {
        const length = lengthList[count];
        const randomIJ = Random.getRandomNumber(0, choices.length);
        const [i, j] = choices[randomIJ];
        const randomIndex = Random.getRandomNumber(0, ORIENTATIONS.length);
        const orientation = ORIENTATIONS[randomIndex];
        const [status, ship] = this.placeShip(length, orientation, i, j);
        if (status) {
          ships.push(ship);
          choices.splice(
            choices.findIndex((choice) => choice[0] === i && choice[1] === j),
            1
          );

          count++;
        }
      }
      return ships;
    },

    /**
     * Function that checks whether a ship has been hit.
     * @param {integer} - the index of the targeted cell
     * @returns {boolean} true if the ship has been hit and false otherwise
     */
    isHit(shotIndex) {
      if (
        shotIndex === this.shipPositions.find((index) => index === shotIndex)
      ) {
        const hitIndex = this.shipPositions.splice(
          this.shipPositions.indexOf(shotIndex),
          1
        )[0];
        this.hitPositions.push(hitIndex);
        return true;
      } else {
        return false;
      }
    },

    /**
     * Function that targets a cell on the map.
     * @param {integer} - the index of the cell
     * @returns {boolean} true if a ship has been hit and false otherwise
     */
    shoot(index) {
      if (
        this.cells[index].type === HIT ||
        this.cells[index].type === MISS ||
        this.cells[index].type === SUNK
      ) {
        return [false, ""];
      }
      if (this.isHit(index)) {
        console.log("HIT!");
        return [true, HIT_BLINK];
      } else if (this.cells[index].type === WATER) {
        console.log("MISS!");
        this.missPositions.push(index);
        return [true, MISS_BLINK];
      }
    },

    /**
     * Function that prints this map and the other player's map.
     */
    print(mapB) {
      let str = "";
      let abc = "";
      for (let i = 0; i < this.width; i++) {
        abc += `${String.fromCharCode(65 + i)}`;
      }
      str += `   ${abc}    ${abc}\n`;
      for (let i = 0; i < this.height; i++) {
        let rowA = "";
        let rowB = "";
        for (let j = 0; j < this.width; j++) {
          const index = this.width * i + j;
          const typeA = this.cells[index].type;
          const typeB = mapB.cells[index].type;
          rowA += `${CHARACTERS[typeA]}`;
          rowB += `${CHARACTERS[typeB]}`;
        }
        str += `${(i + 1).toString().padStart(2)} ${rowA} `;
        str += `${(i + 1).toString().padStart(2)} ${rowB} ${(i + 1)
          .toString()
          .padStart(2)}\n`;
      }
      str += `   ${abc}    ${abc}\n`;
      console.log(str);
    },

    createProbabilityMatrix(configurations) {
      let matrix = [];
      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          matrix.push(0);
        }
      }

      configurations.forEach((cells) => {
        cells.forEach((index) => {
          matrix[index]++;
        });
      });
      this.hitPositions?.forEach((hitIndex) => {
        matrix[hitIndex] = 0;
      });
      const maxProbability = Math.max(...matrix);
      const indexMaxProbability = matrix.indexOf(maxProbability);
      if (maxProbability !== 0) {
        matrix = matrix.map((element) =>
          Math.ceil((element / maxProbability) * 15)
        );
      }
      return [indexMaxProbability, matrix];
    },

    printProbabilityMatrix(matrix) {
      let str = "   ";
      for (let i = 0; i < this.width; i++) {
        str += `${String.fromCharCode(65 + i)}`;
      }
      str += "\n";
      for (let i = 0; i < this.height; i++) {
        let row = "";
        for (let j = 0; j < this.width; j++) {
          const index = width * i + j;

          row += `${
            Colors.COLOR_GRADIENT[matrix[index]][0] +
            Colors.COLOR_GRADIENT[matrix[index]][1]
          }`;
        }
        str += `${(i + 1).toString().padStart(2)} ${row}\n`;
      }
      console.log(str);
    },
    /**
     * Function that lets the player place the ships manually.
     */
    placeShipManually(length, choices) {
      // random default input
      const randomIJ = Random.getRandomNumber(0, choices.length);
      const [randomI, randomJ] = choices[randomIJ];
      const randomIndex = Random.getRandomNumber(0, ORIENTATIONS.length);
      const randomOrientation = ORIENTATIONS[randomIndex];
      const defaultInput = `${randomI + 1} ${String.fromCharCode(
        randomJ + 65
      )} ${randomOrientation}`;
      // ask for user input
      let message = "";
      message +=
        "PLACE SHIP BY ENTERING THE COORDINATES OF THE FIRST CELL OF THE SHIP AND ITS ORIENTATION\n\n";
      message +=
        "HINT: ROW INDEX = [1-26], COLUMN INDEX = [A-Z], H = HORIZONTAL, V = VERTICAL\n";
      message += "HINT: JUST PRESS <ENTER> TO CHOOSE THE DEFAULT CHOICE\n\n";
      message += `DEFAULT ${randomI + 1} ${String.fromCharCode(
        randomJ + 65
      )} ${randomOrientation}\n\n`;
      console.log(message);
      const input = prompt("COORDINATES AND ORIENTATION = ", defaultInput);
      const match = input.match(
        /(?<i>[0-9]*)\s*(?<j>[a-jA-J])\s+(?<orientation>[HV])/
      );
      if (!match) {
        return [false, null];
      }
      const groups = match.groups;
      const i = parseInt(groups.i) - 1;
      const j = groups.j.charCodeAt(groups.j.indexOf(groups.j[0])) - 65;
      const orientation = groups.orientation;
      const [status, ship] = this.placeShip(length, orientation, i, j);

      if (status) {
        choices.splice(
          choices.findIndex((choice) => choice[0] === i && choice[1] === j),
          1
        );
      }

      return [status, ship];
    },

    playerTurn(choices, map) {
      // random default input
      const randomIJ = Random.getRandomNumber(0, choices.length);
      const [randomI, randomJ] = choices[randomIJ];
      const defaultInput = `${randomI + 1} ${String.fromCharCode(
        randomJ + 65
      )}`;
      // ask for user input
      let message = "";
      message += "YOUR TURN - ENTER COORDINATES\n\n";
      message +=
        "HINT: ROW INDEX = [1-26], COLUMN INDEX = [A-Z], H = HORIZONTAL, V = VERTICAL\n";
      message += "HINT: JUST PRESS <ENTER> TO CHOOSE THE DEFAULT CHOICE\n\n";
      message += `DEFAULT ${randomI + 1} ${String.fromCharCode(
        randomJ + 65
      )}\n\n`;
      console.log(message);
      const input = prompt("COORDINATES = ", defaultInput);
      const match = input.match(/(?<i>[0-9]*)\s*(?<j>[a-jA-J])/);
      if (!match) {
        return [false, -1, ""];
      }
      const groups = match.groups;
      const i = parseInt(groups.i) - 1;
      const j = groups.j.charCodeAt(groups.j.indexOf(groups.j[0])) - 65;
      const index = this.width * i + j;
      const [status, ACTION] = map.shoot(index);
      choices.splice(
        choices.findIndex((choice) => choice[0] === i && choice[1] === j),
        1
      );
      return [status, index, ACTION];
    },
  };
};

module.exports.createMap = createMap;
