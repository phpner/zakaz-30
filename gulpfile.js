var gulp 			= require('gulp'),
	scss 			= require('gulp-sass'),
	bulkSass 		= require('gulp-sass-glob-import'),
	rename 			= require('gulp-rename'),
	bs 				= require('browser-sync').create(),
	data 			= require('gulp-data'),
	autoprefixer 	= require('gulp-autoprefixer'),
	cssmin 			= require('gulp-cssmin'),
	combineMq 		= require('gulp-combine-mq'),
	sourcemaps 		= require('gulp-sourcemaps'),
	nunjucks 		= require('gulp-nunjucks'),
	plumber 		= require('gulp-plumber'),
	PATHS 			= require('./package.json').paths,
	twig 			= require('gulp-twig'),
	BROWSERS_LIST 	= require('./package.json').browserslist;

gulp.task('browser-sync', function () {
	bs.init({
		server: {
			baseDir: './dist'
		}
	});
});

gulp.task('nunjucks', function() {
	gulp.src(PATHS.src.templates + '*.html')
		.pipe(plumber())
		.pipe(data(function (file) {
			return require('./' + PATHS.src.data + '_global.json');
		}))
		.pipe(nunjucks.compile())
		.pipe(gulp.dest(PATHS.dist.html))
		.pipe(bs.reload({ stream: true }));
});

gulp.task('twig', function () {
	'use strict';
	return gulp.src(PATHS.src.templates + '*.twig')
		.pipe(plumber())
		.pipe(twig(data(function (file) {
			return require('./' + PATHS.src.data + '_global.json');
		})))
		.pipe(gulp.dest(PATHS.dist.html))
		.pipe(bs.reload({ stream: true }));
});

gulp.task('scss', function () {
	return gulp.src(PATHS.src.styles + 'main.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(bulkSass())
		.pipe(scss().on('error', scss.logError))
		.pipe(scss({
			includePaths: [PATHS.src.styles]
		}))
        .pipe(sourcemaps.write())
        .pipe(rename('style.css'))
        .pipe(gulp.dest(PATHS.dist.css))
        .pipe(bs.reload({stream: true}));
});

gulp.task('autoprefixer', function() {
	gulp.src(PATHS.dist.css + 'style.css')
		.pipe(autoprefixer({
			browsers: BROWSERS_LIST,
			cascade: false
		}))
		.pipe(gulp.dest(PATHS.dist.css));
});

gulp.task('css', function() {
	gulp.src(PATHS.dist.css + 'style.css')
		.pipe(autoprefixer({
			browsers: BROWSERS_LIST,
			cascade: false
		}))
		.pipe(combineMq({
			beautify: true
		}))
		.pipe(cssmin())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(PATHS.dist.css));
});

gulp.task('watcher', function() {
	gulp.watch(PATHS.src.templates + '**/*.twig', ['twig']);
	gulp.watch(PATHS.src.styles + '**/*.scss', ['scss']);
});

gulp.task('run', ['watcher', 'browser-sync']);