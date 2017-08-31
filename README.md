# Tiny Slider

A super lightweight horizontal image slider made with vanilla javascript. 
Intended use is to copy and modify the code directly, move html elements around, etc.



## Features:

### Scroll Modes:
 - **Endless:** allows scrolling in either direction on an endless loop. Currently requires user to put the "first" slide at index 1 in their markup (not index 0).
 - **Rewind:** when scrolling past the last slide, the slider visibly rewinds back to the first slide
 
### Animation:
 - only scrolling (no fading) supported
 - animation timing and easing set in CSS via the `g-slider--is-animating` class
 - classes for previous, active, and next slides:
    ```
    .g-slider__slide--is-prev
    .g-slider__slide--is-current
    .g-slider__slide--is-next

    ```


### Lazy loading: (No AJAX)
 - Slide images can be loaded on-demand instead of all at once by substituting `data-src` for the `src` attribute. Slide images are loaded when they are 2 slides away from the current slide, relative to the scroll direction.

    ```
        <div class="g-slider__slide g-slider__slide--4">
          <img src="img/img-4.png" />
          <!-- this slide's image will load when the page loads -->
        </div>
        <div class="g-slider__slide g-slider__slide--5">
          <img data-src="img/img-5.png" />
          <!-- this slide's image will load when the user scrolls close it it. Slide 3 if scrolling right, or slide 7 if scrolling left. -->
        </div>
    ```

 - Currently you must have at least 5 images load when the page loads, with the `current_index` set to the center slide.

## In Progress:
 - **Responsive Review** 


## Planned:
 - address intro delay
     - curtain over slider while images loading + event listener for when images loaded?
 - Init via object
 - Turn README into usage documentation
