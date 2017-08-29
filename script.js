const g_slider = {
  container               : document.querySelector('.slider'),
  track                   : document.querySelector('.slider__track'),
  slides                  : Array.from(document.querySelectorAll('.slide')).map(current => current.clientWidth),
  slide_width_modifier    : 2,
  // any additional slide width, in pixels
  current_index           : 1,
  setCurrentIndex         : delta => {
                              g_slider.current_index = g_slider.current_index + delta;
                              if ( g_slider.current_index >= g_slider.slides.length) {
                                g_slider.current_index = 0;
                              } 
                              if ( g_slider.current_index < 0) {
                                g_slider.current_index = (g_slider.slides.length - 1);
                              }
                            },
  getTrackWidth           : () => {
                              // it seems that there is one missing margin, no matter what
                              var width = g_slider.slide_width_modifier;
                              width = width + 
                                      // widths of all slides
                                      g_slider.slides.reduce( (prev, curr) => prev + curr + 
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
                                width = width + g_slider.slides[i];

                                // use this if there is any border on images
                                // width = width + 4;
                              }
                              // console.log('width:', width);

                              // get diff between this slide and window
                              let diff = g_slider.container.clientWidth - g_slider.slides[g_slider.current_index];
                              // console.log('diff:', diff);

                              // add diff / 2 to widths
                              width = width - ( diff / 2 );
                              return width;
                            },
  update                  : (delta = 0) => {
                              g_slider.setCurrentIndex(delta);
                              g_slider.track.style.transform = 'translateX(' + -g_slider.getTrackPosition() + 'px)';
                            },
  init                    : () => {
                              g_slider.track.style.width = g_slider.getTrackWidth() + 'px';
                              g_slider.update();
                            }
}

g_slider.init();
