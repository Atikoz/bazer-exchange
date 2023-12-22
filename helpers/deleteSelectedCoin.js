function deleteSelectedCoin (selectedButtonId, arrayElement) {
  const selectedIndex = arrayElement.findIndex(button => button === selectedButtonId);
  if (selectedIndex !== -1) {
    arrayElement.splice(selectedIndex, 1);
  }
};

module.exports = deleteSelectedCoin;