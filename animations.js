document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }, index * 200);
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        observer.observe(item);
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-left");
      } else {
        entry.target.classList.remove("fade-in-left"); // Remove for re-triggering animation
      }
    });
  }, { threshold: 0.3 });
  
  document.querySelectorAll(".animate-from-left").forEach(el => observer.observe(el));

  const observer_right = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-right");
      } else {
        entry.target.classList.remove("fade-in-right"); // Remove for re-triggering animation
      }
    });
  }, { threshold: 0.3 });
  
  document.querySelectorAll(".animate-from-right").forEach(el => observer_right.observe(el));
  
