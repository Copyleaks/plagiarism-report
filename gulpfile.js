var gulp = require('gulp');
var less = require('gulp-less');
var embedTemplates = require('gulp-angular-embed-templates');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var purify = require('gulp-purifycss');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var terser = require('gulp-terser');
var filesExist = require('files-exist');
var sourcemaps = require('gulp-sourcemaps');

var config = {
    production: !!gutil.env.production
};

console.log('Current configuration: ' + (config.production ? 'PRODUCTION' : 'DEVELOPMENT'));

function buildJs(arr, outputDir, outputName, templatesBasePath = undefined, watch = true) {
    if (watch && !config.production) {
        gulp.watch(arr).on('change', function () {
            console.log('rebuilding js: ' + outputName);
            buildJs(arr, outputDir, outputName, templatesBasePath, false);
            console.log('done!');
        });

        // watch for embeded html.
        if (templatesBasePath) {
            pathToWatch = templatesBasePath.endsWith('/') ? templatesBasePath + '**/*.html' : templatesBasePath + '/**/*.html';
            console.log(pathToWatch);
            gulp.watch([pathToWatch]).on('change', function () {
                console.log('rebuilding html template: ' + outputName);
                buildJs(arr, outputDir, outputName, templatesBasePath, false);
                console.log('done!');
            });
        }
    }

    return gulp.src(filesExist(arr))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(templatesBasePath ? embedTemplates({ basePath: templatesBasePath }) : gutil.noop())
        .pipe(concat(outputName + '.js'))
        .pipe(gulp.dest(outputDir))
        .pipe(config.production ? sourcemaps.init() : gutil.noop())
        .pipe(config.production ? terser() : gutil.noop())
        .pipe(config.production ? rename(outputName + '.min.js') : gutil.noop())
        .pipe(config.production ? sourcemaps.write() : gutil.noop())
        .pipe(config.production ? gulp.dest(outputDir) : gutil.noop());
}

function buildLess(arr, outputDir, outputName, watch = true) {
    if (watch && !config.production)
        gulp.watch(arr).on('change', function () {
            console.log('rebuilding css: ' + outputName);
            buildLess(arr, outputDir, outputName, false);
            console.log('done!');
        });

    return gulp.src(filesExist(arr))
        .pipe(less().on('error', gutil.log))
        .pipe(concat(outputName + '.css'))
        .pipe(gulp.dest(outputDir))
        .on('error', gutil.log)
        .pipe(config.production ? sourcemaps.init() : gutil.noop())
        .pipe(config.production ? csso() : gutil.noop())
        .pipe(config.production ? rename(outputName + '.min.css') : gutil.noop())
        .pipe(config.production ? sourcemaps.write() : gutil.noop())
        .pipe(config.production ? gulp.dest(outputDir) : gutil.noop());
}

//Search for unused css
gulp.task('purifycss', function () {
    return gulp.src('./dist/opensource_report.css')
        .pipe(purify(['./v1/**/*.js', './v1/**/*.html',
            './v3/**/*.js', './v3/**/*.html',
            './common/**/*.js', './common/**/*.html']))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('css', function () {
    return buildLess(['css/opensource_report.less'], 'dist', 'copyleaks-plagiarism-report');
});

gulp.task('build-v1', function () {
    return buildJs([
        'v1/js/**/*.js',
        'common/**/*.js'], 'dist/v1/', 'copyleaks-plagiarism-report', '.');
});

gulp.task('build-v3', function () {
    return buildJs([
        'common/services/underscoreVarFix.js',
        'v3/js/**/*.js',
        'common/**/*.js'
    ], 'dist/v3/', 'copyleaks-plagiarism-report', '.')
});

gulp.task('3rd-party', function () {
    var t1 = buildLess([
        'node_modules/angular-material/angular-material.css'
    ], 'dist', '3rd-party');

    var t2 = buildJs([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/angular-ui-validate/dist/validate.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-material/angular-material.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/chart.js/dist/Chart.js',
        'node_modules/moment/moment.js',
        'node_modules/angular-moment/angular-moment.js',
        'node_modules/underscore/underscore.js',
        'node_modules/angular-chart.js/dist/angular-chart.js'
    ], 'dist', '3rd-party');

    return [t1, t2];
});

gulp.task('default', ['css', 'build-v1', 'build-v3', '3rd-party']);