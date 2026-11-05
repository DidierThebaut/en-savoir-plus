"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const year = document.querySelector("#current-year");
const flyby = document.querySelector("#ovni-flyby");
const pointerDialog = document.querySelector("#pointer-dialog");
const pointerForm = document.querySelector("#pointer-form");
const soundToggle = document.querySelector("#sound-toggle");
const soundStatus = document.querySelector("#sound-status");
const lensToggle = document.querySelector("#lens-toggle");
const lensStatus = document.querySelector("#lens-status");
const lens = document.querySelector("#ovni-lens");
const lensWord = document.querySelector("#ovni-lens-word");
const ufoCursor = document.querySelector("#ovni-cursor");

if (year) {
  year.textContent = String(new Date().getFullYear());
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
      if (!pointerDialog || !pointerDialog.open) {
        menuButton.focus();
      }
    }
  });
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
    if (!lensEnabled || event.pointerType !== "mouse" || pointerDialog?.open) {
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

if (flyby instanceof HTMLElement && pointerDialog instanceof HTMLDialogElement && pointerForm instanceof HTMLFormElement) {
  const closeButtons = pointerDialog.querySelectorAll("[data-close-pointer-dialog]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const flybyDuration = 12000;
  let audioContext = null;
  let soundEnabled = false;

  const playFlybySound = () => {
    if (!audioContext || !soundEnabled || audioContext.state !== "running") {
      return;
    }

    const duration = flybyDuration / 1000;
    const now = audioContext.currentTime;
    const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
    const samples = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const noiseVolume = audioContext.createGain();
    const drone = audioContext.createOscillator();
    const droneVolume = audioContext.createGain();
    const upperDrone = audioContext.createOscillator();
    const upperVolume = audioContext.createGain();
    const wobble = audioContext.createOscillator();
    const wobbleDepth = audioContext.createGain();

    noise.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(360, now + duration);
    noiseVolume.gain.setValueAtTime(0.0001, now);
    noiseVolume.gain.exponentialRampToValueAtTime(0.08, now + 0.8);
    noiseVolume.gain.setValueAtTime(0.065, now + duration * 0.68);
    noiseVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    drone.type = "sine";
    drone.frequency.setValueAtTime(104, now);
    drone.frequency.exponentialRampToValueAtTime(62, now + duration);
    droneVolume.gain.setValueAtTime(0.0001, now);
    droneVolume.gain.exponentialRampToValueAtTime(0.045, now + 1.2);
    droneVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    upperDrone.type = "triangle";
    upperDrone.frequency.setValueAtTime(157, now);
    upperDrone.frequency.exponentialRampToValueAtTime(91, now + duration);
    upperVolume.gain.setValueAtTime(0.0001, now);
    upperVolume.gain.exponentialRampToValueAtTime(0.016, now + 1.4);
    upperVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    wobble.type = "sine";
    wobble.frequency.setValueAtTime(0.7, now);
    wobble.frequency.linearRampToValueAtTime(2.2, now + duration);
    wobbleDepth.gain.setValueAtTime(5, now);

    noise.connect(filter);
    filter.connect(noiseVolume);
    noiseVolume.connect(audioContext.destination);
    drone.connect(droneVolume);
    droneVolume.connect(audioContext.destination);
    upperDrone.connect(upperVolume);
    upperVolume.connect(audioContext.destination);
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(drone.frequency);
    wobbleDepth.connect(upperDrone.frequency);
    noise.start(now);
    noise.stop(now + duration);
    drone.start(now);
    drone.stop(now + duration);
    upperDrone.start(now);
    upperDrone.stop(now + duration);
    wobble.start(now);
    wobble.stop(now + duration);
  };

  if (soundToggle instanceof HTMLButtonElement && soundStatus instanceof HTMLElement && "AudioContext" in window) {
    soundToggle.addEventListener("click", async () => {
      try {
        if (!audioContext) {
          audioContext = new AudioContext();
        }

        if (soundEnabled) {
          await audioContext.suspend();
          soundEnabled = false;
        } else {
          await audioContext.resume();
          soundEnabled = true;
        }

        soundToggle.setAttribute("aria-pressed", String(soundEnabled));
        soundToggle.textContent = soundEnabled ? "Désactiver le son de l’O.V.N.I." : "Activer le son de l’O.V.N.I.";
        soundStatus.textContent = soundEnabled
          ? "Un effet sonore original accompagnera le survol."
          : "Son désactivé";
      } catch (error) {
        soundEnabled = false;
        soundToggle.setAttribute("aria-pressed", "false");
        soundStatus.textContent = "Impossible d’activer le son. Vérifiez les réglages audio du navigateur.";
        console.error("Unable to activate the O.V.N.I. flyby sound.", error);
      }
    });
  } else if (soundStatus instanceof HTMLElement) {
    soundStatus.textContent = "Le son n’est pas disponible dans ce navigateur.";
    if (soundToggle instanceof HTMLButtonElement) {
      soundToggle.disabled = true;
    }
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => pointerDialog.close());
  });

  pointerDialog.addEventListener("click", (event) => {
    if (event.target === pointerDialog) {
      pointerDialog.close();
    }
  });

  pointerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!pointerForm.reportValidity()) {
      return;
    }

    const formData = new FormData(pointerForm);
    const email = formData.get("email");

    if (typeof email !== "string") {
      pointerForm.reportValidity();
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = "assets/ovni-pointer.svg";
    downloadLink.download = "ovni-pointeur.svg";
    downloadLink.hidden = true;
    document.body.append(downloadLink);
    downloadLink.click();
    const subject = encodeURIComponent("Mon pointeur O.V.N.I.");
    const body = encodeURIComponent(`Bonjour Didier,\n\nJe souhaite recevoir le pointeur O.V.N.I. au format SVG.\n\nMon adresse e-mail : ${email}\n\nJ’accepte que cette adresse soit utilisée uniquement pour m’envoyer le pointeur, sans newsletter ni autre usage.`);
    window.location.href = `mailto:didierthebaut@gmail.com?subject=${subject}&body=${body}`;
    downloadLink.remove();
    pointerDialog.close();
  });

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

      playFlybySound();
    }

    window.setTimeout(() => {
      if (pointerDialog.isConnected && !pointerDialog.open) {
        pointerDialog.showModal();
      }
    }, hasFlybyAnimation ? flybyDuration : 800);
  }, 0);
}
