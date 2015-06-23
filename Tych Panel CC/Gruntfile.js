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

			//sync: {
				//files: [
					//'../scripts/**/*',
				//],
				//tasks: ['sync'],
			//},

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
					'html-panel/styles/app.css': 'less/tychpanel.less',
				}
			}
		},

		//sync: {
			//main: {
				//files: [{
					//cwd: '../scripts',
					//src: [
						//'**',
					//],
					//dest: 'hybrid-panel/scripts',
				//}],
				//verbose: true,
			//}
		//},

		autoprefixer: {
			main: {
				src: 'html-panel/styles/app.css',
				dest: 'html-panel/styles/app.css',
			},
		},

	});

	grunt.registerTask('default', ['sync', 'less', 'autoprefixer', 'watch']);

};
