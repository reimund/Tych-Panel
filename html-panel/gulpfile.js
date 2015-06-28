'use strict';

var gulp         = require('gulp')
  , less         = require('gulp-less')
  , autoprefixer = require('gulp-autoprefixer')
  , rename       = require('gulp-rename')
  , notify       = require('gulp-notify')
;

var config = {
    styles: 'src/styles',
    panel: ['src/CSXS/**/*', 'src/images/*', 'src/js/*', 'src/Icon.png', 'src/index.html', 'src/.debug'],
};

gulp.task('dist', [], function() {

	return gulp.src(config.panel, { base: 'src' })
		.pipe(gulp.dest('dist'))
	;
    //return gulp.src(config.styles + '/tychpanel.less')
});

gulp.task('styles', function() {
    return gulp.src(config.styles + '/tychpanel.less')
				.pipe(less({paths: config.styles}))
				.pipe(autoprefixer('last 2 version'))
				.pipe(rename({ basename: 'app' }))
				.pipe(gulp.dest('dist/styles'))
				.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('serve', [], function() {

	gulp.watch([
			'./src/styles/**/*.less',
		])
		.on('change', 'styles');
});

gulp.task('default', ['styles', 'dist'], function() {
	// place code for your default task here
});
