export function showLoadingScreen() {
  const loadingScreen = document.querySelector('[data-js="loading-screen"]');
  if (loadingScreen) {
    loadingScreen.style.display = 'block';
  }
}

export function hideLoadingScreen() {
  const loadingScreen = document.querySelector('[data-js="loading-screen"]');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}
