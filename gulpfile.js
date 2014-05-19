var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    docco = require('gulp-docco'),
    jshint = require('gulp-jshint');

// Help module
require('gulp-help')(gulp);

gulp.task('test', 'Run the application tests', function () {
    // Modules used in tests must be loaded in this task
    var must = require('must');
    gulp.src(['./examples/**/*.test.js', './tests/**/*.test.js'])
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('docs', 'Build the documentation', function () {
    gulp.src(['lib/virgilio.js'])
        .pipe(docco())
        .pipe(gulp.dest('./docs'));
});

gulp.task('lint', 'Execute JSHint checks on the code', function () {
    gulp.src(['lib/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});