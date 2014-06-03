var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    docco = require('gulp-docco'),
    jshint = require('gulp-jshint'),
    istanbul = require('gulp-istanbul');

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

gulp.task('coverage', 'Create istanbul code coverage report form tests', function (cb) {
    gulp.src(['lib/**/*.js', 'index.js'])
        .pipe(istanbul())
        .on('finish', function () {
            var must = require('must');
            gulp.src(['./examples/**/*.test.js', './tests/**/*.test.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
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