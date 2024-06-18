function deleteSelectedCoin(selectedButtonId: number, arrayElement: string[]): void {
  const selectedIndex: number = arrayElement.findIndex(button => button === String(selectedButtonId));
  if (selectedIndex !== -1) {
    arrayElement.splice(selectedIndex, 1);
  }
};

export default deleteSelectedCoin;