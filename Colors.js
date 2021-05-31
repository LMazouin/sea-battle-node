const SPACE = " \x1b[0m";
const LIGHT_SHADE = "░\x1b[0m";
const MEDIUM_SHADE = "▒\x1b[0m";
const DARK_SHADE = "▓\x1b[0m";

const WHITE = "\x1b[0m]";
const RED = "\x1b[41m";
const MAGENTA = "\x1b[45m";
const BLUE = "\x1b[44m";
const CYAN = "\x1b[46m";
const GREEN = "\x1b[42m";
const RED_MAGENTA = "\x1b[41m\x1b[35m";
const MAGENTA_RED = "\x1b[45m\x1b[31m";
const BLUE_MAGENTA = "\x1b[44m\x1b[35m";
const MAGENTA_BLUE = "\x1b[45m\x1b[34m";
const BLUE_CYAN = "\x1b[44m\x1b[36m";
const CYAN_BLUE = "\x1b[46m\x1b[34m";
const CYAN_GREEN = "\x1b[46m\x1b[32m";
const GREEN_CYAN = "\x1b[42m\x1b[36m";

const COLOR_GRADIENT = [
  [RED, SPACE],
  [RED_MAGENTA, LIGHT_SHADE],
  [RED_MAGENTA, MEDIUM_SHADE],
  [MAGENTA_RED, MEDIUM_SHADE],
  [MAGENTA_RED, LIGHT_SHADE],
  [MAGENTA, SPACE],
  [MAGENTA_BLUE, LIGHT_SHADE],
  [MAGENTA_BLUE, MEDIUM_SHADE],
  [BLUE_MAGENTA, MEDIUM_SHADE],
  [BLUE_MAGENTA, LIGHT_SHADE],
  [BLUE, SPACE],
  [BLUE_CYAN, LIGHT_SHADE],
  [BLUE_CYAN, MEDIUM_SHADE],
  [CYAN_BLUE, MEDIUM_SHADE],
  [CYAN_BLUE, LIGHT_SHADE],
  [CYAN, SPACE],
  // [CYAN_GREEN, LIGHT_SHADE],
  // [CYAN_GREEN, MEDIUM_SHADE],
  // [GREEN_CYAN, MEDIUM_SHADE],
  // [GREEN_CYAN, LIGHT_SHADE],
  // [GREEN, SPACE],
].reverse();

module.exports.COLOR_GRADIENT = COLOR_GRADIENT;
