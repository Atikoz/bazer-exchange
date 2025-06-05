function trimNumber (value: number, digits = 6): number {
  return Math.floor(value * 10 ** digits) / 10 ** digits;
}

export default trimNumber