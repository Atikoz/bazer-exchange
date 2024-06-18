const PercentInvestor = (sumPool: number, amountInvestor: number): number | void => {
  try {
    const onePercentPool = sumPool / 100;
    // return { status: true, data: percentInvestor }
    return amountInvestor / onePercentPool;

  } catch (error) {
    console.error(error)
    // return { status: false }
  }
}

export default PercentInvestor;