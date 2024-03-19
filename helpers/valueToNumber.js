const Decimal = require('decimal.js');

function valueToNumber(valueString) {
  const decimalValue = new Decimal(valueString);

  const result = decimalValue.times(new Decimal('1e18'));

  return +result
};

module.exports = valueToNumber;