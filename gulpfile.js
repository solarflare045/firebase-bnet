const gulp = require('gulp');
const runSequence = require('run-sequence');
const $ = require('gulp-load-plugins')();

const tsProject = $.typescript.createProject('tsconfig.json');

gulp.task('compile', function() {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe($.babel({ presets: ['es2015'] }))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['compile'], function() {
  return $.nodemon({
    script: 'build/app.js'
  , env: { 'BLUEBIRD_WARNINGS': 0 }
  , ext: 'ts'
  , watch: 'src'
  , tasks: ['compile']
  });
});

gulp.task('clean', function() {
  return gulp.src('build', { read: false })
    .pipe($.clean());
});

gulp.task('build', function(done) {
  return runSequence('clean', 'compile', done);
});

gulp.task('default', ['watch']);
