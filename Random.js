/**
 * Function that returns a random integer number between a lower and upper
 * bound.
 * @function
 * @param {integer} - min: lower bound (included)
 * @param {integer} - max: upper bound (excluded)
 * @returns {integer} random integer
 */
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

/**
 * Function that accepts an array and shuffles its elements randomly.
 * using the Fisher-Yates algorithm
 * @param {array} - list: original array
 * @returns {array} list: shuffled array
 */
const shuffleList = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/**
 * Function that returns a list of tuples of indices of a 2D array
 * @param {integer} - length of the list
 * @returns {array} array containing the tuples
 */
const getChoices = (height, width) => {
  const choices = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      choices.push([i, j]);
    }
  }
  return choices;
};

module.exports.getRandomNumber = getRandomNumber;
module.exports.getChoices = getChoices;
module.exports.shuffleList = shuffleList;
