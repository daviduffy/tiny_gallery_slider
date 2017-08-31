# Tiny Slider

A super lightweight horizontal image slider made with vanilla javascript. 
Intended use is to copy and modify the code directly, move html elements around, etc.



## Features:

### Scroll Modes:
 - **Endless:** allows scrolling in either direction on an endless loop
 - **Rewind:** when scrolling past the last slide, the slider visibly rewinds back to the first slide
 
### Animation:
 - only scrolling (no fading) supported
 - animation timing and easing set in CSS via the `g-slider--is-animating` class
 - `g-slider__slide--is-active` class on active slide if you want to add your own custom styles


### Lazy loading
 - slide images can be loaded on-demand instead of all at once by substituting `data-src` for the `src` attribute


## In Progress:
 - **Responsive Review** 


## Planned
 - address intro animation (not desirable)
 - Init via object
 - Documentation
