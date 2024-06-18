import Decimal from 'decimal.js';

function valueToNumber(valueString: string): number {
  const decimalValue = new Decimal(valueString);
  const result = decimalValue.times(new Decimal('1e18'));
  
  return +result;
}

export default valueToNumber;
