document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll(".fade-in-section");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // optional: stop observing after it's visible
      }
    });
  }, 
  {
    threshold: 0.1 // optional: tweak when the fade-in should trigger
  });

  faders.forEach(section => observer.observe(section));
});