const g_s = {

  container               : document.querySelector('.g-slider'),

  track                   : document.querySelector('.g-slider__track'),

  slides                  : null,

  // any additional slide width, in pixels
  slide_width_modifier    : 2,

  current_index           : 1,

  scrolling_right         : true,

  endless_scroll          : false,

  // gets me the next n
  getNextInSequence       : delta => {
                              let nextInSequence = g_s.current_index + delta;

                              // diff employed to allow scrolling more than one slide at a time
                              let diff = 0;

                              // if the next number is off the end
                              if ( nextInSequence >= g_s.slides.length ) {

                                // see how far we wanted to scroll
                                diff = nextInSequence - g_s.current_index

                                // and scroll that far into the beginning
                                nextInSequence = -1 + diff;
                              }

                              // if the next number goes into the negatives
                              if ( nextInSequence < 0 ) {

                                // see how far
                                diff = 0 - -nextInSequence;

                                // and reverse that far from the end
                                nextInSequence = g_s.slides.length + diff;
                              }
                              return nextInSequence;
                            },

  // function to refresh `slides` from time to time
  setSlides               : () => {
                              g_s.slides = Array.from(document.querySelectorAll('.g-slider__slide')).map(current => ({elem: current, width: current.clientWidth}))
                            },

  // resets an object-scoped bool based on whether user scrolled L or R
  // using this is unecessary but makes code easier to read
  setScrollDirection      : delta => {
                            if ( delta > 0 ) {
                              g_s.scrolling_right = true;
                            } else if ( delta < 0 ) {
                              g_s.scrolling_right = false;
                            }
                          },

  // this is not currently in use
  // it also doesn't work as intended when images are lazy loaded
  getTrackWidth           : () => {
                              // it seems that there is one missing margin, no matter what
                              var width = g_s.slide_width_modifier;
                              width = width + 
                                      // widths of all slides
                                      g_s.slides.map(current => current.width).reduce( (prev, curr) => prev + curr + 
                                      // plus the border width (if set)
                                      g_s.slide_width_modifier );
                              return width;
                            },

  // sets the CSS to center the current image
  setTrackPosition        : () => {

                              // all slide elements that come before the current one
                              const preceeding_slides = g_s.slides.filter(current => g_s.slides.indexOf(current) < g_s.current_index );
                              // console.table(preceeding_slides);

                              // add up widths of all slides before this one
                              const preceeding_slide_widths = preceeding_slides.map(current => current.width);
                              // console.log('preceeding widths: ', preceeding_slide_widths);
                              
                              // prevent error from reducing empty array
                              let preceeding_widths = 0;
                              if ( preceeding_slide_widths.length > 0 ) {
                                preceeding_widths += preceeding_slide_widths.reduce((prev, curr) => prev + curr + g_s.slide_width_modifier );
                              }
                              // console.log('combined preceeding width: ', preceeding_widths);

                              // get diff between current slide and window
                              // console.log('current width: ', g_s.slides[g_s.current_index].width)
                              const diff = g_s.container.clientWidth - g_s.slides[g_s.current_index].width;
                              // console.log('diff: ', diff);

                              // add diff / 2 to widths
                              const total_width = preceeding_widths - ( diff / 2 );

                              // set track position
                              g_s.track.style.transform = 'translateX(' + -total_width + 'px)';
                            },

  switchSrc               : image => {
                              // set src attribute to value from `data-src`
                              image.setAttribute('src', image.dataset.src );

                              // remove `data-src` attribute entirely
                              image.removeAttribute( 'data-src' );

                              // set up event listener to reset slides once image loads
                              if ( image.complete ) {
                                g_s.setSlides();
                              } else {
                                image.addEventListener( 'load', g_s.setSlides );
                              }
                            },

  loadIf                  : delta => {
                              let outer_slide;
                              let delta_extended = delta + delta;

                              // delta + delta here allows us to load the slide after the next one in both directions
                              outer_slide = g_s.slides[ g_s.getNextInSequence(delta_extended) ];
                              // console.log('the slide I am checking is ', outer_slide.elem);

                              // find image inside slide
                              const image = outer_slide.elem.querySelector('img');

                              // if the image has a `data-src attribute`
                              if ( image.dataset.src ) {

                                // remove `data-src` and set `src` value
                                g_s.switchSrc(image);
                              }
                            },

  // hopefully self-explanatory
  setImageClasses         : (action) => {
                              g_s.slides[g_s.getNextInSequence(-1)].elem.classList.toggle('g-slider__slide--is-prev');
                              g_s.slides[g_s.current_index].elem.classList.toggle('g-slider__slide--is-current');
                              g_s.slides[g_s.getNextInSequence(1)].elem.classList.toggle('g-slider__slide--is-next');
                            },

  // run all of the functions needed to more forward or back
  update                  : (delta = 0) => {
                              // set scroll direction
                              g_s.setScrollDirection(delta);

                              // remove current classes from current slides
                              g_s.setImageClasses('remove');

                              // set index the next slide in the current sequence
                              g_s.current_index = g_s.getNextInSequence(delta);

                              // if we have moved, check and update src attributes
                              if ( delta !== 0 ) {
                                g_s.loadIf(delta);
                              }

                              // find if we're near an edge while moving right
                              if ( g_s.scrolling_right ) {

                                // flags the last two indexes while moving right
                                if ( g_s.current_index >= (g_s.slides.length - 1 ) ) {

                                  // target first slide
                                  let slide_to_move = g_s.track.querySelector('.g-slider__slide:first-child');

                                  // remove first slide
                                  let moved_slide = g_s.track.removeChild(slide_to_move);

                                  // append as last slide
                                  g_s.track.appendChild(moved_slide);

                                  // reset slides
                                  g_s.setSlides();

                                  // set current index as if I am on the previous slide
                                  g_s.current_index = g_s.current_index + -(delta*2);

                                  // reset translation of track to previous slide
                                  g_s.setTrackPosition();

                                  // re-select current index to the "new" next slide
                                  g_s.current_index = g_s.getNextInSequence(delta);
                                }

                              // find if we're near an edge while moving left
                              } else if ( !g_s.scrolling_right ) {

                                // flags the last two indexes while moving left
                                if ( g_s.current_index <= 0 ) {

                                  // target last slide
                                  let slide_to_move = g_s.track.querySelector('.g-slider__slide:last-child');

                                  // remove last slide
                                  let moved_slide = g_s.track.removeChild(slide_to_move);

                                  // append as first slide
                                  g_s.track.insertBefore(moved_slide, g_s.track.querySelector('.g-slider__slide:first-child'));

                                  // reset slides info
                                  g_s.setSlides();

                                  // set current index as if I am on the next slide
                                  g_s.current_index = g_s.current_index + -(delta*2);

                                  // reset translation of track to next slide
                                  g_s.setTrackPosition();

                                  // re-select current index to the "new" next slide
                                  g_s.current_index = g_s.getNextInSequence(delta);

                                }
                              }
                              
                              // required for browser to catch up with infinite scroll
                              setTimeout(function(){

                                // add animating class to slider track (will not animate without)
                                g_s.container.classList.add('g-slider--is-animating');
                                // console.log('before animation', g_s.track.style.transform);

                                // set CSS for slider track
                                g_s.setTrackPosition();

                                // add classes to new slides
                                g_s.setImageClasses('add');
                              }, 1);
                              
                            },

  init                    : () => {
                              // get current state of slides
                              g_s.setSlides();

                              // set track position
                              g_s.setTrackPosition();

                              // add classes to the proper elements
                              g_s.setImageClasses();
                              
                              // trigger to remove class from slider once transition is over
                              g_s.container.addEventListener('transitionend', function(){
                                g_s.container.classList.remove('g-slider--is-animating');
                              });

                              //
                              document.querySelector('.g-slider__slide--is-prev').addEventListener('click', function(){
                                g_s.update(-1);
                              }, false);
                              document.querySelector('.g-slider__slide--is-next').addEventListener('click', function(){
                                g_s.update(1);
                              }, false);

                              // trigger to recalculate slide widths when window resize occurs
                              var last_known_scroll_position = 0;
                              var ticking = false;
                              window.addEventListener('resize', function(e) {
                                last_known_scroll_position = window.scrollY;
                                if (!ticking) {
                                  window.requestAnimationFrame(function() {
                                    g_s.setSlides();
                                    g_s.setTrackPosition();
                                    ticking = false;
                                  });
                                }
                                ticking = true;
                              });
                            }
}

// timeout here is to ensure that the slider doesn't center itself on the current_index
// without all images loaded
setTimeout(function(){
  g_s.init();
},500)
