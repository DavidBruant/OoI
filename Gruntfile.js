"use strict";

module.exports = function(grunt) {

	grunt.initConfig({
		typescript: {
			base: {
				src: ['Firefox/src/ts/*.ts'],
				dest: 'Firefox/lib',
				options: {
					module: 'commonjs',
					target: 'es5',
					sourcemap: true,
					base_path: 'Firefox/src/ts',
					declaration: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');
};