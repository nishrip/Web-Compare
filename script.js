const slider = document.getElementById('slider');
const right = document.getElementById('right');
const left = document.getElementById('left');
const container = document.querySelector('.container');

let isDraggingSlider = false;
let isDraggingView = false;

let dragStartX = 0;
let dragStartY = 0;
let dragLastX = 0;
let dragLastY = 0;

let scale = 1;
let posX = 0;
let posY = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateSlider(x) {
  const rect = container.getBoundingClientRect();
  let offsetX = x - rect.left;
  offsetX = clamp(offsetX, 0, rect.width);
  const percent = (offsetX / rect.width) * 100;
  slider.style.left = percent + '%';
  right.style.clipPath = `inset(0 0 0 ${percent}%)`;
}

function updateBackgroundPosition() {
  const containerRect = container.getBoundingClientRect();

  const bgWidth = containerRect.width * scale;
  const bgHeight = containerRect.height * scale;

  const maxShiftX = Math.max(0, (bgWidth - containerRect.width) / 2);
  const maxShiftY = Math.max(0, (bgHeight - containerRect.height) / 2);

  posX = clamp(posX, -maxShiftX, maxShiftX);
  posY = clamp(posY, -maxShiftY, maxShiftY);

  const posXPercent = maxShiftX === 0 ? 50 : 50 - (posX / maxShiftX) * 50;
  const posYPercent = maxShiftY === 0 ? 50 : 50 - (posY / maxShiftY) * 50;

  left.style.backgroundSize = `${scale * 100}% auto`;
  right.style.backgroundSize = `${scale * 100}% auto`;

  left.style.backgroundPosition = `${posXPercent}% ${posYPercent}%`;
  right.style.backgroundPosition = `${posXPercent}% ${posYPercent}%`;
}

// Slider Events
slider.addEventListener('mousedown', e => {
  isDraggingSlider = true;
  e.preventDefault();
});
document.addEventListener('mouseup', () => {
  isDraggingSlider = false;
  slider.blur();
  // WICHTIG: Hier dragLastX/Y syncen, falls gerade View gezogen wurde
  if (isDraggingView) {
    isDraggingView = false;
    dragLastX = posX;
    dragLastY = posY;
  }
  container.style.cursor = 'default';
});
document.addEventListener('mousemove', e => {
  if (!isDraggingSlider) return;
  updateSlider(e.clientX);
});
slider.addEventListener('touchstart', e => {
  isDraggingSlider = true;
  e.preventDefault();
}, { passive: false });
document.addEventListener('touchend', () => {
  isDraggingSlider = false;
  slider.blur();
  if (isDraggingView) {
    isDraggingView = false;
    dragLastX = posX;
    dragLastY = posY;
  }
  container.style.cursor = 'default';
});
document.addEventListener('touchmove', e => {
  if (!isDraggingSlider) return;
  updateSlider(e.touches[0].clientX);
}, { passive: false });

// Pan Events (nur wenn nicht Slider gezogen)
container.addEventListener('mousedown', e => {
  if (isDraggingSlider) return;
  isDraggingView = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragLastX = posX;
  dragLastY = posY;
  container.style.cursor = 'grabbing';
  e.preventDefault();
});
document.addEventListener('mouseup', () => {
  if (isDraggingView) {
    isDraggingView = false;
    dragLastX = posX;
    dragLastY = posY;
    container.style.cursor = 'default';
  }
});
document.addEventListener('mousemove', e => {
  if (!isDraggingView) return;
  e.preventDefault();
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  posX = dragLastX + dx;
  posY = dragLastY + dy;
  updateBackgroundPosition();
});

container.addEventListener('touchstart', e => {
  if (isDraggingSlider) return;
  if (e.touches.length === 1) {
    isDraggingView = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    dragLastX = posX;
    dragLastY = posY;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  }
}, { passive: false });
container.addEventListener('touchend', e => {
  if (isDraggingView) {
    isDraggingView = false;
    dragLastX = posX;
    dragLastY = posY;
    container.style.cursor = 'default';
  }
});
container.addEventListener('touchmove', e => {
  if (!isDraggingView) return;
  e.preventDefault();
  const dx = e.touches[0].clientX - dragStartX;
  const dy = e.touches[0].clientY - dragStartY;
  posX = dragLastX + dx;
  posY = dragLastY + dy;
  updateBackgroundPosition();
}, { passive: false });

// Zoom via Mausrad
container.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomAmount = -e.deltaY * 0.0015;
  let newScale = scale + zoomAmount;
  newScale = clamp(newScale, 1, 5);
  scale = newScale;
  updateBackgroundPosition();
}, { passive: false });

// Initial Position setzen
updateBackgroundPosition();
