'use strict';

module.exports = function(grunt) {

	// Load grunt tasks automatically.
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		watch: {

			less: {
				files: [ 'less/**/*.less' ],
				tasks: ['less', 'autoprefixer']
			},

			sync: {
				files: [
					'../scripts/**/*',
				],
				tasks: ['sync'],
			},

			configFiles: {
				files: ['Gruntfile.js',],
				options: {
					reload: true
				}
			}
		},

		less: {
			main: {
				options: {
					paths: ['less'],
					yuicompress: true,
					syncImport: true
				},
				files: {
					'dist/static/css/app.css': 'less/tychpanel.less',
				}
			}
		},

		sync: {
			main: {
				files: [{
					cwd: '../scripts',
					src: [
						'**',
					],
					dest: 'hybrid/scripts',
				}],
				verbose: true,
			}
		},

		autoprefixer: {
			main: {
				src: 'dist/static/css/app.css',
				dest: 'dist/static/css/app.css',
			},
		},

	});

	grunt.registerTask('default', ['less', 'autoprefixer', 'watch']);

};
