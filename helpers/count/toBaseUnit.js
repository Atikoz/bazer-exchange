const Big = require('big.js');

const BASE_UNIT = "1000000000000000000";

function toBaseUnit(value) {
  const floatValue = new Big(value);
  const baseUnit = new Big(BASE_UNIT);
  const result = floatValue.times(baseUnit);
  
  return result.toFixed(0);
}

module.exports = toBaseUnit;