# Tiny Gallery Slider

A horizontal image slider made with vanilla javascript.

[Demo](http://daviduffy.me/slider/)

## Usage
Include the `tiny-gallery-slider.min.css` and `tiny-gallery-slider.min.js` in your asset pipeline or directly in the head and body of your site. 

#### HTML
Structure markup as a container `<div>` with a class, id, or other attribute to target. Include a `<ul>` which will act as the slider track, and `<li>`'s for each of the slides. 

  ```HTML
  <div class="class-to-target">
    <ul>
      <li>
        <img src="img/slide.png" />
      </li>
      <li>
        <img src="img/slide.png" />
      </li>
      <li>
        <img src="img/slide.png" />
      </li>
    </ul>
  </div>
  ```

#### CSS
Pick which way suits you best: you can include the regular or minified `tiny-gallery-slider` css file from the `dist` directory, or you can take the `app.sass` file from the `sass` directory if that works better.

#### JavaScript
Include `tiny-gallery-slider.js` or `tiny-gallery-slider.min.js` in your pipeline or add as a script tag directly to the end of the body.


#### Initialization
Target the container `<div>` element mentioned above using whatever method you choose. 

  ```JavaScript
  g_s.init({
    element: document.querySelector('.class-to-target')
  });
  ```

#### Preventing FOUC (flash of unstyled content)
A common problem with using JS to apply style to markup is called "flash of unstyled content." This happens in the brief moment between the browser building your markup and the JS runs. During that split second, the styles applied by your site's CSS will be all that governs the look of your slide elements. There is a strategy that eliminates that effect, but you have to implement it in your regular site files:
  1. Give your slides a class and set them to `opacity: 0` in your CSS. Slides will be set to `opacity: 1` by the slider CSS once the JS has run.
  2. Add a `<div>` element with the class `g-slider__curtain` just after the slide track closing `</ul>` tag. The curtain will fade out once the slider is ready. Optionally, you may add any inner element with the class `g-slider__spinner`. Styles to make the spinner rotate are already present in the CSS.

  ```HTML
  <div class="g-slider__curtain">
    <svg class="g-slider__spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 73.99 73.99"><defs><style>._l{fill:none;stroke:#999;stroke-miterlimit:10;stroke-width:2px;}</style></defs><title>Loader</title><g id="Layer_2" data-name="Layer 2"><path class="_l" d="M73 37.66A36 36 0 1 1 36.28 1" id="Layer_1-2" data-name="Layer 1"/></g></svg>
  </div>
  ```
  _note: `svg` spinner image included with example is shown in the [demo](http://daviduffy.me/slider/)_

## Features

#### Scroll Modes:
 - **Endless:** allows scrolling in either direction on an endless loop. Currently requires user to put the "first" slide at index 1 in their markup (not index 0).
 - **Rewind:** when scrolling past the last slide, the slider visibly rewinds back to the first slide
 
#### Animation:
 - scrolling in either direction supported. fading not supported.
 - animation timing and easing set in CSS via the `g-slider--is-animating` class
 - classes for previous, current, and next slides:
   ```CSS
   .g-slider__slide--is-prev
   .g-slider__slide--is-current
   .g-slider__slide--is-next
   ```

#### Touch-enabled:
 - Slider follows finger input for swipe and flick.

#### Lazy loading: (No AJAX)
 - Slide images can be loaded on-demand by substituting `data-src` for the normal `src` attribute. When a slide with a `data-src` attribute is 2 slides away from the current slide, the image is loaded by adding a `src` attribute and setting it to the value of the `data-src` attribute. The `data-src` attribute is removed.

  ```HTML
  <div class="g-slider__slide g-slider__slide--4">
    <img src="img/img-4.png" />
    <!-- this slide's image will load when the page loads -->
  </div>
  <div class="g-slider__slide g-slider__slide--5">
    <img data-src="img/img-5.png" />
    <!-- this slide's image will load when the user scrolls close it it. Slide 3 if scrolling right, or slide 7 if scrolling left. -->
  </div>
  ```

 - Currently you must have at least 5 images with `src` attributes when the page loads, with the `current_index` set to the center slide.

#### Responsive:
The height of the slider is determined by the `--height` CSS custom property, which you can use or over-write with your own CSS. Media queries are not supplied, so you may write your own MQ's for screen sizes and portrait/landscape.

All child elements in the slider are fluid and will adjust based on the height of this property. The slider recalculates slide widths and track position, re-centering the current slide automatically if the screen dimensions change.

#### Load-in Curtain:
 - Loading spinner on a solid white background is shown until the images are centered on the page (~0.5s). At 0.5s, the curtain and spinner fade out and are removed from the DOM.

## In Progress:
 - Change arbitrary setTimeout delay into actual load-in event triggered when all initial images are loaded.

## Issues:
 - Address blink on swipe off either end of array

## Planned:
 - Accessibility audit and update
 - Add autoprefixer
 - ...
