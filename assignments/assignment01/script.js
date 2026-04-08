const bgImage = document.getElementById("bgImage");

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const offset = scrollY * 0.18;
    const scale = 1.08 + scrollY * 0.00004;
    bgImage.style.transform = `translateY(${offset}px) scale(${scale})`;
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
    if (entry.isIntersecting) {
        entry.target.classList.add("visible");
    }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -8% 0px"
});

document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .zoom-in").forEach((el) => {
    if (!el.classList.contains("visible")) {
    observer.observe(el);
    }
});
