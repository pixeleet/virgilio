var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var docco = require('gulp-docco');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');
var clean = require('gulp-clean');
var exampleToTest = require('gulp-example-to-test');
var replace = require('gulp-replace');
var insert = require('gulp-insert');

function onError(error) {
    gutil.log(error);
    process.exit(1);
}

// Help module
require('gulp-help')(gulp);

var newVirgilioRegex = /^(.*Virgilio\()(.*)(\).*)$/m;
var exampleTestHeader = fs.readFileSync('./helpers/example-test-header.js');
gulp.task('example-tests', ['unit-tests', 'clean-example-tests'], function () {
    gulp.src('./examples/*.js')
        .pipe(exampleToTest())
        .pipe(insert.prepend(exampleTestHeader))
        .pipe(replace(/Virgilio\(\)/, 'Virgilio({})'))
        .pipe(replace(newVirgilioRegex, '$1_.extend(loggerConfig, $2)$3'))
        .on('error', onError)
        .pipe(gulp.dest('./example-tests'))
        .pipe(mocha({
            ui: 'qunit',
            reporter: 'spec'
        }));
});

gulp.task('clean-example-tests', function () {
    gulp.src('./example-tests', { read: false })
        .pipe(clean());
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
    gulp.src('lib/virgilio.js')
        .pipe(docco())
        .pipe(gulp.dest('./documentation'));
});

gulp.task('lint', 'Execute JSHint checks on the code', function () {
    gulp.src(['lib/**/*.js', 'examples/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});
