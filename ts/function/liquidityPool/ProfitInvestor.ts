const ProfitInvestor = (percent: number, profitInvestor: number): number | void => {
  try {
    const onePercent = profitInvestor / 100;
 
    return percent * onePercent

  } catch (error) {
    console.error(error)
  }
}

export default ProfitInvestor;
