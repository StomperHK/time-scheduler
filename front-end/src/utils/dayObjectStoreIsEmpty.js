export function dayObjectStoreIsEmpty(dayObjectStore) {
  const objectKeys = Object.keys(dayObjectStore)

  for (const key of objectKeys) {
    const costumers = dayObjectStore[key].customers

    costumers.forEach(customer => {
      if (customer.name) return false
    });
  }

  return true
}