document.addEventListener("DOMContentLoaded", function () {
    const elementsToAnimate = document.querySelectorAll(".horizontal-line, .title");

    function checkVisibility() {
        elementsToAnimate.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                element.classList.add("animate");
            } else {
                element.classList.remove("animate"); // Remove to allow retriggering
            }
        });
    }

    window.addEventListener("scroll", checkVisibility);
    checkVisibility(); // Check on page load
});


