var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    docco = require('gulp-docco'),
    concat = require('gulp-concat');

// Help module
require('gulp-help')(gulp);

gulp.task('test', 'Run the application tests', function () {
    // Modules used in tests must be loaded in this task
    require('must');
    return gulp.src(['./examples/**/*.test.js', './tests/**/*.test.js'])
        .pipe(mocha({
            reporter: 'spec'
        }))
        .on('error', function(err) {
            throw err;
        })
        .once('end', function() {
            process.exit();
        });
});

gulp.task('docs', 'Build the documentation', function () {
    gulp.src(['lib/virgilio.js', 'lib/mediator.js'])
        .pipe(concat('virgilio.js'))
        .pipe(docco())
        .pipe(gulp.dest('./docs'));
});
