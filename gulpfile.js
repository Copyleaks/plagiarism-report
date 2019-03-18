/// <binding BeforeBuild='less-to-css' />
var gulp = require("gulp"),
    fs = require("fs"),
    less = require("gulp-less"),
    merge = require('merge-stream');
var embedTemplates = require('gulp-angular-embed-templates');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var purify = require('gulp-purifycss');
var csso = require('gulp-csso');


//Search for unused css
gulp.task('purifycss', function () {
    return gulp.src('./dist/opensource_report.css')
        .pipe(purify(['./v1/**/*.js', './v1/**/*.html',
            './v3/**/*.js', './v3/**/*.html',
            './common/**/*.js', './common/**/*.html']))
        .pipe(gulp.dest('./dist/'));
});

gulp.task("css", function () {
    gulp.src(['css/copyleaks-plagiarism-report-iframe.less'])
        .pipe(less())
        .pipe(rename('copyleaks-plagiarism-report-iframe.css'))
        .pipe(gulp.dest('dist'))
        .pipe(csso())
        .pipe(rename('copyleaks-plagiarism-report-iframe.min.css'))
        .pipe(gulp.dest('dist'));

    gulp.src(['css/opensource_report.less'])
        .pipe(less())
        .pipe(rename('copyleaks-plagiarism-report.css'))
        .pipe(gulp.dest('dist'))
        .pipe(csso())
        .pipe(rename('copyleaks-plagiarism-report.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-v1', function () {
    gulp.src(['v1/report/**/*.js', 'common/**/*.js'])
        .pipe(embedTemplates({
            basePath: '.'
        }))
        .pipe(concat('copyleaks-plagiarism-report.js'))
        .pipe(gulp.dest('./dist/v1'))
        .pipe(uglify({
            mangle: {
                toplevel: true
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
            }
        }))
        .pipe(rename('copyleaks-plagiarism-report.min.js'))
        .pipe(gulp.dest('./dist/v1/'));
});

gulp.task('build-v3', function () {
    gulp.src(['common/services/underscoreVarFix', 'v3/report/**/*.js', 'common/**/*.js'])
        .pipe(embedTemplates({
            basePath: '.'
        }))
        .pipe(concat('copyleaks-plagiarism-report.js'))
        .pipe(gulp.dest('./dist/v3/'))
        .pipe(uglify({
            mangle: {
                toplevel: true
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
            }
        }))
        .pipe(rename('copyleaks-plagiarism-report.min.js'))
        .pipe(gulp.dest('./dist/v3/'));
});

var watcher = gulp.watch(['v3/report/**/*.js', 'common/**/*.js', 'common/**/*.html']);

watcher.on('change', function (path, stats) {
    gulp.run(['build-v3']);
});

var watcherV1 = gulp.watch(['v1/report/**/*.js', 'common/**/*.js']);

watcherV1.on('change', function (path, stats) {
    gulp.run(['build-v1']);
});

var watcherCss = gulp.watch(['css/*.less']);

watcherCss.on('change', function (path, stats) {
    gulp.run(['css']);
});

gulp.task("3rd-party", function () {
    var root = gulp.src([
        "node_modules/angular-ui-notification/dist/angular-ui-notification.css",
        "node_modules/components-font-awesome/css/font-awesome.css",
        "node_modules/angular-material/angular-material.css"
    ])
        .pipe(less())
        .pipe(concat('3rd-party.css'))
        .pipe(gulp.dest('dist'))
        .pipe(csso())
        .pipe(rename('3rd-party.min.css'))
        .pipe(gulp.dest('dist'));

    gulp.src([
        "node_modules/jquery/dist/jquery.js",
        "node_modules/angular/angular.js",
        "node_modules/angular-route/angular-route.js",
        "node_modules/angular-ui-validate/dist/validate.js",
        "node_modules/angular-animate/angular-animate.js",
        "node_modules/angular-aria/angular-aria.js",
        "node_modules/angular-material/angular-material.js",
        "node_modules/angular-sanitize/angular-sanitize.js",
        "node_modules/angular-loading-bar/build/loading-bar.js",
        "node_modules/angular-ui-notification/dist/angular-ui-notification.js",
        "node_modules/chart.js/dist/Chart.js",
        "node_modules/moment/moment.js",
        "node_modules/angular-moment/angular-moment.js",
        "node_modules/underscore/underscore.js",
        "node_modules/angular-chart.js/dist/angular-chart.js"
    ]).pipe(concat('3rd-party.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            mangle: {
                toplevel: true
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
            }
        }))
        .pipe(rename('3rd-party.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['css', 'build-v1', 'build-v3', '3rd-party']);