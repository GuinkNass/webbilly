/**
 * Petly - Vanilla JS (no jQuery, no plugins)
 * All template functionality for Shopify conversion.
 */
(function () {
  "use strict";

  // --- DOM helpers ---
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  // --- 1. Data background / mask ---
  function initDataBackground() {
    $$("[data-bg-src]").forEach(function (el) {
      var src = el.getAttribute("data-bg-src");
      if (src) {
        el.style.backgroundImage = "url(" + src + ")";
        el.classList.add("background-image");
        el.removeAttribute("data-bg-src");
      }
    });
    $$("[data-mask-src]").forEach(function (el) {
      var mask = el.getAttribute("data-mask-src");
      if (mask) {
        el.style.maskImage = "url(" + mask + ")";
        el.style.webkitMaskImage = "url(" + mask + ")";
        el.classList.add("bg-mask");
        el.removeAttribute("data-mask-src");
      }
    });
    $$("[data-background]").forEach(function (el) {
      var bg = el.getAttribute("data-background");
      if (bg) el.style.backgroundImage = "url(" + bg.trim() + ")";
    });
  }

  // --- 2. Sticky header ---
  function initStickyHeader() {
    var header = $(".header-sticky");
    if (!header) return;
    var lastScrollTop = 0;
    window.addEventListener("scroll", function () {
      var st = window.scrollY || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        header.classList.remove("sticky");
        header.classList.add("transformed");
      } else if (st <= 500) {
        header.classList.remove("sticky", "transformed");
      } else {
        header.classList.add("sticky");
        header.classList.remove("transformed");
      }
      lastScrollTop = st;
    }, { passive: true });
  }

  // --- 3. Search panel ---
  function initSearch() {
    var wrap = $(".header__search");
    if (!wrap) return;
    var openBtn = $(".search-open-btn");
    var panel = document.getElementById("site-search");
    var inner = panel && $(".search-inner", panel);
    var input = panel && $(".search-input", panel);
    var closeBtn = panel && $(".search-close", panel);
    var backdrop = panel && $(".search-backdrop", panel);
    var KEY_ESC = 27;

    function openSearch() {
      panel.classList.add("open");
      if (openBtn) openBtn.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (input) setTimeout(function () { input.focus(); }, 180);
    }
    function closeSearch() {
      panel.classList.remove("open");
      if (openBtn) {
        openBtn.setAttribute("aria-expanded", "false");
        openBtn.focus();
      }
      panel.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (openBtn) {
      openBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (panel.classList.contains("open")) closeSearch();
        else openSearch();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", function (e) { e.preventDefault(); closeSearch(); });
    if (backdrop) backdrop.addEventListener("click", closeSearch);
    if (inner) inner.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("keydown", function (e) {
      if (e.keyCode === KEY_ESC && panel && panel.classList.contains("open")) closeSearch();
    });
  }

  // --- 4. Mobile menu (meanmenu replacement) ---
  function initMobileMenu() {
    var menu = $(".main-menu");
    var container = $(".mobile-menu");
    var toggle = $(".bar-icon");
    var sideInfo = $(".side-info");
    var overlay = $(".offcanvas-overlay");
    var closeBtn = $(".side-info-close");
    var meanScreenWidth = 1199;

    function openPanel() {
      if (sideInfo) sideInfo.classList.add("info-open");
      if (overlay) overlay.classList.add("overlay-open");
      document.body.style.overflow = "hidden";
    }
    function closePanel() {
      if (sideInfo) sideInfo.classList.remove("info-open");
      if (overlay) overlay.classList.remove("overlay-open");
      document.body.style.overflow = "";
    }

    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        if (sideInfo && sideInfo.classList.contains("info-open")) closePanel();
        else openPanel();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closePanel);
    if (overlay) overlay.addEventListener("click", closePanel);
    window.addEventListener("scroll", function () {
      if (window.scrollY > 0) closePanel();
    }, { passive: true });

    // Clone desktop menu into mobile container for small screens
    if (menu && container && menu.querySelector("ul")) {
      var clone = menu.querySelector("ul").cloneNode(true);
      clone.classList.add("mobile-nav");
      container.innerHTML = "";
      container.appendChild(clone);

      // Submenu toggles
      container.querySelectorAll(".menu-item-has-children > a").forEach(function (link) {
        link.addEventListener("click", function (e) {
          if (window.innerWidth > meanScreenWidth) return;
          e.preventDefault();
          var li = link.closest(".menu-item-has-children");
          var sub = li.querySelector(".dp-menu, ul");
          if (sub) {
            li.classList.toggle("open");
            sub.style.display = sub.style.display === "block" ? "" : "block";
          }
        });
      });
    }
  }

  // --- 5. Side panel (already wired in initMobileMenu) ---
  // Handled above with side-info and overlay.

  // --- 6. Tabs ---
  function initTabs() {
    $$(".tab-menu li a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var tabMenu = $(".tab-menu");
        if (!tabMenu) return;
        var rect = tabMenu.getBoundingClientRect();
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var windowBottom = scrollTop + window.innerHeight;
        var menuBottom = scrollTop + rect.bottom;
        var menuTop = scrollTop + rect.top;
        if (menuBottom < scrollTop || menuTop > windowBottom) return;

        var targetId = link.getAttribute("data-rel");
        if (!targetId) return;
        var target = document.getElementById(targetId);
        if (!target) return;

        tabMenu.querySelectorAll("li a").forEach(function (a) { a.classList.remove("active"); });
        link.classList.add("active");
        $$(".tab-box").forEach(function (box) { box.style.display = "none"; });
        target.style.display = "block";
      });
    });
  }

  // --- 7. Vanilla sliders (Swiper replacement) ---
  function createSlider(selector, options) {
    const el = document.querySelector(selector);
    if (!el) return;

    const track = el.querySelector(".slider-track");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".slider-slide"));
    const total = slides.length;
    if (total === 0) return;

    const o = options || {};
    const loop = o.loop !== false;
    const autoplayDelay = typeof o.autoplayDelay === "number" ? o.autoplayDelay : 0;
    const slideGap = typeof o.slideGap === "number" ? o.slideGap : 0;

    const nextBtn = o.nextEl ? document.querySelector(o.nextEl) : null;
    const prevBtn = o.prevEl ? document.querySelector(o.prevEl) : null;

    // Responsive slidesPerView
    // Example: {0:1, 576:2, 992:4}
    const breakpoints = o.breakpoints || null;
    const defaultSlidesPerView = o.slidesPerView || 1;

    let current = 0;
    let timer = null;
    let slidesPerView = defaultSlidesPerView;

    // --- Helpers ---
    function getSlidesPerView() {
      if (!breakpoints) return defaultSlidesPerView;

      const w = window.innerWidth;
      let spv = defaultSlidesPerView;

      // pick the highest matching breakpoint
      Object.keys(breakpoints)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((bp) => {
          if (w >= bp) spv = breakpoints[bp];
        });

      return spv;
    }

    function clampIndex(idx) {
      // last index so that we still have a full row of slides visible (non-loop mode)
      const maxIndex = Math.max(0, total - slidesPerView);
      return Math.max(0, Math.min(idx, maxIndex));
    }

    function updateLayout() {
      slidesPerView = getSlidesPerView();

      // each slide width based on slidesPerView
      const slideW = 100 / slidesPerView;
      slides.forEach((s) => {
        s.style.flex = `0 0 ${slideW}%`;
        s.style.width = `${slideW}%`;
        s.style.marginRight = slideGap ? slideGap + "px" : "";
      });

      // if non-loop, keep current within valid range
      if (!loop) current = clampIndex(current);

      goTo(current, true);
    }

    function updateActive() {
      // active slide (for testimonial style)
      slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
    }

    function goTo(index, skipActive = false) {
      if (loop) {
        current = (index + total) % total;
      } else {
        current = clampIndex(index);
      }

      // move one "step" = one slide width
      const step = 100 / slidesPerView;
      track.style.transform = `translateX(-${current * step}%)`;

      if (!skipActive) updateActive();
    }

    function next() {
      if (loop) {
        goTo(current + 1);
      } else {
        // stop at last possible index
        const maxIndex = Math.max(0, total - slidesPerView);
        goTo(Math.min(current + 1, maxIndex));
      }
    }

    function prev() {
      if (loop) {
        goTo(current - 1);
      } else {
        goTo(Math.max(current - 1, 0));
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (autoplayDelay > 0) timer = setInterval(next, autoplayDelay);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // --- Base styles (important) ---
    el.style.overflow = "hidden";
    track.style.display = "flex";
    track.style.transition = "transform 0.6s ease";
    track.style.willChange = "transform";

    // Controls
    if (o.nextEl) {
      document.querySelectorAll(o.nextEl).forEach(btn => {
        btn.addEventListener("click", (e) => { e.preventDefault(); next(); });
      });
    }
    if (o.prevEl) {
      document.querySelectorAll(o.prevEl).forEach(btn => {
        btn.addEventListener("click", (e) => { e.preventDefault(); prev(); });
      });
    }

    // Pause on hover
    el.addEventListener("mouseenter", stopAutoplay);
    el.addEventListener("mouseleave", startAutoplay);

    // Responsive update
    window.addEventListener("resize", () => {
      // small debounce for performance
      clearTimeout(el.__resizeTimer);
      el.__resizeTimer = setTimeout(updateLayout, 120);
    });

    // Init
    updateLayout();
    goTo(0);
    startAutoplay();

    return { next, prev, goTo };
  }

  // Init all vanilla sliders
  function initSliders() {
    // Testimonial1 Slider
    createSlider(".testimonial1-slider", {
      loop: true,
      autoplayDelay: 4000,
      slidesPerView: 1,
      nextEl: ".testimonial1-next",
      prevEl: ".testimonial1-prev",
    });

    // Testimonial2: Synchronized sliders (image + content)
    const testimonial2Slider = document.querySelector('.testimonial2-slider');
    const imageSlider = document.querySelector('.testimonial2-image-slider');

    if (testimonial2Slider && imageSlider) {
      const track = testimonial2Slider.querySelector('.slider-track');
      const slides = Array.from(testimonial2Slider.querySelectorAll('.slider-slide'));
      const total = slides.length;

      // Image slider elements
      const imageTrack = imageSlider.querySelector('.image-slider-track');
      const imageSlides = Array.from(imageSlider.querySelectorAll('.image-slider-slide'));

      if (total > 0 && track && imageTrack) {
        let currentIndex = 0;
        let autoplayTimer = null;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        // Setup controls
        const nextBtn = document.querySelector('.testimonial2-controls__arrowRight');
        const prevBtn = document.querySelector('.testimonial2-controls__arrowLeft');

        // Synchronized update for both sliders
        function updateSliders(animate = true) {
          // Update testimonial slider
          slides.forEach((slide, idx) => {
            slide.classList.toggle('is-active', idx === currentIndex);
          });

          // Update image slider
          imageSlides.forEach((slide, idx) => {
            slide.classList.toggle('is-active', idx === currentIndex);
          });

          // Move testimonial track
          const offset = currentIndex * -100;
          track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
          track.style.transform = `translateX(${offset}%)`;

          // Position image slider to center active image
          let imageOffset;
          if (total <= 3) {
            imageOffset = 0;
          } else {
            imageOffset = -(currentIndex * 33.333);
            if (currentIndex > 0) {
              imageOffset += 33.333;
            }
          }
          imageTrack.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
          imageTrack.style.transform = `translateX(${imageOffset}%)`;

          currentTranslate = offset;
          prevTranslate = offset;
        }


        function goToSlide(index) {
          currentIndex = ((index % total) + total) % total;
          updateSliders();
          resetAutoplay();
        }

        function nextSlide() {
          goToSlide(currentIndex + 1);
        }

        function prevSlide() {
          goToSlide(currentIndex - 1);
        }

        // Touch/Mouse events for dragging
        function getPositionX(event) {
          return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function touchStart(event) {
          startPos = getPositionX(event);
          isDragging = true;
          animationID = requestAnimationFrame(animation);
          track.style.cursor = 'grabbing';
          stopAutoplay();
        }

        function touchMove(event) {
          if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + (currentPosition - startPos);
          }
        }

        function touchEnd() {
          if (!isDragging) return;

          cancelAnimationFrame(animationID);
          isDragging = false;
          track.style.cursor = 'grab';

          // Calculate swipe distance
          const movedBy = currentTranslate - prevTranslate;
          const slideWidth = testimonial2Slider.offsetWidth;

          // If moved more than 25% of slide width, change slide
          if (movedBy < -slideWidth * 0.25 && currentIndex < total - 1) {
            nextSlide();
          } else if (movedBy > slideWidth * 0.25 && currentIndex > 0) {
            prevSlide();
          } else {
            // Snap back to current slide
            updateSliders();
          }

          resetAutoplay();
        }

        function animation() {
          if (isDragging) {
            track.style.transition = 'none';
            track.style.transform = `translateX(${currentTranslate}%)`;
            requestAnimationFrame(animation);
          }
        }

        // Autoplay
        function startAutoplay() {
          stopAutoplay();
          autoplayTimer = setInterval(nextSlide, 4000);
        }

        function stopAutoplay() {
          if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
          }
        }

        function resetAutoplay() {
          stopAutoplay();
          startAutoplay();
        }

        // Event listeners for navigation buttons
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });

        // Touch events
        track.addEventListener('touchstart', touchStart);
        track.addEventListener('touchmove', touchMove);
        track.addEventListener('touchend', touchEnd);

        // Mouse events
        track.addEventListener('mousedown', touchStart);
        track.addEventListener('mousemove', touchMove);
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', () => {
          if (isDragging) touchEnd();
        });

        // Pause on hover
        testimonial2Slider.addEventListener('mouseenter', stopAutoplay);
        testimonial2Slider.addEventListener('mouseleave', startAutoplay);

        // Prevent context menu on long press
        track.addEventListener('contextmenu', (e) => e.preventDefault());

        // Initialize
        track.style.display = 'flex';
        track.style.cursor = 'grab';
        slides.forEach(slide => {
          slide.style.flex = '0 0 100%';
          slide.style.width = '100%';
          slide.style.userSelect = 'none';
          slide.style.pointerEvents = 'none'; // Prevent image drag
        });

        updateSliders(false);
        startAutoplay();
      }
    }

    // Testimonial slider
    const testimonialSlider = $('.testimonial-sliderone');
    if (testimonialSlider) {
      createSlider('.testimonial-sliderone', {
        slidesPerView: 1,
        loop: true,
        autoplayDelay: 5000,
        prevEl: '.testimonial-sliderone-prev',
        nextEl: '.testimonial-sliderone-next'
      });
    }

    // Instagram1 slider (Happy Pets Gallery)
    createSlider(".instagram1-slider", {
      loop: true,
      autoplayDelay: 3000,
      slidesPerView: 1,
      breakpoints: {
        0: 1,
        576: 2,
        768: 3,
        992: 4,
        1200: 5
      },
      slideGap: 0
    });

    // Instagram: multiple per view responsive
    createSlider(".instagram2-slider", {
      loop: true,
      autoplayDelay: 2200,
      slidesPerView: 1, // default
      breakpoints: {
        0: 1,
        576: 2,
        768: 3,
        992: 4
      },
      slideGap: 16
    });

    // Testimonial 3: Layout Three Slider
    createSlider(".testimonial3-slider", {
      loop: true,
      autoplayDelay: 4000,
      slidesPerView: 1,
      nextEl: ".testimonial3-controls__arrow--next",
      prevEl: ".testimonial3-controls__arrow--prev",
    });
  }

  // --- 8. Odometer / counter on scroll ---
  function initOdometer() {
    var items = $$(".odometer");
    if (items.length === 0) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var count = parseInt(el.getAttribute("data-count"), 10) || 0;
          if (el._countDone) return;
          el._countDone = true;
          animateValue(el, 0, count, 1500);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  function animateValue(el, start, end, duration) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 2);
      var value = Math.floor(start + (end - start) * ease);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = end;
    }
    requestAnimationFrame(step);
  }

  // --- 9. WOW-like scroll reveal (Intersection Observer); styles in _vanilla-plugins.scss ---
  function initScrollReveal() {
    var selector = "[data-wow], .wow, [data-ani]";
    var nodes = $$(selector);
    if (nodes.length === 0) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var anim = el.getAttribute("data-wow") || el.getAttribute("data-ani") || "fadeInUp";
          var delay = el.getAttribute("data-ani-delay") || el.getAttribute("data-wow-delay") || "0";
          el.style.animationDelay = delay;
          el.classList.add("animated", anim);
          el.setAttribute("data-revealed", "1");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    nodes.forEach(function (el) {
      if (el.getAttribute("data-revealed")) return;
      observer.observe(el);
    });
  }

  function applyDataAni() {
    $$("[data-ani]").forEach(function (el) {
      var name = el.getAttribute("data-ani");
      if (name) el.classList.add(name);
    });
    $$("[data-ani-delay]").forEach(function (el) {
      var delay = el.getAttribute("data-ani-delay");
      if (delay) el.style.animationDelay = delay;
    });
  }

  // --- 10. Progress bar (.skill) ---
  function initProgressBars() {
    $$(".skill").forEach(function (skill) {
      var percent = parseInt(skill.getAttribute("data-percent"), 10) || 0;
      var bar = skill.querySelector(".progress-bar");
      if (!bar) return;
      bar.style.width = "0%";
      bar.textContent = "0%";
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (skill._done) return;
            skill._done = true;
            animateProgress(bar, percent);
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(skill);
    });
  }

  function animateProgress(barEl, percent) {
    var start = 0;
    var duration = 1500;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 2);
      var w = start + (percent - start) * ease;
      barEl.style.width = w + "%";
      barEl.textContent = Math.floor(w) + "%";
      if (progress < 1) requestAnimationFrame(step);
      else {
        barEl.style.width = percent + "%";
        barEl.textContent = percent + "%";
      }
    }
    requestAnimationFrame(step);
  }

  // --- 11. Accordion ---
  function initAccordion() {
    $$(".faq__question").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq__item");
        if (!item) return;
        var siblings = item.parentElement ? item.parentElement.children : [];
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] !== item) siblings[i].classList.remove("active");
        }
        item.classList.toggle("active");
      });
    });
  }

  // --- 12. Back to top + progress circle ---
  function initBackToTop() {
    var wrap = $(".progress-wrap");
    if (!wrap) return;
    var path = wrap.querySelector("path");
    var onClick = function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len + " " + len;
      path.style.strokeDashoffset = len;
      path.style.transition = "none";
      path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset 100ms linear";

      function updateProgress() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - window.innerHeight;
        var offset = height ? len - (scrollTop * len / height) : len;
        path.style.strokeDashoffset = offset;
      }
      window.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();
    }

    wrap.addEventListener("click", onClick);
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) wrap.classList.add("active-progress");
      else wrap.classList.remove("active-progress");
    }, { passive: true });
  }

  // --- 13. Image lightbox (popup-gallery) ---
  function initPopupGallery() {
    var gallery = $(".popup-gallery");
    if (!gallery) return;
    var links = gallery.querySelectorAll('a[href]');
    if (links.length === 0) return;

    function isImage(href) {
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(href) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(href);
    }
    var imageLinks = Array.from(links).filter(function (a) { return isImage(a.getAttribute("href")); });
    if (imageLinks.length === 0) return;

    var overlay = null;
    var currentIndex = 0;

    function createLightbox() {
      var div = document.createElement("div");
      div.className = "vanilla-lightbox";
      div.style.display = "none";
      div.innerHTML = '<button type="button" class="vanilla-lightbox-close" aria-label="Close">&times;</button>' +
        '<div class="vanilla-lightbox-content"><img src="" alt="" /></div>' +
        '<button type="button" class="vanilla-lightbox-prev" aria-label="Previous">&lsaquo;</button>' +
        '<button type="button" class="vanilla-lightbox-next" aria-label="Next">&rsaquo;</button>';
      document.body.appendChild(div);
      return div;
    }

    overlay = createLightbox();
    var img = overlay.querySelector("img");
    var closeBtn = overlay.querySelector(".vanilla-lightbox-close");
    var prevBtn = overlay.querySelector(".vanilla-lightbox-prev");
    var nextBtn = overlay.querySelector(".vanilla-lightbox-next");

    function show(i) {
      currentIndex = ((i % imageLinks.length) + imageLinks.length) % imageLinks.length;
      var a = imageLinks[currentIndex];
      img.src = a.getAttribute("href");
      img.alt = a.getAttribute("aria-label") || "Image";
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
    function hide() {
      overlay.style.display = "none";
      document.body.style.overflow = "";
    }
    closeBtn.addEventListener("click", hide);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) hide(); });
    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); show(currentIndex - 1); });
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); show(currentIndex + 1); });
    document.addEventListener("keydown", function (e) {
      if (overlay.style.display !== "flex") return;
      if (e.keyCode === 27) hide();
      if (e.keyCode === 37) show(currentIndex - 1);
      if (e.keyCode === 39) show(currentIndex + 1);
    });

    imageLinks.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
      });
    });
  }

  // --- 14. Video popup (popup-video) ---
  function initVideoPopup() {
    $$(".popup-video").forEach(function (container) {
      var link = container.tagName === "A" ? container : container.querySelector("a[href]");
      if (!link) return;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var url = link.getAttribute("href") || "";
        var iframeUrl = url;
        if (url.indexOf("youtube.com") !== -1 || url.indexOf("youtu.be") !== -1) {
          var id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
          if (id) iframeUrl = "https://www.youtube.com/embed/" + id[1] + "?autoplay=1";
        } else if (url.indexOf("vimeo.com") !== -1) {
          var v = url.match(/vimeo\.com\/(\d+)/);
          if (v) iframeUrl = "https://player.vimeo.com/video/" + v[1] + "?autoplay=1";
        }
        var overlay = document.createElement("div");
        overlay.className = "vanilla-video-popup";
        overlay.innerHTML = '<button type="button" aria-label="Close">&times;</button>' +
          '<iframe src="' + iframeUrl + '" allow="autoplay" allowfullscreen></iframe>';
        overlay.querySelector("button").addEventListener("click", function () {
          overlay.remove();
          document.body.style.overflow = "";
        });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ""; } });
        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
      });
    });
  }

  // --- 15. Smooth anchor scroll ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#" || href === "#!") return;
        var id = href.slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // --- 16. Preloader ---
  function initPreloader() {
    var loader = $(".loader-wrap");
    var container = document.getElementById("container");
    if (!loader) return;
    setTimeout(function () {
      if (container) container.classList.add("loaded");
    }, 200);
    setTimeout(function () {
      loader.style.transition = "opacity 0.2s";
      loader.style.opacity = "0";
      setTimeout(function () {
        loader.remove();
      }, 200);
    }, 3000);
  }

  // --- 17. Nice Select replacement (custom select) ---
  function initCustomSelect() {
    $$("select.nice-select, select[data-nice-select]").forEach(function (select) {
      var wrap = document.createElement("div");
      wrap.className = "vanilla-nice-select";
      wrap.style.cssText = "position:relative;display:inline-block;min-width:160px;";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vanilla-nice-select-btn";
      btn.textContent = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "";
      btn.style.cssText = "width:100%;padding:10px 32px 10px 12px;text-align:left;background:#fff;border:1px solid #ccc;border-radius:4px;cursor:pointer;";
      var list = document.createElement("div");
      list.className = "vanilla-nice-select-list";
      list.style.cssText = "display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #ccc;border-radius:4px;max-height:240px;overflow-y:auto;z-index:100;margin-top:4px;";
      Array.from(select.options).forEach(function (opt, i) {
        var item = document.createElement("div");
        item.textContent = opt.text;
        item.style.cssText = "padding:10px 12px;cursor:pointer;";
        item.addEventListener("click", function () {
          select.selectedIndex = i;
          btn.textContent = opt.text;
          list.style.display = "none";
        });
        list.appendChild(item);
      });
      wrap.appendChild(btn);
      wrap.appendChild(list);
      btn.addEventListener("click", function () {
        list.style.display = list.style.display === "block" ? "none" : "block";
      });
      document.addEventListener("click", function (e) {
        if (!wrap.contains(e.target)) list.style.display = "none";
      });
      select.style.position = "absolute";
      select.style.opacity = "0";
      select.style.pointerEvents = "none";
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);
    });
  }




  // --- Run when DOM ready ---
  function init() {
    initDataBackground();
    initStickyHeader();
    initSearch();
    initMobileMenu();
    initTabs();
    initSliders();
    initOdometer();
    initScrollReveal();
    applyDataAni();
    initProgressBars();
    initAccordion();
    initBackToTop();
    initPopupGallery();
    initVideoPopup();
    initSmoothScroll();
    initPreloader();
    initCustomSelect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
