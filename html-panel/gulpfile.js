'use strict';

var gulp         = require('gulp')
  , less         = require('gulp-less')
  , autoprefixer = require('gulp-autoprefixer')
  , plug         = require('gulp-load-plugins')()
  , runSequence  = require('run-sequence')
  , bowerFiles   = require('main-bower-files')
  , _            = require('lodash')
;

var config = {
	bower: 'bower_components/',
    styles: 'src/styles',
    panel: ['src/CSXS/**/*', 'src/images/*', 'src/js/*', 'src/Icon.png', 'src/index.html', 'src/.debug'],
};

var bowerConfig = {
	paths: {
		bowerDirectory: config.bower,
		bowerrc: '.bowerrc',
		bowerJson: 'bower.json'
	}
};

gulp.task('dist', ['concat'], function() {
	return gulp.src(config.panel, { base: 'src' })
		.pipe(gulp.dest('dist'))
	;
    //return gulp.src(config.styles + '/tychpanel.less')
});

gulp.task('concat', function() {
	return gulp.src(bowerFiles(bowerConfig), { base: config.bower })
		.pipe(plug.concat('bower.js'))	
		.pipe(gulp.dest('dist/js'))
	;
});

gulp.task('styles', function() {
    return gulp.src(config.styles + '/tychpanel.less')
		.pipe(less({ paths: config.styles }))
		.pipe(autoprefixer('last 2 version'))
		.pipe(plug.rename({ basename: 'app' }))
		.pipe(gulp.dest('dist/styles'))
		.pipe(plug.notify({ message: 'Styles task complete' }))
	;
});

gulp.task('serve', [], function() {
	gulp.watch(_.concat(['./src/styles/**/*.less', config.panel]))
		.on('change', function() { runSequence(['styles', 'dist']); })
	;
});

gulp.task('default', ['styles', 'dist'], function() {
	// place code for your default task here
});
