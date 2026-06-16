/* ===================================================================
   GERADOR DE NÚMEROS PREMIUM — Wealth Number Generator
   Lógica: validação, sorteio animado e efeitos ambientais
   =================================================================== */

(() => {
  "use strict";

  /* -----------------------------------------------------------------
     Referências do DOM
     ----------------------------------------------------------------- */
  const form = document.getElementById("generator-form");
  const minInput = document.getElementById("min-value");
  const maxInput = document.getElementById("max-value");
  const errorMessage = document.getElementById("error-message");
  const generateBtn = document.getElementById("generate-btn");
  const resultNumber = document.getElementById("result-number");
  const particlesContainer = document.getElementById("particles");
  const starsContainer = document.getElementById("stars");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isGenerating = false;

  /* -----------------------------------------------------------------
     Estrelas decorativas — geradas dinamicamente para variação natural
     ----------------------------------------------------------------- */
  function createStars(total = 70) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      const star = document.createElement("span");
      star.className = "star";
      const size = (Math.random() * 2 + 1).toFixed(1);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${(Math.random() * 62).toFixed(2)}%`;
      star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
      star.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
      star.style.animationDuration = `${(3 + Math.random() * 3).toFixed(2)}s`;
      fragment.appendChild(star);
    }
    starsContainer.appendChild(fragment);
  }

  /* -----------------------------------------------------------------
     Validação dos campos
     mínimo não pode ser maior que máximo / aceitar apenas números
     ----------------------------------------------------------------- */
  function readValue(input) {
    const raw = input.value.trim();
    if (raw === "") return NaN;
    return Number(raw);
  }

  function showError(text) {
    errorMessage.textContent = text;
    errorMessage.classList.add("is-visible");
  }

  function clearError() {
    errorMessage.textContent = "";
    errorMessage.classList.remove("is-visible");
  }

  function flagFieldError(input) {
    const field = input.closest(".field");
    field.classList.remove("field-error");
    // força reflow para permitir repetir a animação de shake
    void field.offsetWidth;
    field.classList.add("field-error");
    field.addEventListener(
      "animationend",
      () => field.classList.remove("field-error"),
      { once: true }
    );
  }

  function validate() {
    const min = readValue(minInput);
    const max = readValue(maxInput);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      showError("Informe valores numéricos válidos nos dois campos.");
      if (Number.isNaN(min)) flagFieldError(minInput);
      if (Number.isNaN(max)) flagFieldError(maxInput);
      return null;
    }

    if (min > max) {
      showError("O valor mínimo não pode ser maior que o valor máximo.");
      flagFieldError(minInput);
      flagFieldError(maxInput);
      return null;
    }

    clearError();
    return { min: Math.trunc(min), max: Math.trunc(max) };
  }

  /* -----------------------------------------------------------------
     Sorteio — simulação de "rolagem" antes do número final
     ----------------------------------------------------------------- */
  function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function spawnParticles() {
    const total = 16;
    for (let i = 0; i < total; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";
      const angle = (Math.PI * 2 * i) / total + Math.random() * 0.3;
      const distance = 70 + Math.random() * 50;
      particle.style.setProperty("--px", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--py", `${Math.sin(angle) * distance}px`);
      particle.style.animationDelay = `${Math.random() * 80}ms`;
      particlesContainer.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove());
    }
  }

  function runDraw(min, max) {
    isGenerating = true;
    generateBtn.disabled = true;
    resultNumber.classList.remove("is-settling");

    const finalValue = randomInRange(min, max);

    if (prefersReducedMotion) {
      resultNumber.textContent = finalValue;
      finishDraw();
      return;
    }

    resultNumber.classList.add("is-cycling");

    // Sequência de "rolagem" com desaceleração progressiva
    const delays = [60, 60, 70, 80, 90, 100, 120, 140, 170, 210, 260];
    let step = 0;

    function tick() {
      if (step < delays.length) {
        resultNumber.textContent = randomInRange(min, max);
        step += 1;
        setTimeout(tick, delays[step - 1]);
      } else {
        resultNumber.classList.remove("is-cycling");
        resultNumber.textContent = finalValue;
        resultNumber.classList.add("is-settling");
        spawnParticles();
        finishDraw();
      }
    }

    tick();
  }

  function finishDraw() {
    setTimeout(() => {
      generateBtn.disabled = false;
      isGenerating = false;
    }, 200);
  }

  /* -----------------------------------------------------------------
     Eventos
     ----------------------------------------------------------------- */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isGenerating) return;

    const values = validate();
    if (!values) return;

    runDraw(values.min, values.max);
  });

  [minInput, maxInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (errorMessage.classList.contains("is-visible")) {
        validate();
      }
    });
  });

  /* -----------------------------------------------------------------
     Parallax sutil no cenário (apenas desktop, sem movimento reduzido)
     ----------------------------------------------------------------- */
  function initParallax() {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const moon = document.querySelector(".moon");
    const skyline = document.querySelector(".skyline");
    let frame = null;

    window.addEventListener("mousemove", (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        moon.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
        skyline.style.transform = `translate(${x * 4}px, 0)`;
        frame = null;
      });
    });
  }

  /* -----------------------------------------------------------------
     Inicialização
     ----------------------------------------------------------------- */
  createStars();
  initParallax();
})();