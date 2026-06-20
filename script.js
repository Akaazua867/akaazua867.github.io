/**
 * Xavier Akaazua Terngu — Interactive Portfolio Script
 * Upgraded with GreenSock Animation Platform (GSAP), ScrollTrigger, and Lenis Smooth Scroll
 * Supports Light & Dark Theme Toggling and Scroll Management
 */

// 1. Instant theme restoration to prevent layout flash on load
(function () {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Register GSAP ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ==========================================================================
  // 2. LENIS SMOOTH SCROLL INTEGRATION & SCROLL LOCK
  // ==========================================================================
  let lenis;
  function initSmoothScroll() {
    if (typeof Lenis === "undefined" || prefersReducedMotion) return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.4,
      infinite: false
    });

    // Lock scroll immediately for cinematic preloader
    lenis.stop();

    // Tie Lenis scrolling to GSAP ticker updates
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Sync ScrollTrigger on scroll events
    lenis.on("scroll", ScrollTrigger.update);

    // Smooth scroll navigation anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        const target = document.querySelector(href);
        if (!target || href === "#") return;
        e.preventDefault();
        
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }
  initSmoothScroll();

  // ==========================================================================
  // 3. THEME TOGGLER (Light / Dark Mode)
  // ==========================================================================
  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const getCurrentTheme = () => document.documentElement.getAttribute("data-theme") || "dark";
    
    const setTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      
      // Update SVG icons inside toggle button
      const icon = toggleBtn.querySelector("svg");
      if (icon) {
        if (theme === "light") {
          // Switch to Sun icon
          icon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
        } else {
          // Switch to Moon icon
          icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
      }
    };

    // Initial icon state sync
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    toggleBtn.addEventListener("click", () => {
      const current = getCurrentTheme();
      const nextTheme = current === "light" ? "dark" : "light";
      setTheme(nextTheme);
    });
  }
  initThemeToggle();

  // ==========================================================================
  // 4. CINEMATIC PRELOADER (GSAP-Powered)
  // ==========================================================================
  function initPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const circle = preloader.querySelector(".logo-circle");
    const chars = preloader.querySelectorAll(".logo-char");
    const name = preloader.querySelector(".preloader-name");
    const line = preloader.querySelector(".preloader-line");
    const role = preloader.querySelector(".preloader-role");

    if (prefersReducedMotion || typeof gsap === "undefined") {
      document.body.classList.add("loaded");
      preloader.remove();
      if (lenis) lenis.start();
      initPageEntrance();
      return;
    }

    // Set initial styles for fallback safety
    gsap.set([line, role], { opacity: 0 });

    // GSAP Timeline for elegant cinematic loader
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            preloader.remove();
            document.body.classList.add("loaded");
            // Unlock scroll after loader slides away
            if (lenis) lenis.start();
            initPageEntrance();
          }
        });
      }
    });

    // 1. Draw geometric SVG circle
    tl.to(circle, {
      strokeDashoffset: 0,
      duration: 1.0,
      ease: "power2.inOut"
    });

    // 2. Draw initials XA lines
    tl.to(chars, {
      strokeDashoffset: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.6");

    // 3. Cinematic Focus on name (blur off, fade in, tracking letter-spacing expansion)
    tl.to(name, {
      opacity: 1,
      filter: "blur(0px)",
      letterSpacing: "0.15em",
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.3");

    // 4. Expand line
    tl.to(line, {
      scaleX: 1,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out"
    }, "-=0.6");

    // 5. Reveal role subtitle
    tl.to(role, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4");

    // 6. Luxury hold
    tl.to({}, { duration: 0.5 });
  }

  function initPageEntrance() {
    if (typeof gsap === "undefined" || prefersReducedMotion) {
      document.querySelectorAll(".hero-section .reveal-item").forEach(item => {
        item.classList.add("active");
      });
      document.querySelectorAll(".line-mask .line-text").forEach(el => {
        el.style.transform = "translateY(0)";
      });
      triggerHeroCounters();
      initScrollObserver();
      return;
    }

    // Set initial layout states
    gsap.set(".hero-section .reveal-item:not(.hero-headline)", { opacity: 0, y: 30 });
    gsap.set(".line-mask .line-text", { yPercent: 100 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.querySelectorAll(".hero-section .reveal-item").forEach(item => {
          item.classList.add("active");
        });
      }
    });

    // 1. Text Mask reveals for main headline
    tl.to(".line-mask .line-text", {
      yPercent: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.18
    });

    // 2. Animate other hero components in sequence
    const restItems = document.querySelectorAll(".hero-section .reveal-item:not(.hero-headline)");
    tl.to(restItems, {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out",
      onStart: () => {
        setTimeout(triggerHeroCounters, 200);
      }
    }, "-=0.6");

    initScrollObserver();
  }

  initPreloader();

  // ==========================================================================
  // 5. MOUSE CURSOR GLOW
  // ==========================================================================
  function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const glow = document.getElementById("cursor-glow");

    // Hide old mouse glow card
    if (glow) glow.style.display = "none";

    if (!cursor || window.matchMedia("(hover: none)").matches) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.18;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function update() {
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // Expand cursor circle on links and interactive elements using event delegation
    document.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[data-cursor-hover]") ||
        target.closest(".carousel-dot") ||
        target.closest(".carousel-nav")
      ) {
        cursor.classList.add("cursor-hovered");
      } else {
        cursor.classList.remove("cursor-hovered");
      }
    });
  }
  initCustomCursor();

  // ==========================================================================
  // 6. MAGNETIC BUTTONS (GSAP-Powered Attraction)
  // ==========================================================================
  function initMagneticButtons() {
    if (typeof gsap === "undefined" || window.matchMedia("(hover: none)").matches || prefersReducedMotion) return;

    const magnetics = document.querySelectorAll(".btn, .navbar-logo, .nav-link, .direct-link, .theme-toggle");

    magnetics.forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }
  initMagneticButtons();

  // ==========================================================================
  // 7. INTERACTIVE GROWTH DASHBOARD
  // ==========================================================================
  const dashboardData = {
    meta: {
      reach: "100k+",
      ctr: "5.4%",
      roi: "4.8x",
      linePath: "M 0 70 Q 50 50 100 80 T 200 40 T 300 20",
      bgPath: "M 0 100 L 0 70 Q 50 50 100 80 T 200 40 T 300 20 L 300 100 Z"
    },
    google: {
      reach: "48k+",
      ctr: "6.2%",
      roi: "5.1x",
      linePath: "M 0 80 Q 50 60 100 40 T 200 50 T 300 15",
      bgPath: "M 0 100 L 0 80 Q 50 60 100 40 T 200 50 T 300 15 L 300 100 Z"
    },
    seo: {
      reach: "240k+",
      ctr: "3.8%",
      roi: "6.4x",
      linePath: "M 0 95 Q 50 90 100 70 T 200 35 T 300 10",
      bgPath: "M 0 100 L 0 95 Q 50 90 100 70 T 200 35 T 300 10 L 300 100 Z"
    }
  };

  function initGrowthDashboard() {
    const tabs = document.querySelectorAll(".dash-tab");
    const valReach = document.getElementById("dash-val-reach");
    const valCtr = document.getElementById("dash-val-ctr");
    const valRoi = document.getElementById("dash-val-roi");
    const pathLine = document.getElementById("chart-path-line");
    const pathBg = document.getElementById("chart-path-bg");

    if (!tabs.length || !valReach) return;

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const channel = tab.getAttribute("data-channel");
        if (!channel || !dashboardData[channel]) return;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const data = dashboardData[channel];

        gsap.to([valReach, valCtr, valRoi], {
          opacity: 0.15,
          y: -5,
          duration: 0.15,
          onComplete: () => {
            valReach.textContent = data.reach;
            valCtr.textContent = data.ctr;
            valRoi.textContent = data.roi;

            gsap.to([valReach, valCtr, valRoi], {
              opacity: 1,
              y: 0,
              duration: 0.25,
              ease: "power2.out"
            });
          }
        });

        if (pathLine && pathBg) {
          pathLine.setAttribute("d", data.linePath);
          pathBg.setAttribute("d", data.bgPath);

          if (!prefersReducedMotion && typeof gsap !== "undefined") {
            const length = 600;
            gsap.fromTo(pathLine,
              { strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }
            );
          }
        }
      });
    });
  }
  initGrowthDashboard();

  // ==========================================================================
  // 8. METRICS COUNTER ANIMATIONS
  // ==========================================================================
  function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  function animateNumber(element, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      
      const currentValue = Math.floor(easedProgress * (end - start) + start);
      element.textContent = currentValue;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    }
    window.requestAnimationFrame(step);
  }

  function triggerHeroCounters() {
    const heroNumbers = document.querySelectorAll(".metric-number");
    heroNumbers.forEach(num => {
      const targetVal = parseInt(num.getAttribute("data-target"), 10);
      animateNumber(num, 0, targetVal, 1600);
    });
  }

  // ==========================================================================
  // 9. SCROLLTRIGGER SECTIONS REVEALS
  // ==========================================================================
  function initScrollObserver() {
    const revealItems = document.querySelectorAll(".reveal-item:not(.hero-section *)");
    const statNumbers = document.querySelectorAll(".stat-number");
    const statsSection = document.querySelector(".stats-section");

    if (prefersReducedMotion) {
      revealItems.forEach(item => item.classList.add("active"));
      statNumbers.forEach(num => {
        const targetVal = parseInt(num.getAttribute("data-target"), 10);
        num.textContent = targetVal;
      });
      return;
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      revealItems.forEach(item => {
        gsap.fromTo(item, 
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none none",
              onEnter: () => item.classList.add("active")
            }
          }
        );
      });

      if (statsSection && statNumbers.length) {
        ScrollTrigger.create({
          trigger: statsSection,
          start: "top 85%",
          onEnter: () => {
            statNumbers.forEach(num => {
              if (num.textContent === "0") {
                const targetVal = parseInt(num.getAttribute("data-target"), 10);
                animateNumber(num, 0, targetVal, 1800);
              }
            });
          }
        });
      }
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            if (entry.target.classList.contains("stats-section")) {
              statNumbers.forEach(num => {
                if (num.textContent === "0") {
                  const targetVal = parseInt(num.getAttribute("data-target"), 10);
                  animateNumber(num, 0, targetVal, 1800);
                }
              });
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealItems.forEach(item => observer.observe(item));
      if (statsSection) observer.observe(statsSection);
    }
  }

  // ==========================================================================
  // 11. 3D CARD TILT EFFECT
  // ==========================================================================
  function init3DTilt() {
    const tiltCards = document.querySelectorAll("[data-tilt]");
    if (!tiltCards.length || window.matchMedia("(hover: none)").matches || prefersReducedMotion) return;

    tiltCards.forEach(card => {
      card.style.transformStyle = "preserve-3d";
      
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const tiltX = -y * 8;
        const tiltY = x * 8;

        if (typeof gsap !== "undefined") {
          gsap.to(card, {
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: "power2.out"
          });
        } else {
          card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }
      });

      card.addEventListener("mouseleave", () => {
        if (typeof gsap !== "undefined") {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        } else {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        }
      });
    });
  }
  init3DTilt();

  // ==========================================================================
  // 12. NAVIGATION & HAMBURGER SYSTEM
  // ==========================================================================
  function initNavigation() {
    const navbar = document.getElementById("navbar");
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

    if (!navbar || !hamburgerToggle) return;

    function toggleMobileMenu() {
      const isExpanded = hamburgerToggle.getAttribute("aria-expanded") === "true";
      hamburgerToggle.setAttribute("aria-expanded", !isExpanded);
      hamburgerToggle.classList.toggle("active");
      mobileMenuOverlay.classList.toggle("active");
      document.body.style.overflow = isExpanded ? "unset" : "hidden";
    }

    function closeMobileMenu() {
      hamburgerToggle.setAttribute("aria-expanded", "false");
      hamburgerToggle.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "unset";
    }

    hamburgerToggle.addEventListener("click", toggleMobileMenu);
    mobileMenuClose.addEventListener("click", closeMobileMenu);
    mobileNavLinks.forEach(link => link.addEventListener("click", closeMobileMenu));

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 80) {
        navbar.classList.remove("nav-hidden");
        return;
      }

      if (currentScrollY > lastScrollY) {
        navbar.classList.add("nav-hidden");
      } else {
        navbar.classList.remove("nav-hidden");
      }
      lastScrollY = currentScrollY;
    }, { passive: true });

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
      let currentActiveId = "";
      const scrollPosition = window.scrollY + 180;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentActiveId = section.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentActiveId}`) {
          link.classList.add("active");
        }
      });
    }, { passive: true });
  }
  initNavigation();

  // ==========================================================================
  // 13. CLICK SPARKS PARTICLES EFFECT
  // ==========================================================================
  function initClickSparks() {
    if (prefersReducedMotion) return;

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest("input") || target.closest("textarea") || target.closest("select")) return;

      const x = e.pageX;
      const y = e.pageY;
      const particleCount = 8;
      const colors = ["#ffffff", "#cbd5e1", "#94a3b8", "#e2e8f0"];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "click-particle";
        particle.style.position = "absolute";
        particle.style.width = "4px";
        particle.style.height = "4px";
        particle.style.borderRadius = "50%;";
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "10000";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        document.body.appendChild(particle);

        const angle = (i * (360 / particleCount)) * (Math.PI / 180);
        const velocity = 35 + Math.random() * 15;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        const anim = particle.animate([
          { transform: "translate(-50%, -50%) scale(1) translate(0px, 0px)", opacity: 1 },
          { transform: `translate(-50%, -50%) scale(0.2) translate(${tx}px, ${ty}px)`, opacity: 0 }
        ], {
          duration: 500,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)"
        });

        anim.onfinish = () => particle.remove();
      }
    });
  }
  initClickSparks();

  // ==========================================================================
  // 14. SCROLL PROGRESS TRACKER
  // ==========================================================================
  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      bar.style.transform = `scaleX(${scrolled})`;
    }, { passive: true });
  }
  initScrollProgress();

  // ==========================================================================
  // 15. FORM SUBMISSION HANDLING (Web3Forms AJAX Integration)
  // ==========================================================================
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const successMsg = document.getElementById("form-success-msg");

    if (!form || !successMsg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const projectType = document.getElementById("project-type").value;
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !projectType || !message) {
        successMsg.style.color = "#ef4444";
        successMsg.textContent = "✗ Please fill out all required fields.";
        successMsg.classList.add("show");
        return;
      }

      const submitBtn = form.querySelector(".btn-submit");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      const formData = new FormData(form);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      .then(async (response) => {
        const json = await response.json();
        if (response.status === 200) {
          successMsg.style.color = "var(--text-primary)";
          successMsg.textContent = "✓ Message sent! I will respond within 24 hours.";
          successMsg.classList.add("show");
          form.reset();
        } else {
          console.error("Web3Forms Error:", json);
          successMsg.style.color = "#ef4444";
          successMsg.textContent = json.message || "✗ Something went wrong. Please try again.";
          successMsg.classList.add("show");
        }
      })
      .catch((error) => {
        console.error("Network Error:", error);
        successMsg.style.color = "#ef4444";
        successMsg.textContent = "✗ Network error. Please try again later.";
        successMsg.classList.add("show");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        setTimeout(() => {
          successMsg.classList.remove("show");
        }, 5000);
      });
    });
  }
  initContactForm();

  // ==========================================================================
  // 16. SHOWCASE CAROUSELS SYSTEM
  // ==========================================================================
  function initShowcaseCarousels() {
    const carousels = document.querySelectorAll(".showcase-carousel");
    
    carousels.forEach(carousel => {
      const slidesContainer = carousel.querySelector(".carousel-slides");
      const slides = carousel.querySelectorAll(".carousel-slide");
      const prevBtn = carousel.querySelector(".carousel-nav.prev");
      const nextBtn = carousel.querySelector(".carousel-nav.next");
      const dotsContainer = carousel.querySelector(".carousel-indicators");
      
      let currentIndex = 0;
      const totalSlides = slides.length;
      
      if (totalSlides <= 1) return;
      
      // Create indicators
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.classList.add("carousel-dot");
        if (i === 0) dot.classList.add("active");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dotsContainer.appendChild(dot);
      }
      
      const dots = carousel.querySelectorAll(".carousel-dot");
      
      function updateCarousel() {
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, idx) => {
          dot.classList.toggle("active", idx === currentIndex);
        });
      }
      
      function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
      }
      
      function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
      }
      
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextSlide();
      });
      
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prevSlide();
      });
      
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          currentIndex = idx;
          updateCarousel();
        });
      });
      
      // Auto-play every 5 seconds (pauses on hover)
      let autoPlayInterval = setInterval(nextSlide, 5000);
      
      carousel.addEventListener("mouseenter", () => {
        clearInterval(autoPlayInterval);
      });
      
      carousel.addEventListener("mouseleave", () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
      });
    });
  }
  initShowcaseCarousels();

  // ==========================================================================
  // 17. ACHIEVEMENTS TEXT POPUPS PREVIEW SYSTEM
  // ==========================================================================
  function initTextPopups() {
    const preview = document.getElementById("text-popup-preview");
    if (!preview) return;

    const img = preview.querySelector("img");
    const triggers = document.querySelectorAll(".text-popup-trigger");

    if (!img || !triggers.length) return;

    triggers.forEach(trigger => {
      trigger.addEventListener("mouseenter", () => {
        const imageSrc = trigger.getAttribute("data-preview");
        if (!imageSrc) return;
        img.src = imageSrc;
        preview.classList.add("active");
      });

      trigger.addEventListener("mousemove", (e) => {
        // Offset slightly from cursor coordinates
        preview.style.left = `${e.clientX}px`;
        preview.style.top = `${e.clientY}px`;
      });

      trigger.addEventListener("mouseleave", () => {
        preview.classList.remove("active");
      });
    });
  }
  initTextPopups();
});
