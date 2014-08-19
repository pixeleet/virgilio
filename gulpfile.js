var gulp = require('gulp');
var mocha = require('gulp-mocha');
var docco = require('gulp-docco');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');
var exampleToTest = require('./gulp-example-to-test');
var exit = require('gulp-exit');

// Help module
require('gulp-help')(gulp);

gulp.task('example-tests', ['unit-tests'], function () {
    gulp.src(['./examples/*.js'])
        .pipe(exampleToTest())
        .pipe(gulp.dest('./example-tests'))
        .pipe(mocha({
            ui: 'qunit',
            reporter: 'spec'
        }))
        .pipe(exit());
});

gulp.task('unit-tests', function () {
    // Modules used in tests must be loaded in this task
    require('must');
    return gulp.src(['./tests/**/*.test.js'])
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('test', ['example-tests']);

gulp.task('coverage', 'Create istanbul code coverage report form tests',
            function (cb) {
    gulp.src(['lib/**/*.js', 'index.js'])
        .pipe(istanbul())
        .on('finish', function () {
            require('must');
            gulp.src(['./examples/**/*.test.js', './tests/**/*.test.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('docs', 'Build the documentation', function () {
    gulp.src(['lib/virgilio.js', 'lib/mediator.js'])
        .pipe(concat('virgilio.js'))
        .pipe(docco())
        .pipe(gulp.dest('./documentation'));
});

gulp.task('lint', 'Execute JSHint checks on the code', function () {
    gulp.src(['lib/**/*.js', 'examples/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});
