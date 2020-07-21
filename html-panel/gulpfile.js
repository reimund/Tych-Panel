'use strict';

var gulp = require('gulp')
  , less = require('gulp-less')
  , plug = require('gulp-load-plugins')()
  , _    = require('lodash')
;

var config = {
    styles: 'src/styles',
    panel: ['src/CSXS/**/*', 'src/images/*', 'src/js/*', 'src/Icon.png', 'src/index.html', 'src/.debug'],
};

gulp.task('concat', function() {
	// console.log(npmfiles(npmfilesConfig));
	return gulp.src([
			'node_modules/lodash/lodash.js',
			'node_modules/jquery/dist/jquery.min.js'
		])
		.pipe(plug.concat('dependencies.js'))	
		.pipe(gulp.dest('dist/js'))
	;
});

gulp.task('copy', function() {
	return gulp.src(config.panel, { base: 'src' })
	// return gulp.src('src/images/*',)
		.pipe(gulp.dest('dist'))
	;
});

gulp.task('dist', gulp.series('concat', 'copy'));

gulp.task('styles', function() {
    return gulp.src(config.styles + '/tychpanel.less')
		.pipe(less({ paths: config.styles }))
		.pipe(plug.rename({ basename: 'app' }))
		.pipe(gulp.dest('dist/styles'))
		.pipe(plug.notify({ message: 'Styles task complete' }))
	;
});

gulp.task('serve', function() {
	gulp.watch(_.concat(['./src/styles/**/*.less', config.panel]))
		.on('change', function() { gulp.series('styles', 'dist'); })
	;
});

gulp.task('default', gulp.series('styles', 'dist'), function() {
	// place code for your default task here
});
