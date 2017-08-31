const g_s = {

  container               : document.querySelector('.g-slider'),

  track                   : document.querySelector('.g-slider__track'),

  slides                  : null,

  // any additional slide width, in pixels
  slide_width_modifier    : 2,

  current_index           : 0,

  scrolling_right         : true,

  endless_scroll          : false,

  getNextInSequence       : delta => {
                              let nextInSequence = g_s.current_index + delta;
                              let diff = 0;

                              // at the end
                              if ( nextInSequence >= g_s.slides.length ) {
                                diff = nextInSequence - g_s.current_index
                                nextInSequence = -1 + diff;
                              }
                              // at the start
                              if ( nextInSequence < 0 ) {
                                diff = 0 - -nextInSequence;
                                nextInSequence = g_s.slides.length + diff;
                              }
                              return nextInSequence;
                            },

  // this is a function because `slides` needs to be refreshed from time to time
  setSlides               : () => {
                              g_s.slides = Array.from(document.querySelectorAll('.g-slider__slide')).map(current => ({elem: current, width: current.clientWidth}))
                            },

  // resets an object-scoped bool based on whether user scrolled L or R
  setScrollDirection      : delta => {
                            if ( delta > 0 ) {
                              g_s.scrolling_right = true;
                            } else if ( delta < 0 ) {
                              g_s.scrolling_right = false;
                            }
                          },

  // this is not currently in use
  // it might also be detrimental to have for lazy loading
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
  setTrackPosition        : (flag = false) => {
                              let the_slide;
                              if ( flag ) {
                                the_slide = g_s.current_index - 1;
                              } else {
                                the_slide = g_s.current_index
                              }
                              // all slide elements that come before the current one
                              const preceeding_slides = g_s.slides.filter(current => g_s.slides.indexOf(current) < the_slide );
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
                              // console.log('current width: ', g_s.slides[the_slide].width)
                              const diff = g_s.container.clientWidth - g_s.slides[the_slide].width;
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

                              // find image inside slide
                              const image = outer_slide.elem.querySelector('img');

                              // if the image has a `data-src attribute`
                              if ( image.dataset.src ) {

                                // remove `data-src` and set `src` value
                                g_s.switchSrc(image);
                              }
                            },

  update                  : (delta = 0) => {
                              // set scroll direction
                              g_s.setScrollDirection(delta);

                              // remove active class from current slide
                              g_s.slides[g_s.current_index].elem.classList.remove('g-slider__slide--is-active');

                              // set index the next slide in the current sequence
                              g_s.current_index = g_s.getNextInSequence(delta);

                              // if we have moved, check and update src attributes
                              if ( delta !== 0 ) {
                                g_s.loadIf(delta);
                              }

                              // find if we're near an edge while moving right
                              if ( g_s.scrolling_right ) {

                                // flags the last two indexes while moving right
                                if ( g_s.current_index >= (g_s.slides.length - 2 ) ) {
                                  console.log('right edge');

                                  // target first slide
                                  const slide_to_move = g_s.track.querySelector('.g-slider__slide:first-child');

                                  // remove first slide
                                  const moved_slide = g_s.track.removeChild(slide_to_move);

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
                                if ( g_s.current_index <= 1 ) {
                                  console.log('left edge');
                                }
                              }
                              
                              // required for browser to catch up with infinite scroll
                              setTimeout(function(){

                                // add animating class to slider track (will not animate without)
                                g_s.track.classList.add('g-slider__track--is-animating');
                                // console.log('before animation', g_s.track.style.transform);

                                // set CSS for slider track
                                g_s.setTrackPosition();

                                // add active class to new slide
                                g_s.slides[g_s.current_index].elem.classList.add('g-slider__slide--is-active');
                              }, 1);
                              
                            },

  init                    : () => {
                              // get current state of slides
                              g_s.setSlides();
                              
                              // remove class once transition is over
                              g_s.track.addEventListener('transitionend', function(){
                                g_s.track.classList.remove('g-slider__track--is-animating');
                              });

                              // run update the first time
                              g_s.update();
                            }
}

setTimeout(function(){
  g_s.init();

}, 500);