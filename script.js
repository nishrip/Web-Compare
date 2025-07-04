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

function updateBackgroundPosition(imageAspectRatio = 2) {
  const containerRect = container.getBoundingClientRect();

  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  const bgWidth = containerWidth * scale;
  const bgHeight = bgWidth / imageAspectRatio;

  const maxShiftX = Math.max(0, bgWidth - containerWidth);
  const maxShiftY = Math.max(0, bgHeight - containerHeight);

  // ✅ Correct clamping range for panning
  posX = clamp(posX, 0, maxShiftX);
  posY = clamp(posY, 0, maxShiftY);

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

let pinchStartDistance = null;
let pinchStartScale = scale;

function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

container.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    pinchStartDistance = getDistance(e.touches[0], e.touches[1]);
    pinchStartScale = scale;
  }
}, { passive: false });

container.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && pinchStartDistance !== null) {
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const zoomFactor = currentDistance / pinchStartDistance;
    scale = clamp(pinchStartScale * zoomFactor, 1, 5);
    updateBackgroundPosition();
    e.preventDefault();
  }
}, { passive: false });

container.addEventListener('touchend', e => {
  if (e.touches.length < 2) {
    pinchStartDistance = null;
  }
});

