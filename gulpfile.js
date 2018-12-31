/// <binding BeforeBuild='less-to-css' />
var gulp = require("gulp"),
    fs = require("fs"),
    less = require("gulp-less"),
	concat = require('gulp-concat');

	  
gulp.task("3d-party-css", function () {
    var root = gulp.src(["node_modules/angular-ui-notification/dist/angular-ui-notification.min.css",
					     "node_modules/components-font-awesome/css/font-awesome.min.css",
						 "node_modules/angular-material/angular-material.css"])
        .pipe(less())
		.pipe(concat('3rd-party.css'))
        .pipe(gulp.dest('v1/dist/'));
});

gulp.task('3d-party-js', function () {
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
	.pipe(gulp.dest('v1/dist'));
});

