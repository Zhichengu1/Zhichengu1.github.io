document.addEventListener("DOMContentLoaded", function() {
    const boxes = document.querySelectorAll('.box');
    const duration = 2000; // Duration of the animation in ms

    function animateBoxes(forward = true) {
        boxes.forEach((box, index) => {
            setTimeout(() => {
                box.classList.add('animate');
                
                // Remove the class after the animation duration to allow reapplying
                setTimeout(() => {
                    box.classList.remove('animate');
                }, duration);
            }, index * 200); // Adjust timing as needed
        });

        // Re-run the function after the last animation completes
        setTimeout(() => {
            animateBoxes(!forward); // Switch direction
        }, boxes.length * 200 + duration);
    }

    animateBoxes(); // Start the initial animation

    boxes.forEach((box) => {
        box.addEventListener('mouseover', () => {
            animateBoxes();
        }); // Restart animation on hover
    });
});
