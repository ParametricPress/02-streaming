export function isTouchScreen() {
  if (window) {
    return window.matchMedia('(hover: none)').matches;
  }
}