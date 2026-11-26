(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Image Fallback Safety Net (handles cached/early errors too)
     ------------------------------------------------------------------------ */
  const initImageFallbacks = () => {
    const imgs = document.querySelectorAll('.portrait-img, .orbit-logo-img');
    imgs.forEach((img) => {
      const showFallback = () => {
        img.classList.add('is-broken');
        const fallback = img.nextElementSibling;
        if (fallback) {
          fallback.classList.add('is-visible');
        }
      };

      if (img.complete && img.naturalWidth === 0) {
        showFallback();
      } else {
        img.addEventListener('error', showFallback, { once: true });
      }
    });
  };

  /* ------------------------------------------------------------------------
     2. Soft Spotlight Hover Glow (pointer-capable devices)
     ------------------------------------------------------------------------ */
  const initSpotlightCards = () => {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) return;

    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  };

  /* ------------------------------------------------------------------------
     3. One-Tap Copy Chips & Toast Notification
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toast-message');
  let toastTimer = null;

  const showToast = (message) => {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2200);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to legacy fallback
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  };

  const initCopyChips = () => {
    const chips = document.querySelectorAll('.copy-chip[data-copy]');
    chips.forEach((chip) => {
      let resetTimer = null;

      chip.addEventListener('click', async () => {
        const value = chip.getAttribute('data-copy');
        if (!value) return;

        const ok = await copyToClipboard(value);
        if (ok) {
          chip.classList.add('is-copied');
          showToast(`Copied! ${value}`);

          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            chip.classList.remove('is-copied');
          }, 1800);
        } else {
          showToast('Copy unavailable — tap & hold to copy');
        }
      });
    });
  };

  /* ------------------------------------------------------------------------
     4. Smooth Scroll-Reveal Animations
     ------------------------------------------------------------------------ */
  const initScrollReveal = () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 80px 0px',
      }
    );

    revealEls.forEach((el, index) => {
      // Slight stagger for cards in the same row without slowing down perception
      const delay = Math.min((index % 4) * 55, 165);
      el.style.transitionDelay = `${delay}ms`;
      observer.observe(el);
    });
  };

  /* ------------------------------------------------------------------------
     5. Footer Year
     ------------------------------------------------------------------------ */
  const updateYear = () => {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      const currentYear = new Date().getFullYear();
      yearEl.textContent = String(Math.max(currentYear, 2026));
    }
  };

  initImageFallbacks();
  initSpotlightCards();
  initCopyChips();
  initScrollReveal();
  updateYear();
})();
