/* =========================================================
   THEME
   ---------------------------------------------------------
   Loads the dark/light mode saved from index.html
   ========================================================= */

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
}

/* =========================================================
   PROJECT IMAGE VIEWER
   ---------------------------------------------------------
   Features:
   - 100% = image fitted completely inside viewer
   - 125%, 150%, 200%... = zoom relative to fitted size
   - Mouse-wheel zoom
   - Drag image at ANY zoom level, including 100%
   - Image stays within valid boundaries
   - Reset returns to fitted 100%
   - Responsive on resize
   - MINI-MAP REMOVED
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const imageViewer =
  document.getElementById("imageViewer");

const imageViewerWindow =
  document.querySelector(".image-viewer-window");

const imageViewerContent =
  document.getElementById("imageViewerContent");

const viewerImage =
  document.getElementById("viewerImage");

const imageViewerClose =
  document.getElementById("imageViewerClose");

const zoomInButton =
  document.getElementById("zoomIn");

const zoomOutButton =
  document.getElementById("zoomOut");

const zoomResetButton =
  document.getElementById("zoomReset");

const zoomLevel =
  document.getElementById("zoomLevel");


/* =========================================================
   SAFETY CHECK
   ========================================================= */

if (
  !imageViewer ||
  !imageViewerContent ||
  !viewerImage ||
  !zoomLevel
) {
  console.warn(
    "Image viewer elements are missing."
  );
}


/* =========================================================
   VIEWER STATE
   ========================================================= */

/*
 * currentZoom
 *
 * This represents the USER'S zoom percentage.
 *
 * 1    = 100%
 * 1.25 = 125%
 * 1.50 = 150%
 * 2    = 200%
 *
 * 100% is NOT the image's native size.
 *
 * Instead:
 *
 * 100% = image fitted completely inside viewer.
 */

let currentZoom = 1;


/*
 * fitScale
 *
 * The scale required to make the entire
 * image fit inside the viewer.
 */

let fitScale = 1;


/*
 * actualScale
 *
 * The actual CSS scale applied to the image.
 *
 * actualScale =
 *
 *     fitScale × currentZoom
 */

let actualScale = 1;


/*
 * Translation of the image from
 * the center of the viewer.
 */

let translateX = 0;
let translateY = 0;


/* =========================================================
   DRAG STATE
   ========================================================= */

let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let dragStartTranslateX = 0;
let dragStartTranslateY = 0;


/* =========================================================
   CONSTANTS
   ========================================================= */

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const BUTTON_ZOOM_STEP = 0.25;
const WHEEL_ZOOM_STEP = 0.15;


/* =========================================================
   UTILITY
   ========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(max, value)
  );

}


/* =========================================================
   GET VIEWER SIZE
   ========================================================= */

function getViewerSize() {

  return {

    width:
      imageViewerContent.clientWidth,

    height:
      imageViewerContent.clientHeight

  };

}


/* =========================================================
   CALCULATE FIT SCALE
   ========================================================= */

/*
 * Calculates the scale needed for 100%.
 *
 * The entire image must fit inside
 * the available viewer area.
 */

function calculateFitScale() {

  if (
    !viewerImage.naturalWidth ||
    !viewerImage.naturalHeight
  ) {

    fitScale = 1;

    return fitScale;

  }


  const viewerWidth =
    imageViewerContent.clientWidth;

  const viewerHeight =
    imageViewerContent.clientHeight;


  if (
    viewerWidth <= 0 ||
    viewerHeight <= 0
  ) {

    fitScale = 1;

    return fitScale;

  }


  const scaleX =
    viewerWidth /
    viewerImage.naturalWidth;

  const scaleY =
    viewerHeight /
    viewerImage.naturalHeight;


  /*
   * The smaller scale guarantees that
   * the complete image fits.
   */

  fitScale =
    Math.min(
      scaleX,
      scaleY
    );


  return fitScale;

}


/* =========================================================
   GET ACTUAL IMAGE SIZE
   ========================================================= */

function getImageSize() {

  return {

    width:
      viewerImage.naturalWidth *
      actualScale,

    height:
      viewerImage.naturalHeight *
      actualScale

  };

}


/* =========================================================
   GET TRANSLATION BOUNDS
   ========================================================= */

/*
 * The image is centered by default.
 *
 * Translation is then limited so that the image
 * cannot be dragged completely outside the viewer.
 *
 * Example:
 *
 * Viewer = 1000px
 * Image  = 1500px
 *
 * Maximum horizontal movement:
 *
 * (1500 - 1000) / 2
 * = 250px
 */

function getTranslationBounds() {

  const viewerWidth =
    imageViewerContent.clientWidth;

  const viewerHeight =
    imageViewerContent.clientHeight;


  const imageSize =
    getImageSize();


  let minX = 0;
  let maxX = 0;

  let minY = 0;
  let maxY = 0;


  /*
   * Horizontal movement
   */

  if (
    imageSize.width >
    viewerWidth
  ) {

    const horizontalLimit =
      (
        imageSize.width -
        viewerWidth
      ) / 2;


    minX =
      -horizontalLimit;

    maxX =
      horizontalLimit;

  }


  /*
   * Vertical movement
   */

  if (
    imageSize.height >
    viewerHeight
  ) {

    const verticalLimit =
      (
        imageSize.height -
        viewerHeight
      ) / 2;


    minY =
      -verticalLimit;

    maxY =
      verticalLimit;

  }


  return {

    minX,
    maxX,

    minY,
    maxY

  };

}


/* =========================================================
   CONSTRAIN TRANSLATION
   ========================================================= */

function constrainTranslation() {

  const bounds =
    getTranslationBounds();


  translateX =
    clamp(
      translateX,
      bounds.minX,
      bounds.maxX
    );


  translateY =
    clamp(
      translateY,
      bounds.minY,
      bounds.maxY
    );

}


/* =========================================================
   UPDATE IMAGE
   ========================================================= */

function updateViewerImage() {

  /*
   * Calculate the actual scale.
   */

  actualScale =
    fitScale *
    currentZoom;


  /*
   * Keep image within boundaries.
   */

  constrainTranslation();


  /*
   * Apply transformation.
   */

  viewerImage.style.transform =
    `translate(${translateX}px, ${translateY}px) scale(${actualScale})`;


  /*
   * Update displayed percentage.
   */

  zoomLevel.textContent =
    `${Math.round(currentZoom * 100)}%`;

}


/* =========================================================
   RESET POSITION
   ========================================================= */

function resetPosition() {

  translateX = 0;
  translateY = 0;

}


/* =========================================================
   RESET VIEWER
   ========================================================= */

function resetViewer() {

  /*
   * Return to 100%.
   */

  currentZoom = 1;


  /*
   * Center image.
   */

  resetPosition();


  /*
   * Recalculate the fitted scale.
   */

  calculateFitScale();


  /*
   * Apply the new scale.
   */

  actualScale =
    fitScale;


  updateViewerImage();

}


/* =========================================================
   SET ZOOM
   ========================================================= */

/*
 * Changes the USER zoom percentage.
 *
 * The actual image size is:
 *
 * fitScale × currentZoom
 *
 * Therefore:
 *
 * 100% = fitted
 * 200% = twice the fitted size
 * 500% = five times the fitted size
 */

function setZoom(newZoom) {

  const oldZoom =
    currentZoom;


  newZoom =
    clamp(
      newZoom,
      MIN_ZOOM,
      MAX_ZOOM
    );


  /*
   * Nothing to change.
   */

  if (
    newZoom === oldZoom
  ) {

    return;

  }


  /*
   * Current actual scale.
   */

  const oldActualScale =
    fitScale *
    oldZoom;


  /*
   * New actual scale.
   */

  const newActualScale =
    fitScale *
    newZoom;


  /*
   * Preserve the approximate image
   * position while zooming.
   */

  if (
    oldActualScale > 0 &&
    newActualScale > 0
  ) {

    const scaleRatio =
      newActualScale /
      oldActualScale;


    translateX *=
      scaleRatio;

    translateY *=
      scaleRatio;

  }


  /*
   * Update zoom state.
   */

  currentZoom =
    newZoom;


  actualScale =
    newActualScale;


  /*
   * Keep image within bounds.
   */

  constrainTranslation();


  /*
   * Render.
   */

  updateViewerImage();

}


/* =========================================================
   OPEN IMAGE VIEWER
   ========================================================= */

document
  .querySelectorAll(".zoomable-image")
  .forEach(image => {

    image.addEventListener(
      "click",
      () => {

        /*
         * Open viewer.
         */

        imageViewer.classList.add(
          "active"
        );


        /*
         * Prevent page scrolling.
         */

        document.body.style.overflow =
          "hidden";


        /*
         * Set main image.
         */

        viewerImage.src =
          image.src;


        viewerImage.alt =
          image.alt ||
          "Project diagram";


        /*
         * If the image is already loaded,
         * initialize immediately.
         */

        if (
          viewerImage.complete &&
          viewerImage.naturalWidth
        ) {

          resetViewer();

        }

      }
    );

  });


/* =========================================================
   IMAGE LOAD
   ========================================================= */

/*
 * Important:
 *
 * The natural dimensions are only reliable
 * after the image has finished loading.
 */

viewerImage.addEventListener(
  "load",
  () => {

    if (
      !imageViewer.classList.contains(
        "active"
      )
    ) {

      return;

    }


    resetViewer();

  }
);


/* =========================================================
   ZOOM IN
   ========================================================= */

if (zoomInButton) {

  zoomInButton.addEventListener(
    "click",
    () => {

      setZoom(
        currentZoom +
        BUTTON_ZOOM_STEP
      );

    }
  );

}


/* =========================================================
   ZOOM OUT
   ========================================================= */

if (zoomOutButton) {

  zoomOutButton.addEventListener(
    "click",
    () => {

      setZoom(
        currentZoom -
        BUTTON_ZOOM_STEP
      );

    }
  );

}


/* =========================================================
   RESET BUTTON
   ========================================================= */

if (zoomResetButton) {

  zoomResetButton.addEventListener(
    "click",
    () => {

      resetViewer();

    }
  );

}


/* =========================================================
   MOUSE WHEEL ZOOM
   ========================================================= */

imageViewerContent.addEventListener(
  "wheel",
  event => {

    /*
     * Prevent the webpage itself
     * from scrolling.
     */

    event.preventDefault();


    if (
      event.deltaY < 0
    ) {

      setZoom(
        currentZoom +
        WHEEL_ZOOM_STEP
      );

    } else {

      setZoom(
        currentZoom -
        WHEEL_ZOOM_STEP
      );

    }

  },
  {
    passive: false
  }
);


/* =========================================================
   START IMAGE DRAG
   ========================================================= */

/*
 * The image can be dragged at:
 *
 * 100%
 * 125%
 * 150%
 * 200%
 * etc.
 *
 * The user does NOT have to zoom first.
 */

imageViewerContent.addEventListener(
  "mousedown",
  event => {

    /*
     * Only start dragging when the
     * actual image is clicked.
     */

    if (
      event.target !== viewerImage
    ) {

      return;

    }


    isDragging = true;


    imageViewerContent.classList.add(
      "dragging"
    );


    /*
     * Remember mouse starting position.
     */

    dragStartX =
      event.clientX;

    dragStartY =
      event.clientY;


    /*
     * Remember image starting position.
     */

    dragStartTranslateX =
      translateX;

    dragStartTranslateY =
      translateY;


    event.preventDefault();

  }
);


/* =========================================================
   IMAGE DRAG MOVEMENT
   ========================================================= */

document.addEventListener(
  "mousemove",
  event => {

    if (!isDragging) {

      return;

    }


    const deltaX =
      event.clientX -
      dragStartX;

    const deltaY =
      event.clientY -
      dragStartY;


    /*
     * Move image based on mouse movement.
     */

    translateX =
      dragStartTranslateX +
      deltaX;

    translateY =
      dragStartTranslateY +
      deltaY;


    /*
     * Prevent image from being dragged
     * outside its valid boundaries.
     */

    constrainTranslation();


    /*
     * Render.
     */

    updateViewerImage();

  }
);


/* =========================================================
   STOP IMAGE DRAG
   ========================================================= */

document.addEventListener(
  "mouseup",
  () => {

    if (!isDragging) {

      return;

    }


    isDragging = false;


    imageViewerContent.classList.remove(
      "dragging"
    );

  }
);


/* =========================================================
   CLOSE VIEWER
   ========================================================= */

function closeImageViewer() {

  /*
   * Close overlay.
   */

  imageViewer.classList.remove(
    "active"
  );


  /*
   * Clear image.
   */

  viewerImage.src = "";


  /*
   * Reset state.
   */

  resetPosition();

  currentZoom = 1;

  actualScale = 1;


  /*
   * Restore page scrolling.
   */

  document.body.style.overflow = "";

}


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

if (imageViewerClose) {

  imageViewerClose.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      closeImageViewer();

    }
  );

}


/* =========================================================
   CLICK OUTSIDE VIEWER
   ========================================================= */

imageViewer.addEventListener(
  "click",
  event => {

    /*
     * Close only when the dark overlay
     * itself is clicked.
     */

    if (
      event.target === imageViewer
    ) {

      closeImageViewer();

    }

  }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      imageViewer.classList.contains(
        "active"
      )
    ) {

      closeImageViewer();

    }

  }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

/*
 * When the browser window changes size,
 * recalculate the fitted scale.
 *
 * The user's current zoom percentage
 * is preserved.
 */

window.addEventListener(
  "resize",
  () => {

    if (
      !imageViewer.classList.contains(
        "active"
      )
    ) {

      return;

    }


    /*
     * Save current zoom.
     */

    const savedZoom =
      currentZoom;


    /*
     * Recalculate 100% fitted scale.
     */

    calculateFitScale();


    /*
     * Restore the same user zoom.
     */

    currentZoom =
      savedZoom;


    actualScale =
      fitScale *
      currentZoom;


    /*
     * Make sure image remains valid.
     */

    constrainTranslation();


    /*
     * Render.
     */

    updateViewerImage();

  }
);


/* =========================================================
   INITIAL STATE
   ========================================================= */

if (
  viewerImage.complete &&
  viewerImage.naturalWidth
) {

  calculateFitScale();

  actualScale =
    fitScale;

  updateViewerImage();

}