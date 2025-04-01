export function returnUserExceededTestTime(created_at, is_premium) {
  const accountAge = Date.now() - new Date(created_at).valueOf();
  const twoWeeksInMs = 1000 * 60 * 60 * 24 * 7 * 2;

  if (accountAge > twoWeeksInMs && !is_premium) {
    return true;
  }
}