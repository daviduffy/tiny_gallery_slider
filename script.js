const g_slider = {
  container               : document.querySelector('.slider'),

  track                   : document.querySelector('.slider__track'),

  slides                  : null,

  // any additional slide width, in pixels
  slide_width_modifier    : 2,

  current_index           : 1,

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

  // this is a function because `slides` needs to be refreshed from time to time
  setSlides               : () => {
                              g_slider.slides = Array.from(document.querySelectorAll('.slide')).map(current => ({elem: current, width: current.clientWidth}))
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

  getTrackPosition        : () => {
                              let width = 0;
                              // add up widths of all slides before this one
                              // TODO fix this
                              // g_slider.filter(current => current.index )
                              for ( let i = 0; i < g_slider.current_index; i++ ) {
                                width = width + g_slider.slides[i].width;

                                // use this if there is any border on images
                                // width = width + 4;
                              }
                              // console.log('width:', width);

                              // get diff between this slide and window
                              let diff = g_slider.container.clientWidth - g_slider.slides[g_slider.current_index].width;
                              // console.log('diff:', diff);

                              // add diff / 2 to widths
                              width = width - ( diff / 2 );
                              return width;
                            },

  update                  : (delta = 0) => {
                              // console.log('start of update', g_slider.current_index);
                              g_slider.slides[g_slider.current_index].elem.classList.remove('slide--active');
                              g_slider.current_index = g_slider.getNextInSequence(delta);
                              g_slider.loadIf(delta);
                              g_slider.track.style.transform = 'translateX(' + -g_slider.getTrackPosition() + 'px)';
                              // console.log('end of update', g_slider.current_index);
                              g_slider.slides[g_slider.current_index].elem.classList.add('slide--active');
                            },

  loadIf                  : delta => {
                              let outer_slide;
                              // moving to the right (forward)
                              if ( delta > 0 ) {
                                outer_slide = g_slider.slides[g_slider.current_index + 2];
                              // moving to the left (back)
                              } else if ( delta < 0 ) {
                                outer_slide = g_slider.slides[g_slider.current_index - 2];
                              }
                              if ( outer_slide && outer_slide.width == 0 ) {
                                const outer_slide_image = outer_slide.elem.querySelector('img');
                                // console.log(typeof(outer_slide_image.dataset.src));
                                outer_slide_image.setAttribute("src", outer_slide_image.dataset.src );
                                outer_slide_image.removeAttribute('data-src');
                                g_slider.setSlides();
                              }
                            },

  init                    : () => {
                              g_slider.setSlides();
                              // g_slider.track.style.width = g_slider.getTrackWidth() + 'px';
                              // it might be better just to spoof the width
                              // g_slider.track.style.width = '9999px';
                              g_slider.update();
                            }
}

g_slider.init();

// determine which way we travelled
// determine which slide should we update
// switch src
// remake slides array