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

document.addEventListener("DOMContentLoaded", function() {
    const words = ["Aspiring Developer", "Occasional Bug Designer", "Enthusiastic Problem Solver", "Technology Enthusiast"];
    let index = 0;

    function animateText() {
        const textContainer = document.querySelector(".animated-text");
        textContainer.textContent = words[index];
        
        // Clear text after some time
        setTimeout(() => {
            textContainer.textContent = ""; // Clear text
        }, 2000); // Time before clearing text (2 seconds)

        // Update index to show next word
        index = (index + 1) % words.length; // Loop back to start
    }

    setInterval(animateText, 4000); // Change the interval as necessary
    animateText(); // Initial call to display the first word
});



