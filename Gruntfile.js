"use strict";

module.exports = function(grunt) {

	grunt.initConfig({
        xpi: {
            // TODO create xpi task
        },
        "cfx-test": {
            // cfx -b /home/david/Logiciel/aurora/firefox run ooi.xpi
        },
		typescript: {
			base: {
				src: ['**/*.ts'],
				dest: 'Firefox/lib',
				options: {
					module: 'commonjs',
					target: 'es5',
					sourcemap: true,
					base_path: 'Firefox/src/ts',
					declaration: true
				}
			}
		},
		watch: {
			typescript:{
				files: 'Firefox/src/ts/**/*.ts',
				tasks: ['typescript'],
				options: {
					nospawn: true
				}
			}
//          ,
//            xpi:{
//                files: 'Firefox/**/*',
//                tasks: ['xpi']
//            }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');
};