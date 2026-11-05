"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const year = document.querySelector("#current-year");
const flyby = document.querySelector("#ovni-flyby");
const pointerDialog = document.querySelector("#pointer-dialog");
const pointerForm = document.querySelector("#pointer-form");
const soundToggle = document.querySelector("#sound-toggle");
const soundStatus = document.querySelector("#sound-status");

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

if (flyby instanceof HTMLElement && pointerDialog instanceof HTMLDialogElement && pointerForm instanceof HTMLFormElement) {
  const closeButtons = pointerDialog.querySelectorAll("[data-close-pointer-dialog]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let audioContext = null;
  let soundEnabled = false;

  const playFlybySound = () => {
    if (!audioContext || !soundEnabled || audioContext.state !== "running") {
      return;
    }

    const duration = 3;
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

    noise.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(360, now + duration);
    noiseVolume.gain.setValueAtTime(0.0001, now);
    noiseVolume.gain.exponentialRampToValueAtTime(0.045, now + 0.45);
    noiseVolume.gain.setValueAtTime(0.035, now + 1.5);
    noiseVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    drone.type = "sine";
    drone.frequency.setValueAtTime(104, now);
    drone.frequency.exponentialRampToValueAtTime(62, now + duration);
    droneVolume.gain.setValueAtTime(0.0001, now);
    droneVolume.gain.exponentialRampToValueAtTime(0.018, now + 0.6);
    droneVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(noiseVolume);
    noiseVolume.connect(audioContext.destination);
    drone.connect(droneVolume);
    droneVolume.connect(audioContext.destination);
    noise.start(now);
    noise.stop(now + duration);
    drone.start(now);
    drone.stop(now + duration);
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
    if (!reducedMotion.matches && typeof flyby.animate === "function") {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const lowY = Math.max(100, height * 0.3);
      const highY = Math.max(140, height * 0.68);

      flyby.animate(
        [
          { transform: `translate3d(-140px, ${lowY}px, 0) rotate(-12deg)`, opacity: 0 },
          { transform: `translate3d(${width * 0.22}px, ${highY}px, 0) rotate(8deg)`, opacity: 1 },
          { transform: `translate3d(${width * 0.48}px, ${lowY - 35}px, 0) rotate(-5deg)`, opacity: 1 },
          { transform: `translate3d(${width * 0.75}px, ${highY - 25}px, 0) rotate(10deg)`, opacity: 1 },
          { transform: `translate3d(${width + 140}px, ${lowY}px, 0) rotate(-8deg)`, opacity: 0 }
        ],
        { duration: 3000, easing: "ease-in-out", fill: "forwards" }
      );
    }

    playFlybySound();

    window.setTimeout(() => {
      if (pointerDialog.isConnected && !pointerDialog.open) {
        pointerDialog.showModal();
      }
    }, 3000);
  }, 0);
}
