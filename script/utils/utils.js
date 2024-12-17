import { sv } from "./variables.js";
export function getAspectRatio(img) {
  if (!img || !img.width || !img.height) {
    throw new Error("Invalid image object");
  }

  const width = img.width;
  const height = img.height;

  // Normalize the aspect ratio to always be <= 1
  // return width > height ? height / width : width / height;
  return width / height;
}

export function fitImageToWindow(img, resizeTo = "bodyRight") {
  let resizeAppToMe = document.getElementById(resizeTo);
  const resizeAppToMeWidth = resizeAppToMe.offsetWidth;
  const resizeAppToMeHeight = resizeAppToMe.offsetHeight;
  const windowWidth = resizeAppToMeWidth;
  const windowHeight = resizeAppToMeHeight;

  // Calculate aspect ratios
  const imgAspect = img.width / img.height;
  const windowAspect = windowWidth / windowHeight;

  let newWidth, newHeight;

  // Determine new dimensions while maintaining aspect ratio
  if (windowAspect > imgAspect) {
    // Fit by height
    newHeight = windowHeight;
    newWidth = windowHeight * imgAspect;
  } else {
    // Fit by width
    newWidth = windowWidth;
    newHeight = windowWidth / imgAspect;
  }

  if (sv.fitImageToWindowGraphic) {
    sv.fitImageToWindowGraphic.remove();
    sv.fitImageToWindowGraphic = undefined;
  }

  const resizedImg = sv.p.createGraphics(newWidth, newHeight);
  resizedImg.image(img, 0, 0, newWidth, newHeight);

  sv.fitImageToWindowGraphic = resizedImg;

  return resizedImg;
}

export function downloadCanvas(_canvas, name = "canvas.png") {
  const dataURL = _canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = name;
  link.click();
}

// GLOBAL ERROR HANDLER

window.onerror = function (message, source, lineno, colno, error) {
  showUserWarning(`An error occurred: ${message}`);
  return false; // Let other error handlers run
};

// Add promise rejection handler
window.onunhandledrejection = function (event) {
  showUserWarning(`A promise error occurred: ${event.reason}`);
};

// Helper function to show warnings to user
function showUserWarning(message) {
  // Create or get warning element
  let warningEl = document.getElementById("warning-message");
  if (!warningEl) {
    warningEl = document.createElement("div");
    warningEl.id = "warning-message";
    warningEl.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff0000;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 999009;
            display: none;
        `;
    document.body.appendChild(warningEl);
  }

  // Show warning
  warningEl.textContent = message;
  warningEl.style.display = "block";

  // Hide after 5 seconds
  setTimeout(() => {
    warningEl.style.display = "none";
  }, 5000);
}
