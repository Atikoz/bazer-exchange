const PercentInvestor = (sumPool, amountInvestor) => {
  try {
    const onePercentPool = sumPool / 100;
    // return { status: true, data: percentInvestor }
    return amountInvestor / onePercentPool;


  } catch (error) {
    console.error(error)
    // return { status: false }
  }
}

module.exports = PercentInvestor;

