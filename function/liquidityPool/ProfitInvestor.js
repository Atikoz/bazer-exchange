const ProfitInvestor = (percent, profitInvestor) => {
  try {
    const onePercent = profitInvestor / 100;
 
    return percent * onePercent

  } catch (error) {
    console.error(error)
  }
}

module.exports = ProfitInvestor;
