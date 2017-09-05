'use strict';

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  rename = require('gulp-rename'),
  cleanCSS = require('gulp-clean-css'),
  sass = require('gulp-sass'),
  maps = require('gulp-sourcemaps'),
  del = require('del');

var jsPaths = [
  './js/app.js'
];

var sassPaths = [
  './sass/app.sass'
];

gulp.task('compile-sass',function(){
    return gulp.src(sassPaths)
        .pipe(maps.init())          // create maps from scss partials
        .pipe(sass())
        .pipe(maps.write('./'))     // this path is relative to the output directory
        .pipe(gulp.dest('./css'));  // this is the output directory
});

gulp.task('concat-css',['compile-sass'], function(){
    return gulp.src(['css/app.css'])
        .pipe(concat('tiny-gallery-slider.css')) // concat into file name
        .pipe(gulp.dest('css'));    // send that file to the css directory
});

gulp.task('minify-css',['concat-css'], function(){
    return gulp.src('css/tiny-gallery-slider.css')
        .pipe(maps.init({loadMaps:true}))   // create maps from scss *sourcemaps* not the css
        .pipe(cleanCSS())
        .pipe(rename('tiny-gallery-slider.min.css'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('css'));
});

gulp.task('concat-scripts', function(){
    return gulp.src( jsPaths )
        .pipe(maps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('tiny-gallery-slider.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'));
});

gulp.task('minify-scripts',['concat-scripts'], function(){
    return gulp.src('js/tiny-gallery-slider.js')
        .pipe(maps.init({loadmaps:true}))
        .pipe(uglify())
        .pipe(rename('tiny-gallery-slider.min.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'));
});

gulp.task('clean', function(){
    del(['dist','css/tiny-gallery-slider*.css*','css/style.css*','js/tiny-gallery-slider*.js*']);
});

gulp.task('watch', function(){
    gulp.watch('./sass/**/*.sass',['minify-css']);
    gulp.watch('./js/app.js',['minify-scripts']);
});

gulp.task('build', ['minify-scripts', 'minify-css'], function(){ // array defined dependencies, which are all run before the default task
    return gulp.src(['css/tiny-gallery-slider.min.css','js/tiny-gallery-slider.min.js','index.html'], {base:'./'})
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['watch']);