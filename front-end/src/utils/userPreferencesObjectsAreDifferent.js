export function userPreferencesObjectsAreDifferent(objectA, objectB) {
  // Check if both objects are defined
  if (!objectA || !objectB) {
    return true; // They are different if one is undefined
  }

  // Check if both objects have the same keys
  const keysA = Object.keys(objectA);
  const keysB = Object.keys(objectB);

  if (keysA.length !== keysB.length) {
    return true; // Different number of keys means they are different
  }

  // Check if the values for each key are the same
  for (const key of keysA) {
    if (objectA[key] !== objectB[key]) {
      return true; // Found a difference in values
    }
  }

  return false; // No differences found

}