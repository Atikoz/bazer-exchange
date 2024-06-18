function circumcisionAmount(sum: number): number {
  try {
    const roundedNumber: number = parseFloat(sum.toFixed(6));
    return roundedNumber;
  } catch (error) {
    console.error((error as Error).message);
    throw error;
  }
}

export default circumcisionAmount;
