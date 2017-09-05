const g_s = {
  // element
  // __container             : document.querySelector('.g-slider'),
  // __track                 : document.querySelector('.g-slider__track'),
  __curtain               : document.querySelector('.g-slider__curtain'),

  //class
  _class                  : 'g-slider',

  // global vars
  all_slides              : null,
  slide_width_modifier    : 2, //px
  current_index           : 1,
  scrolling_right         : true,
  endless_scroll          : true,

  // unecessary but makes code easier to read
  setScrollDirection      : delta => {
    if ( delta > 0 ) {
      g_s.scrolling_right = true;
    } else if ( delta < 0 ) {
      g_s.scrolling_right = false;
    }
  },

  // gets me the next number in the array sequence
  getNextInSequence       : delta => {
    let nextInSequence = g_s.current_index + delta;

    // diff employed to allow scrolling more than one slide at a time (future state)
    let diff = 0;

    // if the next number is off the end
    if ( nextInSequence >= g_s.all_slides.length ) {

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
      nextInSequence = g_s.all_slides.length + diff;
    }
    return nextInSequence;
  },
  track                   : {

    position                : 0,
    // sets the CSS to center the current image
    calc : () => {

      // all slide elements that come before the current one
      const preceeding_slides = g_s.all_slides.filter(current => g_s.all_slides.indexOf(current) < g_s.current_index );
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
      // console.log('current width: ', g_s.all_slides[g_s.current_index].width)
      const diff = g_s.__container.clientWidth - g_s.all_slides[g_s.current_index].width;
      // console.log('diff: ', diff);

      // add diff / 2 to widths
      const total_width = preceeding_widths - ( diff / 2 );

      // set var
      g_s.track.position = -total_width;
    },

    setTranslation          : (position) => {
      g_s.__track.style.transform = `translateX(${position}px)`;
    },
    // run all of the functions needed to more forward or back
    scroll                  : (delta = 0) => {
      // set scroll direction
      g_s.setScrollDirection(delta);

      // remove current classes from current slides
      g_s.slides.setClasses('remove');

      // set index the next slide in the current sequence
      g_s.current_index = g_s.getNextInSequence(delta);

      // if we have moved, check and update src attributes
      if ( delta !== 0 ) {
        g_s.slides.loadIf(delta);
      }

      // if endless scroll is enabled
      if ( g_s.endless_scroll ) {

          // true for the last two indexes on left and right, respectively
          if ( g_s.current_index <= 0 || g_s.current_index >= (g_s.all_slides.length - 1 ) ) {

            // move a slide
            g_s.slides.move(delta);

          }
      }

      // required for browser to catch up with infinite scroll
      setTimeout(function(){

        // add animating class to slider __track (will not animate without)
        g_s.__container.classList.add('g-slider--is-animating');
        // console.log('before animation', g_s.__track.style.transform);

        // set CSS for slider __track
        g_s.track.calc();
        g_s.track.setTranslation(g_s.track.position);

        // add classes to new slides
        g_s.slides.setClasses('add');
      }, 20); // Firefox needs training wheels
    },
  },

  slides                  : {
    // function to refresh `slides` from time to time
    resetData               : () => {
      g_s.all_slides = Array.from(document.querySelectorAll('.g-slider__slide')).map(current => ({elem: current, width: current.clientWidth}))
    },
    // handle src and data-src attribute value switch
    switchSrc               : image => {
      // set src attribute to value from `data-src`
      image.setAttribute('src', image.dataset.src );

      // remove `data-src` attribute entirely
      image.removeAttribute( 'data-src' );

      // set up event listener to reset slides once image loads
      if ( image.complete ) {
        g_s.slides.resetData();
      } else {
        image.addEventListener( 'load', g_s.slides.resetData );
      }
    },
    // hopefully self-explanatory
    setClasses              : (action) => {
      g_s.all_slides[g_s.getNextInSequence(-1)].elem.classList.toggle('g-slider__slide--is-prev');
      g_s.all_slides[g_s.current_index].elem.classList.toggle('g-slider__slide--is-current');
      g_s.all_slides[g_s.getNextInSequence(1)].elem.classList.toggle('g-slider__slide--is-next');
    },

    move : (delta) => {
      // set correct selector depending on the direction of travel
      const selector = g_s.scrolling_right ? '.g-slider__slide:first-child' : '.g-slider__slide:last-child';

      // target slide
      const slide_to_move = g_s.__track.querySelector(selector);

      // remove slide
      const moved_slide = g_s.__track.removeChild(slide_to_move);

      // append slide in correct location
      if ( g_s.scrolling_right ) {

        // append as last slide
        g_s.__track.appendChild(moved_slide);
      } else {
        // append as first slide
        g_s.__track.insertBefore(moved_slide, g_s.__track.querySelector('.g-slider__slide:first-child'));
      }

      // reset slides
      g_s.slides.resetData();

      // set current index as if I am on the previous slide
      g_s.current_index = g_s.current_index + -(delta*2);

      // reset translation of __track to previous slide
      g_s.track.calc();
      g_s.track.setTranslation(g_s.track.position);

      // re-select current index to the "new" next slide
      g_s.current_index = g_s.getNextInSequence(delta);
    },
    loadIf                  : delta => {
      let outer_slide;
      let delta_extended = delta + delta;

      // delta + delta here allows us to load the slide after the next one in both directions
      outer_slide = g_s.all_slides[ g_s.getNextInSequence(delta_extended) ];
      // console.log('the slide I am checking is ', outer_slide.elem);

      // find image inside slide
      const image = outer_slide.elem.querySelector('img');

      // if the image has a `data-src attribute`
      if ( image.dataset.src ) {

        // remove `data-src` and set `src` value
        g_s.slides.switchSrc(image);
      }
    }
  },

  arrows                  : {
    enable                  : () => {
      g_s.__track.addEventListener('focus', () => {
        window.addEventListener('keydown', g_s.arrows.handle, true)
      });
      g_s.__track.addEventListener('blur', () => {
        window.removeEventListener('keydown', g_s.arrows.handle, true)
      });
      g_s.__track.focus();
    },
    handle                  : event => {
      // Do nothing if the event was already processed
      if (event.defaultPrevented) {
        return;
      }

      switch (event.key) {

        // Left arrow moves left
        case "ArrowLeft":
          g_s.track.scroll(-1);
          break;

        // Right arrow moves right
        case "ArrowRight":
          g_s.track.scroll(1);
          break;

        // Unfocus the __track
        case "Escape":
          document.activeElement.blur()
          break;

         // Quit when this doesn't handle the key event.
        default:
          return;
      }

      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    },
  },
  
  touch : {
    active: false,
    old_track_position: 0,
    enable : () => {
      const events = ['touchstart', 'touchmove', 'touchend'];
      const functions = [g_s.touch.start, g_s.touch.move, g_s.touch.end];
      for ( let i = 0; i < events.length; i++ ) {
        g_s.__track.addEventListener( events[i], functions[i], true );
      }
    },
    start : (e) => {
      g_s.touch.old_track_position = g_s.track.position;
      g_s.touch.start_x = e.touches[0].pageX;
      g_s.touch.long_touch = false;
      setTimeout(function() {
        g_s.touch.long_touch = true;
      }, 250);
    },
    move : (e) => {
      if (!g_s.touch.active) {
        window.requestAnimationFrame(function() {
          g_s.touch.end_x = e.touches[0].pageX;
          g_s.touch.dist_x = g_s.touch.start_x - g_s.touch.end_x;
          g_s.track.position = g_s.touch.old_track_position - g_s.touch.dist_x;
          g_s.track.setTranslation(g_s.track.position);
          g_s.touch.active = false;
        });
      }
      g_s.touch.active = true;

    },
    end : (e) => {
      g_s.touch.start_x > g_s.touch.end_x && g_s.track.scroll(1);
      g_s.touch.start_x < g_s.touch.end_x && g_s.track.scroll(-1);
    },
},
  setup : {
    run : function() {
      // get current state of slides
      this.slides.resetData();

      // set __track position
      this.track.calc();
      this.track.setTranslation(g_s.track.position);

      // get rid of get rid of __curtain when slider ready
      this.__curtain.addEventListener('transitionend', () => {
        this.__curtain.parentNode.removeChild(g_s.__curtain);
      });

      // open __curtain
      this.__container.classList.add('g-slider--ready');

      // add classes to the proper elements
      this.slides.setClasses();

      // enable use of keyboard arrows to control slider
      this.arrows.enable();

      // enable use of swipe to change slides
      this.touch.enable();

      // trigger to remove class from slider once transition is over
      this.__container.addEventListener('transitionend', () => {
        this.__container.classList.remove('g-slider--is-animating');
      });

      // trigger to recalculate slide widths when window resize occurs
      let ticking = false;
      window.addEventListener('resize', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.slides.resetData();
            this.track.calc();
            this.track.setTranslation(g_s.track.position);
            ticking = false;
          });
        }
        ticking = true;
      });
    },
    markup: (args) => {
      args.element.classList.add(g_s._class);
      g_s.__container = args.element;

      const track = args.element.querySelector('*:first-child');
      track.classList.add(`${g_s._class}__track`);
      track.style.width = "9999999px";
      track.setAttribute("tabindex", "0")
      g_s.__track = track;

      const slides = args.element.querySelectorAll('li');
      slides.forEach(slide => {
        slide.classList.add(`${g_s._class}__slide`);
      });

      const buttons = [{
        class: ["g-slider__button", "g-slider__button--left"],
        onclick: "g_s.track.scroll(-1)",
        text: "previous"
      },
      {
        class: ["g-slider__button", "g-slider__button--right"],
        onclick: "g_s.track.scroll(1)",
        text: "next"
      }];

      buttons.forEach(button_obj => {
        let button_elem = document.createElement('button');
        button_obj.class.forEach(the_class => {
          button_elem.classList.add(the_class);
        })
        button_elem.setAttribute('onclick', button_obj.onclick);
        button_elem.innerText = button_obj.text;
        args.element.appendChild(button_elem);
      })
    },
  },
  init : function(args) {
    this.setup.markup.call(g_s, args);
    this.setup.run.call(g_s);
  }
}
// timeout here is to ensure that the slider doesn't center itself on the current_index
// without all images loaded
setTimeout(() => {
  g_s.init({
    element: document.querySelector('.target-class')
  });
},500)
