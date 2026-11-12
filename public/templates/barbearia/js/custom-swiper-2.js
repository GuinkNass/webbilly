const swiper = new Swiper('.swiper', {
  autoplay: {
    delay: 4000,
    disableOnInteraction: false
  },

  loop: true,
  spaceBetween: 0,

  effect: "creative",
  speed: 1800,

  creativeEffect: {
    prev: {
      scale: 1.02,
      opacity: 0,
      translate: [0, 0, 0],
    },

    next: {
      scale: 1.08,
      opacity: 0,
      translate: [0, 0, 0],
    },
  },

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  pagination: {
    el: false,
    clickable: false,
  },
});