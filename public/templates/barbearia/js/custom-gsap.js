document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);
    const fixed = document.querySelector(".gs-fixed");
    if (!fixed) return;
    const section = fixed.closest("section");
    let isFixed = false;
    gsap.set(fixed, {
        opacity: 0,
        visibility: "hidden"
    });
    ScrollTrigger.create({
        trigger: section,
        start: "center center",
        end: "bottom center",
        onEnter: () => {
            if (isFixed) return;
            isFixed = true;
            const rect = fixed.getBoundingClientRect();
            gsap.set(fixed, {
                position: "fixed",
                top: rect.top,
                left: rect.left,
                width: rect.width,
                x: 0,
                y: 0,
                yPercent: 0,
                visibility: "visible",
                opacity: 0
            });
            gsap.to(fixed, {
                top: () => {
                    return (window.innerHeight - fixed.offsetHeight) / 2;
                },
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                overwrite: true
            });
        },
        onLeave: () => {
            gsap.to(fixed, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
                onComplete: () => {
                    gsap.set(fixed, {
                        position: "absolute",
                        top: "auto",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        x: 0,
                        y: 0,
                        yPercent: 0,
                        visibility: "hidden"
                    });
                }
            });
        },
        onEnterBack: () => {
            isFixed = true;
            gsap.set(fixed, {
                position: "fixed",
                top: () => {
                    return (window.innerHeight - fixed.offsetHeight) / 2;
                },
                left: 0,
                width: "100%",
                x: 0,
                y: 0,
                yPercent: 0,
                visibility: "visible",
                opacity: 0
            });
            gsap.to(fixed, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true
            });
        },
        onLeaveBack: () => {
            isFixed = false;
            gsap.set(fixed, {
                position: "absolute",
                top: "50%",
                bottom: "auto",
                left: 0,
                width: "100%",
                x: 0,
                y: 0,
                yPercent: -50,
                visibility: "hidden",
                opacity: 0
            });
        }
    });
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
});
gsap.registerPlugin(ScrollTrigger, SplitText);

// ==================================================
// horizontal testimonials
// ==================================================
const section = document.querySelector(".section-testimonials");
const track = document.querySelector(".testimonials-track");
if (section && track) {
    const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth;
    };
    gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            markers: false
        }
    });
    gsap.to(track, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
            trigger: section,
            start: () => {
                return `top+=${getScrollAmount() * 0.75} top`;
            },
            end: () => {
                return `top+=${getScrollAmount()} top`;
            },
            scrub: true,
            invalidateOnRefresh: true
        }
    });
}