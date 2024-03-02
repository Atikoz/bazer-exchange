const circumcisionAmount = (sum) => {
  const roundedNumber = Number(sum.toFixed(6));
  
  return +roundedNumber;

  // return Math.trunc(sum * 1e4) / 1e4
};

module.exports = circumcisionAmount;