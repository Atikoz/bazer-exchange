const circumcisionAmount = (sum) => {
  const multiplier = 10 ** 4;
  const truncatedValue = Math.trunc(sum * multiplier) / multiplier;
  return truncatedValue.toFixed(4);
  // return Math.trunc(sum * 1e4) / 1e4
};

module.exports = circumcisionAmount;