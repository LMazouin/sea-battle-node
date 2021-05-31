const prompt = require("prompt-sync")({ sigint: true });

const Random = require("./Random.js");
const Map = require("./Map.js");

const HEIGHT = 10;
const WIDTH = 10;

const SUBMARINE = 1;
const FRIGATE = 2;
const DESTROYER = 3;
const CRUISER = 4;
const BATTLESHIP = 5;

console.clear();

const SHIPS = [SUBMARINE, FRIGATE, DESTROYER, CRUISER, BATTLESHIP];

const mapA = Map.createMap(HEIGHT, WIDTH);
const mapB = Map.createMap(HEIGHT, WIDTH);

mapA.init();
mapB.init();

mapA.update(false);
mapB.update(true);

mapA.print(mapB);

const choicesPlacement = Random.getChoices(mapA.height, mapA.width);

const shipsA = [];
let count = 0;

while (count < SHIPS.length) {
  const length = SHIPS[count];
  const [status, ship] = mapA.placeShipManually(length, choicesPlacement);

  if (status) {
    console.clear();
    shipsA.push(ship);
    mapA.print(mapB);
    count++;
  } else if (!ship) {
    console.clear();
    mapA.print(mapB);
    console.log(
      "\x1b[31mERROR IN YOUR COMMAND! EXAMPLE: TYPE 1A H TO PLACE A HORIZONTAL SHIP AT CELL (1,A)\x1b[0m"
    );
  } else {
    console.clear();
    mapA.print(mapB);
    console.log("\x1b[35mYOU CANNOT PLACE A SHIP THERE! TRY AGAIN!\x1b[0m");
  }
}

// const shipsA = mapA.placeShipsRandomly(SHIPS);

const shipsB = mapB.placeShipsRandomly(SHIPS);

mapA.update(false);
mapB.update(true);

console.clear();
mapA.print(mapB);

const choicesShots = Random.getChoices(mapB.height, mapB.width);

let randomIndex = Random.getRandomNumber(0, mapA.cells.length);

let turn = 0;
while (turn < mapA.cells.length) {
  // player turn
  const [playerStatus, index, playerAction] = mapA.playerTurn(
    choicesShots,
    mapB
  );
  if (playerStatus) {
    console.clear();
    mapB.cells[index].type = playerAction;
    mapA.print(mapB);
  } else if (!status && index === -1) {
    console.clear();
    mapA.print(mapB);
    console.log(
      "\x1b[31mERROR IN YOUR COMMAND! EXAMPLE: TYPE 1A TO TARGET CELL AT (1,A)\x1b[0m"
    );
    continue;
  } else if (!status) {
    console.clear();
    mapA.print(mapB);
    console.log(
      "\x1b[35mYOU CANNOT HIT THE SAME SPOT TWICE! TRY AGAIN!\x1b[0m"
    );
    continue;
  }

  prompt("AI TURN - CONTINE: <ENTER> ABORT: <CTRL-C>");

  // AI turn
  const [AIStatus, AIAction] = mapA.shoot(randomIndex);
  if (AIStatus) {
    console.clear();
    mapA.cells[randomIndex].type = AIAction;
    mapA.print(mapB);
  } else {
    // console.clear();
    console.log("ERROR!");
  }

  // console.log(mapB.hitPositions.length);
  if (mapB.hitPositions.length === 15) {
    console.log("YOU WON!");
    break;
  }

  console.clear();
  mapA.update(false);
  mapB.update(true);
  mapA.print(mapB);

  const configurations = mapA.sampleConfigurations(shipsA, 10000);

  if (shipsA.length === 0) {
    console.clear();
    mapB.update(false);
    mapA.print(mapB);
    console.log("AI PLAYER WINS!");
    break;
  }

  const [indexMaxProbability, probabilityMatrix] =
    mapA.createProbabilityMatrix(configurations);

  randomIndex = indexMaxProbability;

  mapA.printProbabilityMatrix(probabilityMatrix, HEIGHT, WIDTH);

  prompt("CONTINUE?");
  console.clear();
  mapA.print(mapB);

  turn++;
}
