const g_slider = {
  container               : document.querySelector('.slider'),

  track                   : document.querySelector('.slider__track'),

  slides                  : null,

  // any additional slide width, in pixels
  slide_width_modifier    : 2,

  current_index           : 2,

  working_index           : 2,

  scrolling_right         : true,

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
                              g_slider.working_index = g_slider.slides.length + g_slider.current_index;
                            } else {
                              g_slider.working_index = g_slider.current_index;
                            }
                          },
  setScrollDirection      : delta => {
                            if ( delta > 0 ) {
                              g_slider.scrolling_right = true;
                            } else {
                              g_slider.scrolling_right = false;
                            }
                          },

  // this may not be needed
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
                              console.log('combined preceeding width: ', preceeding_widths);

                              // make sure we have a working index
                              g_slider.setWorkingIndex(g_slider.current_index);


                              // get diff between current slide and window
                              console.log('current width: ', g_slider.slides[g_slider.working_index].width)
                              const diff = g_slider.container.clientWidth - g_slider.slides[g_slider.working_index].width;
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
                            },

  loadIf                  : (delta, prepend_flag = false) => {
                              let outer_slide;
                              let delta_extended = delta + delta;
                              let DOM_adjusted = false;

                              // if we have moved
                              if ( delta !== 0 ) {
                                let prepend_modifier = 0;
                                if ( prepend_flag ) {
                                  prepend_modifier = 1; 
                                }
                                  // delta + delta here allows us to load the slide after the next one in both directions
                                  outer_slide = g_slider.slides[g_slider.getNextInSequence(delta_extended) + prepend_modifier ];

                                // console.log('loading up slide ' + g_slider.getNextInSequence(delta_extended));
                                // console.log('scrolling right: ' + g_slider.scrolling_right);
                                console.log(outer_slide);
                              }


                              // if user is navigating towards the edge of the array
                              if ( !g_slider.slides[g_slider.current_index + delta_extended] || prepend_flag ) {

                                // clone the slide they would want to see
                                const cloned_slide = outer_slide.elem.cloneNode(true);
                                cloned_slide.classList.add('slide--cloned');
                                console.log(cloned_slide);

                                // and add it to the track on the appropriate side
                                if ( g_slider.scrolling_right ) {
                                  g_slider.track.appendChild(cloned_slide);
                                } else {
                                  g_slider.track.insertBefore(cloned_slide, g_slider.track.firstElementChild);
                                }
                                // update info from DOM before next step
                                g_slider.switchSrc(cloned_slide);
                                g_slider.setSlides();
                              }
                              // console.log(outer_slide)

                              // if the outer slide has 
                              if ( outer_slide && outer_slide.width == 0 ) {
                                // console.log('near edge');
                                g_slider.switchSrc(outer_slide.elem);
                                DOM_adjusted = true;
                              }

                              if ( DOM_adjusted ) {
                                g_slider.setSlides();
                              }
                            },

  update                  : (delta = 0) => {
                              // set scroll direction
                              g_slider.setScrollDirection(delta);

                              if ( !(g_slider.current_index + (delta + delta)) && !g_slider.scrolling_right ) {
                                // don't change index because a new slide gets added
                                console.log('current_index not updated');
                                // update src attributes if the next image is using `data-src`
                                g_slider.loadIf(delta, true);

                              } else {
                                // set index the next slide in the current sequence
                                g_slider.current_index = g_slider.current_index + delta;
                                // update src attributes if the next image is using `data-src`
                                g_slider.loadIf(delta);
                              }

                              // remove active class from current slide
                              // g_slider.slides[g_slider.current_index].elem.classList.remove('slide--active');

                              g_slider.track.style.transform = 'translateX(' + -g_slider.getTrackPosition() + 'px)';
                              // console.log('end of update', g_slider.current_index);
                              // if ( !g_slider.scrolling_right ) {
                              //   g_slider.slides[g_slider.current_index].elem.classList.add('slide--active');
                              // }
                              // g_slider.slides[g_slider.current_index].elem.classList.add('slide--active');
                            },

  init                    : () => {
                              g_slider.setSlides();
                              // g_slider.track.style.width = g_slider.getTrackWidth() + 'px';
                              // it might be better just to spoof the width in css (current approach)
                              g_slider.update();
                            }
}

setTimeout(function(){
  g_slider.init();

}, 500);
