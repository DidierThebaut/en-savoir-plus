"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const year = document.querySelector("#current-year");
const downloadOpen = document.querySelector("#ovni-download-open");
const downloadDialog = document.querySelector("#ovni-download-dialog");
const downloadClose = document.querySelector("#ovni-download-close");
const lensToggle = document.querySelector("#lens-toggle");
const lensStatus = document.querySelector("#lens-status");
const lens = document.querySelector("#ovni-lens");
const lensWord = document.querySelector("#ovni-lens-word");
const ufoCursor = document.querySelector("#ovni-cursor");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (
  downloadOpen instanceof HTMLButtonElement &&
  downloadDialog instanceof HTMLDialogElement &&
  downloadClose instanceof HTMLButtonElement
) {
  downloadOpen.addEventListener("click", () => {
    downloadDialog.showModal();
  });

  downloadClose.addEventListener("click", () => {
    downloadDialog.close();
  });

  downloadDialog.addEventListener("click", (event) => {
    if (event.target === downloadDialog) {
      downloadDialog.close();
    }
  });
} else {
  console.error("The O.V.N.I. cursor download dialog is unavailable.");
}

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const roseToggle = document.querySelector("#ovni-rose-toggle");
const roseMusic = document.querySelector("#ovni-music");
const roseMain = document.querySelector("main");

if (
  roseToggle instanceof HTMLButtonElement &&
  roseMain instanceof HTMLElement
) {
  const trail = document.createElement("canvas");
  const context = trail.getContext("2d");
  let roseEnabled = false;
  let previousPoint = null;

  trail.className = "ovni-rose-trail";
  trail.setAttribute("aria-hidden", "true");
  trail.hidden = true;
  document.body.append(trail);

  const resizeTrail = () => {
    if (!context) {
      return;
    }

    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    trail.style.width = `${width}px`;
    trail.style.height = `${height}px`;
    trail.width = Math.ceil(width * scale);
    trail.height = Math.ceil(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };

  const paintTrail = (x, y) => {
    if (!context) {
      return;
    }

    const radius = 46;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgb(255 99 182 / 24%)");
    gradient.addColorStop(0.55, "rgb(255 99 182 / 14%)");
    gradient.addColorStop(1, "rgb(255 99 182 / 0%)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  };

  roseToggle.addEventListener("click", () => {
    if (!context) {
      roseToggle.disabled = true;
      console.error("The O.V.N.I. rose effect is unavailable because canvas could not be initialized.");
      return;
    }

    roseEnabled = !roseEnabled;
    roseToggle.setAttribute("aria-pressed", String(roseEnabled));
    roseToggle.textContent = roseEnabled ? "Désactiver la vision rose" : "Activer la vision rose";
    document.body.classList.toggle("ovni-rose-active", roseEnabled);
    trail.hidden = !roseEnabled;
    previousPoint = null;

    if (roseEnabled) {
      resizeTrail();

      if (roseMusic instanceof HTMLAudioElement) {
        roseMusic.currentTime = 0;
        roseMusic.play().catch((error) => {
          console.error("Unable to play the O.V.N.I. rose music.", error);
        });
      } else {
        console.error("The O.V.N.I. rose music element is unavailable.");
      }

      return;
    }

    if (roseMusic instanceof HTMLAudioElement) {
      roseMusic.pause();
      roseMusic.currentTime = 0;
    }

    context.clearRect(0, 0, trail.width, trail.height);
  });

  document.addEventListener("pointermove", (event) => {
    if (!roseEnabled || event.pointerType !== "mouse" || !roseMain.contains(event.target)) {
      previousPoint = null;
      return;
    }

    const point = { x: event.pageX, y: event.pageY };

    if (!previousPoint) {
      paintTrail(point.x, point.y);
    } else {
      const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
      const steps = Math.max(1, Math.ceil(distance / 14));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        paintTrail(
          previousPoint.x + (point.x - previousPoint.x) * progress,
          previousPoint.y + (point.y - previousPoint.y) * progress
        );
      }
    }

    previousPoint = point;
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (roseEnabled) {
      resizeTrail();
      previousPoint = null;
    }
  }, { passive: true });
}

if (
  lensToggle instanceof HTMLButtonElement &&
  lensStatus instanceof HTMLElement &&
  lens instanceof HTMLElement &&
  lensWord instanceof HTMLElement &&
  ufoCursor instanceof HTMLElement
) {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let lensEnabled = false;
  let highlightedText = null;
  let pointerX = -1;
  let pointerY = -1;

  const hideLens = () => {
    lens.hidden = true;
    lensWord.textContent = "";
    ufoCursor.hidden = true;
    highlightedText?.classList.remove("ovni-text-lit");
    highlightedText = null;
    document.body.style.removeProperty("--ovni-x");
    document.body.style.removeProperty("--ovni-y");
  };

  const getWordAtPointer = (x, y, text) => {
    let node = null;
    let offset = 0;
    const caretRange = document.caretRangeFromPoint?.(x, y);

    if (caretRange?.startContainer.nodeType === Node.TEXT_NODE) {
      node = caretRange.startContainer;
      offset = caretRange.startOffset;
    } else {
      const caretPosition = document.caretPositionFromPoint?.(x, y);
      if (caretPosition?.offsetNode.nodeType === Node.TEXT_NODE) {
        node = caretPosition.offsetNode;
        offset = caretPosition.offset;
      }
    }

    if (!node || !text.contains(node)) {
      return "";
    }

    const nodeText = node.textContent ?? "";
    const words = [...nodeText.matchAll(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)];
    let nearestWord = "";
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const word of words) {
      const start = word.index ?? 0;
      const distance = offset < start
        ? start - offset
        : offset > start + word[0].length
          ? offset - start - word[0].length
          : 0;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestWord = word[0];
      }

      if (distance === 0) {
        break;
      }
    }

    return nearestWord;
  };

  lensToggle.addEventListener("click", () => {
    if (!finePointer.matches) {
      lensStatus.textContent = "La loupe O.V.N.I. nécessite une souris ou un pavé tactile.";
      return;
    }

    lensEnabled = !lensEnabled;
    document.body.classList.toggle("ovni-lens-active", lensEnabled);
    lensToggle.setAttribute("aria-pressed", String(lensEnabled));
    lensToggle.textContent = lensEnabled ? "Revenir à la normale" : "Voir la vie en rose";
    lensStatus.textContent = lensEnabled
      ? "Vision rose activée : survolez les mots pour les éclairer et les agrandir."
      : "L’effet rose est désactivé";

    if (!lensEnabled) {
      hideLens();
    }
  });

  document.addEventListener("pointermove", (event) => {
    if (!lensEnabled || event.pointerType !== "mouse") {
      hideLens();
      return;
    }

    pointerX = event.clientX;
    pointerY = event.clientY;
    document.body.style.setProperty("--ovni-x", `${pointerX}px`);
    document.body.style.setProperty("--ovni-y", `${pointerY}px`);

    const target = document.elementFromPoint(event.clientX, event.clientY);

    if (!(target instanceof Element) || !target.closest("main")) {
      hideLens();
      return;
    }

    ufoCursor.hidden = false;
    ufoCursor.style.left = `${event.clientX + 8}px`;
    ufoCursor.style.top = `${event.clientY + 8}px`;

    const textTarget = target.closest("h1, h2, h3, p, li, a, .tag");
    const word = textTarget instanceof HTMLElement
      ? getWordAtPointer(event.clientX, event.clientY, textTarget)
      : "";

    if (!(textTarget instanceof HTMLElement) || !word) {
      hideLens();
      ufoCursor.hidden = false;
      ufoCursor.style.left = `${event.clientX + 8}px`;
      ufoCursor.style.top = `${event.clientY + 8}px`;
      return;
    }

    highlightedText?.classList.remove("ovni-text-lit");
    highlightedText = textTarget;
    highlightedText.classList.add("ovni-text-lit");
    lensWord.textContent = word;

    const lensWidth = 176;
    const lensHeight = 104;
    const left = event.clientX + lensWidth + 32 > window.innerWidth
      ? event.clientX - lensWidth - 24
      : event.clientX + 24;
    const top = event.clientY + lensHeight + 24 > window.innerHeight
      ? event.clientY - lensHeight - 24
      : event.clientY + 24;

    lens.style.left = `${Math.max(8, left)}px`;
    lens.style.top = `${Math.max(8, top)}px`;
    lens.hidden = false;
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      hideLens();
    }
  });

  window.addEventListener("scroll", () => {
    highlightedText?.classList.remove("ovni-text-lit");
    highlightedText = null;
    lens.hidden = true;
    lensWord.textContent = "";
    const target = pointerX >= 0 ? document.elementFromPoint(pointerX, pointerY) : null;
    ufoCursor.hidden = !lensEnabled || !(target instanceof Element) || !target.closest("main");
  }, { passive: true });
  window.addEventListener("blur", () => {
    hideLens();
    document.body.classList.remove("ovni-lens-active");
    lensEnabled = false;
    lensToggle.setAttribute("aria-pressed", "false");
    lensToggle.textContent = "Voir la vie en rose";
    lensStatus.textContent = "L’effet rose est désactivé";
  });

  window.addEventListener("focus", () => {
    pointerX = -1;
    pointerY = -1;
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse") {
      pointerX = event.clientX;
      pointerY = event.clientY;
    }
  }, { passive: true });
}

const flyby = document.querySelector("#ovni-flyby");

if (flyby instanceof HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const flybyDuration = 12000;
  window.setTimeout(() => {
    const hasFlybyAnimation = !reducedMotion.matches && typeof flyby.animate === "function";

    if (hasFlybyAnimation) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const topY = Math.max(100, height * 0.2);
      const lowY = Math.max(120, height * 0.48);
      const highY = Math.max(140, height * 0.76);

      flyby.animate(
        [
          { transform: `translate3d(-140px, ${lowY}px, 0) rotate(-12deg)`, opacity: 0, offset: 0 },
          { transform: `translate3d(${width * 0.14}px, ${topY}px, 0) rotate(8deg)`, opacity: 1, offset: 0.14 },
          { transform: `translate3d(${width * 0.31}px, ${highY}px, 0) rotate(-7deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate3d(${width * 0.47}px, ${topY + 24}px, 0) rotate(6deg)`, opacity: 1, offset: 0.46 },
          { transform: `translate3d(${width * 0.58}px, ${topY + 24}px, 0) rotate(-3deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate3d(${width * 0.73}px, ${highY - 12}px, 0) rotate(8deg)`, opacity: 1, offset: 0.76 },
          { transform: `translate3d(${width * 0.89}px, ${topY + 6}px, 0) rotate(-6deg)`, opacity: 1, offset: 0.91 },
          { transform: `translate3d(${width + 140}px, ${lowY}px, 0) rotate(8deg)`, opacity: 0, offset: 1 }
        ],
        { duration: flybyDuration, easing: "ease-in-out", fill: "forwards" }
      );

      document.body.classList.add("ovni-text-colorizing");
      const colorizeStartedAt = performance.now();
      const colorizeText = (timestamp) => {
        const progress = Math.min((timestamp - colorizeStartedAt) / flybyDuration, 1);
        document.body.style.setProperty("--ovni-text-progress", `${progress * 100}%`);

        if (progress < 1) {
          window.requestAnimationFrame(colorizeText);
        }
      };

      window.requestAnimationFrame(colorizeText);
    }
  }, 0);
}
