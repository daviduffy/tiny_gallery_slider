const g_slider = {
  container               : document.querySelector('.slider'),

  track                   : document.querySelector('.slider__track'),

  slides                  : null,

  // any additional slide width, in pixels
  slide_width_modifier    : 2,

  current_index           : 0,

  relative_index          : 0,

  scrolling_right         : true,

  endless_scroll          : false,

  getNextInSequence       : delta => {
                              let nextInSequence = g_slider.current_index + delta;
                              let diff = 0;

                              // at the end
                              if ( nextInSequence >= g_slider.slides.length ) {
                                diff = nextInSequence - g_slider.current_index
                                nextInSequence = -1 + diff;
                              }
                              // at the start
                              if ( nextInSequence < 0 ) {
                                diff = 0 - -nextInSequence;
                                nextInSequence = g_slider.slides.length + diff;
                              }
                              return nextInSequence;
                            },

  // this is a function because `slides` needs to be refreshed from time to t
  setSlides               : () => {
                              g_slider.slides = Array.from(document.querySelectorAll('.slide')).map(current => ({elem: current, width: current.clientWidth}))
                            },

  setWorkingIndex         : index => {
                            if ( index < 0 ) {
                              g_slider.relative_index = g_slider.slides.length + g_slider.current_index;
                            } else {
                              g_slider.relative_index = g_slider.current_index;
                            }
                          },
  setScrollDirection      : delta => {
                            if ( delta > 0 ) {
                              g_slider.scrolling_right = true;
                            } else {
                              g_slider.scrolling_right = false;
                            }
                          },

  // this is not currently in use
  // it might also be detrimental to have for lazy loading
  getTrackWidth           : () => {
                              // it seems that there is one missing margin, no matter what
                              var width = g_slider.slide_width_modifier;
                              width = width + 
                                      // widths of all slides
                                      g_slider.slides.map(current => current.width).reduce( (prev, curr) => prev + curr + 
                                      // plus the border width (if set)
                                      g_slider.slide_width_modifier );
                              return width;
                            },

  // sets the CSS to center the current image
  getTrackPosition        : () => {
                              // all slide elements that come before the current one
                              const preceeding_slides = g_slider.slides.filter(current => g_slider.slides.indexOf(current) < g_slider.current_index );
                              // console.table(preceeding_slides);

                              // add up widths of all slides before this one
                              const preceeding_slide_widths = preceeding_slides.map(current => current.width);
                              // console.log('preceeding widths: ', preceeding_slide_widths);
                              
                              // prevent error from reducing empty array
                              let preceeding_widths = 0;
                              if ( preceeding_slide_widths.length > 0 ) {
                                preceeding_widths += preceeding_slide_widths.reduce((prev, curr) => prev + curr + g_slider.slide_width_modifier );
                              }
                              // console.log('combined preceeding width: ', preceeding_widths);

                              // get diff between current slide and window
                              // console.log('current width: ', g_slider.slides[g_slider.current_index].width)
                              const diff = g_slider.container.clientWidth - g_slider.slides[g_slider.current_index].width;
                              // console.log('diff: ', diff);

                              // add diff / 2 to widths
                              const total_width = preceeding_widths - ( diff / 2 );
                              return total_width;
                            },

  switchSrc               : elem => {
                              const image = elem.querySelector('img');
                              // console.log(image);
                              // this occasionally errors and and sets src to 'undefined'
                              if ( image.dataset.src ) {
                                image.setAttribute("src", image.dataset.src );
                                image.removeAttribute('data-src');
                              }
                              if ( image.complete ) {
                                g_slider.setSlides();
                              } else {
                                image.addEventListener( 'load', g_slider.setSlides );
                              }
                            },

  loadIf                  : delta => {
                              let outer_slide;
                              let delta_extended = delta + delta;
                              console.log(g_slider.current_index);

                              // if we have moved
                              if ( delta !== 0 ) {

                                  // delta + delta here allows us to load the slide after the next one in both directions
                                  outer_slide = g_slider.slides[g_slider.getNextInSequence(delta_extended) ];

                                // console.log('loading up slide ' + g_slider.getNextInSequence(delta_extended));
                                // console.log('scrolling right: ' + g_slider.scrolling_right);
                                console.log('outer_slide')
                                console.log(outer_slide);
                              }

                              // deal with endless scrolling
                              if ( g_slider.endless_scroll ) {

                                // if user is navigating towards the edge of the array & moving right
                                if ( !g_slider.slides[g_slider.current_index + delta_extended] && g_slider.scrolling_right ) {

                                  // remove the slide they would want to see
                                  const slide_to_move = g_slider.track.querySelector('.slide:first-child');
                                  const moved_slide = g_slider.track.removeChild(slide_to_move);
                                  console.log("moved_slide");
                                  console.log(moved_slide);
                                  // add it to the other side
                                  g_slider.track.appendChild(moved_slide);
                                  g_slider.current_index--;
                                  console.log('edge')

                                  g_slider.setSlides();
                                } else if ( !g_slider.slides[g_slider.current_index - delta_extended] && !g_slider.scrolling_right ) {
                                  const slide_to_move = g_slider.track.querySelector('.slide:last-child');
                                  const moved_slide = g_slider.track.removeChild(slide_to_move);
                                  g_slider.track.insertBefore(moved_slide, g_slider.track.firstElementChild);

                                  console.log(g_slider.current_index)
                                  g_slider.current_index = g_slider.getNextInSequence(+1);
                                  console.log(g_slider.current_index)
                                }
                              }
                              
                              // console.log(outer_slide)

                              // if the outer slide has 
                              if ( outer_slide && outer_slide.width == 0 ) {
                                // console.log('near edge');
                                g_slider.switchSrc(outer_slide.elem);
                              }
                            },

  update                  : (delta = 0) => {
                              // set scroll direction
                              g_slider.setScrollDirection(delta);

                              // remove active class from current slide
                              g_slider.slides[g_slider.current_index].elem.classList.remove('slide--active');

                              // set index the next slide in the current sequence
                              g_slider.current_index = g_slider.getNextInSequence(delta);

                              // update src attributes if the next image is using `data-src`
                              g_slider.loadIf(delta);

                              // add animating class to slider track (will not animate without)
                              g_slider.track.classList.add('slider__track--animating');

                              // set CSS for slider track
                              g_slider.track.style.transform = 'translateX(' + -g_slider.getTrackPosition() + 'px)';

                              // add active class to new slide
                              g_slider.slides[g_slider.current_index].elem.classList.add('slide--active');
                            },

  init                    : () => {
                              // get current state of slides
                              g_slider.setSlides();
                              
                              g_slider.track.addEventListener('transitionend', function(){
                                g_slider.track.classList.remove('slider__track--animating');
                              });
                              g_slider.update();
                            }
}

setTimeout(function(){
  g_slider.init();

}, 500);
