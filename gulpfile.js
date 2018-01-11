'use strict';

const gulp          = require('gulp');
const babel         = require('gulp-babel');
const sourcemaps    = require('gulp-sourcemaps');
const concat        = require('gulp-concat');
const sass          = require('gulp-sass');
const cleanCSS      = require('gulp-clean-css');
const minifyJS      = require('gulp-minify');
const remove        = require('gulp-clean');
const csso          = require('gulp-csso');
const rename        = require('gulp-rename');
const mmq           = require('gulp-merge-media-queries');
const runSequence   = require('run-sequence');
const px2rem        = require('gulp-px2rem');
const pug           = require('gulp-pug');
const autoprefixer  = require('gulp-autoprefixer');
const browserSync   = require('browser-sync').create();
const wait          = require('gulp-wait');
const replace       = require('gulp-replace');

const PATHS = {
  dev: ['_dev/'],
  prod: ['_prod/'],
  imgs: 'images/*.{jpg,png}',
  jsApp: [
    'js/main.js'
  ],
  jsLibs: [
    'js/libs/jquery.js'
  ],
  scss: 'scss/app.scss',
  pug: ['pug/*.pug', '!pug/includes/**/*.pug']
};

const px2remConfig = {
  replace: true,
  rootValue: 10
};

//------------------------------ JS Concat Tasks

gulp.task('jsAppDev', () => gulp.src(PATHS.jsApp)
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest(PATHS.dev + 'js/'))
);

gulp.task('jsLibsDev', () => gulp.src(PATHS.jsLibs)
  .pipe(concat('libs.js'))
  .pipe(gulp.dest(PATHS.dev + 'js/'))
);

//------------------------------

//------------------------------ Minify JS

gulp.task('minify', () => gulp.src(PATHS.dev + 'js/*.js')
  .pipe(minifyJS({
    noSource: true,
    ext: {
      min:'.min.js'
    }
  }))
  .pipe(gulp.dest(PATHS.prod + 'js/'))
);

//------------------------------

//------------------------------ SASS Compile Tasks

gulp.task('sassDev', () => gulp.src(PATHS.scss)
  .pipe(wait(500))
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
  }))
  .on('error', sass.logError)
  .pipe(px2rem(px2remConfig))
  .pipe(autoprefixer({
    browsers: ['last 1 version'],
    cascade: false
  }))
  .pipe(sourcemaps.write())
  .pipe(rename('assets.dev.css'))
  .pipe(gulp.dest(PATHS.dev + 'css/'))
  .pipe(browserSync.stream())
);

gulp.task('sassProd', () => gulp.src(PATHS.scss)
  .pipe(sass({
    outputStyle: 'compressed'
  }))
  .on('error', sass.logError)
  .pipe(px2rem(px2remConfig))
  .pipe(autoprefixer({
    browsers: ['last 2 version', 'ie 10'],
    cascade: false
  }))
  .pipe(rename('assets.min.css'))
  .pipe(mmq())
  .pipe(cleanCSS({
    keepSpecialComments: 0
  }))
  .pipe(csso({
    report: 'gzip'
  }))
  .pipe(gulp.dest(PATHS.prod + 'css/'))
);

//------------------------------

//------------------------------ Remove Folders

gulp.task('cleanDev', () => gulp.src([
  PATHS.dev + 'css',
  PATHS.dev + 'js',
  PATHS.dev + 'index.html'
], {read: false}).pipe(remove()));

gulp.task('cleanProd', () => gulp.src([
  PATHS.prod + 'js',
  PATHS.prod + 'css',
  PATHS.prod + 'index.html'
], {read: false}).pipe(remove()));

gulp.task('cleanFullDev', () => gulp.src('_dev', {read: false}).pipe(remove()));
gulp.task('cleanFullProd', () => gulp.src('_prod', {read: false}).pipe(remove()));

//------------------------------

//------------------------------ Copy Files Tasks

gulp.task('copyDevImg', () => gulp.src(PATHS.imgs).pipe(gulp.dest(PATHS.dev + 'images/')));
gulp.task('copyProdImg', () => gulp.src(PATHS.imgs).pipe(gulp.dest(PATHS.prod + 'images/')));

//------------------------------

//------------------------------ Pug Compile Tasks

gulp.task('pugDev', () => gulp.src(PATHS.pug)
  .pipe(pug({
    pretty: true,
    data: {
      env: 'dev'
    }
  }))
  .pipe(gulp.dest('_dev'))
);

gulp.task('pugProd', () => gulp.src(PATHS.pug)
  .pipe(pug({
    pretty: true,
    data: {
      env: 'prod'
    }
  }))
  .pipe(gulp.dest('_prod'))
);

//------------------------------

//------------------------------ Watch

gulp.task('watch', () => {
  gulp.watch('pug/**/*.pug', () => runSequence('pugDev'));
  gulp.watch('scss/**/*.scss', () => runSequence('sassDev', 'pugDev'));
  gulp.watch('js/**/*.js', ['jsAppDev', 'jsLibsDev']);
});

//------------------------------

//------------------------------ BrowserSync

gulp.task('brSync', () => {
  browserSync.init({
    server: {
      watchTask: true,
      baseDir: "_dev/"
    },
    port: 7788,
    open: "external"
  });

  gulp.watch('_dev/*.html').on('change', browserSync.reload);
  gulp.watch('_dev/**/*.js').on('change', browserSync.reload);
});

//------------------------------

gulp.task('default', ['brSync', 'watch']);

gulp.task('dev', () => runSequence(
  'cleanDev',
  'sassDev',
  ['jsAppDev','jsLibsDev'],
  'pugDev',
  'copyDevImg'
));

gulp.task('prod', () => runSequence(
  'cleanProd',
  ['jsAppDev','jsLibsDev'],
  'minify',
  'pugProd',
  'sassProd',
  'copyProdImg'
));