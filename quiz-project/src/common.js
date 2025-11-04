// common.js
let menuVisible = false;

function toggleMenu() {
  menuVisible = !menuVisible;
  const menu = document.getElementById('menu');
  if (menu) {
    menu.style.display = menuVisible ? 'block' : 'none';
  }
}

function isMenuActive(mouseX, mouseY) {
  const menu = document.getElementById('menu');
  if (menu) {
    const rect = menu.getBoundingClientRect();
    return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
  }
  return false;
}

function handleCommonMenuPressed(mouseX, mouseY) {
  if (isMenuActive(mouseX, mouseY)) {
    toggleMenu();
  }
}

function showMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.style.display = 'block';
  }
}

function hideMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.style.display = 'none';
  }
}