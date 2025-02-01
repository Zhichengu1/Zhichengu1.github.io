window.addEventListener('scroll', function() {
    const line = document.querySelector('.horizontal-line');
    
    // Get the position of the element relative to the viewport
    const linePosition = line.getBoundingClientRect();
    
    // Check if the element is in the viewport
    if (linePosition.top <= window.innerHeight && linePosition.bottom >= 0) {
        // Add the animation class when it's in the viewport
        if (!line.classList.contains('animate')) {
            line.classList.add('animate');
        }
    } else {
        // Optionally, remove the animation to allow it to trigger again on scroll
        line.classList.remove('animate');
    }
});

window.addEventListener('scroll', function() {
    const title = document.querySelector('.title');
    
    // Get the position of the element relative to the viewport
    const titlePosition = title.getBoundingClientRect();
    
    // Check if the element is in the viewport
    if (titlePosition.top <= window.innerHeight && titlePosition.bottom >= 0) {
        // Add the 'animate' class when the element is in the viewport
        if (!title.classList.contains('animate')) {
            title.classList.add('animate');
        }
    } else {
        // Optionally, remove the animation class to reset the animation when the element goes out of view
        title.classList.remove('animate');
    }
});

