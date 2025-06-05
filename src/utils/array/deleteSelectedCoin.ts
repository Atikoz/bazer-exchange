function deleteSelectedItem<T>(selectedButtonId: T, array: T[]): void {
  const index = array.findIndex(button => button === selectedButtonId);

  if (index !== -1) {
    array.splice(index, 1);
  }
}

export default deleteSelectedItem;