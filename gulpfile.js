(function(gulp, gulpLoadPlugins) {
  'use strict';
  var $ = gulpLoadPlugins({pattern: '*', lazy: true}),
      _ = {
        app:  'app', 
        dist: '_site', 
        sass: '_scss',
        tmpl: 'app',        
        js:   'app/js',
        css:  'app/css',
        img:  'app/img'
      };

  function handleError(error){
    console.log(error.message);
    this.emit('end');
  } 

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ jshint
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('jshint', function() {
    return gulp.src([ 'gulpfile.js' , _.js + '/**/*.js'])
      .pipe($.jshint('.jshintrc'))
      .pipe($.jshint.reporter('jshint-stylish'));
  });


  gulp.task('compass', function() {
    gulp.src(_.sass + '/**/*.{scss, sass}')
      .pipe($.compass({
        config_file: _.sass+'/config.rb',
        css: _.css,
        sass: _.sass
      }))
      .pipe(gulp.dest(_.css));
  });

  /**
   * Build the Jekyll Site
  */
  gulp.task('jekyll-build', function (done) {
       var spawn = require('child_process').spawn;
       var jekyll = spawn('jekyll.bat', ['build'], {stdio: 'inherit'}).on('close', done);
  });


  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ copy static files to dist files
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  // gulp.task('copy', function() {
  //   return gulp.src(_.app + '/img/**/*')
  //     .pipe(gulp.dest(_.dist + '/img/'))
  //     .pipe($.size());
  // });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ sass2css (node-sass)
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('sass', function() {
    return gulp.src(_.sass + '/**/*.{scss, sass}')
      .pipe($.plumber({ errorHandler: handleError}))
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        outputStyle: 'expanded',
        includePaths: [ './bower_components/' ]
      }))
      .pipe($.autoprefixer())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(_.css))
      .pipe($.size({
        title: 'CSS files:'
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ optimize images
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('image', function () {
    return gulp.src(_.img + '/**/*')
      .pipe($.imagemin({
        progressive: true
      }))
      .pipe(gulp.dest(_.dist + '/img/'))
      .pipe($.size({
        title: 'IMAGE files:'
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ join & minify css & js
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('html', function() {
    return gulp.src(['app/*.html'])
      .pipe($.plumber())
      .pipe($.useref.assets())
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', $.minifyCss({
        keepSpecialComments: 0
      })))
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest(_.dist));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ connect
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('connect', function() {
    $.connect.server({
      root: ['./_site'],
      livereload: true,
      port: 9000
    });
  });

  var wfs = [
      _.app + '/*.html',
      _.css + '/**/*.css',
      _.img + '/**/*.{png,jpg,jpeg,gif,ico}',
      _.js  + '/**/*.js'
    ];

  // gulp.task('reload',function(){
  //   gulp.src(wfs).pipe($.connect.reload());
  // });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ server
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('server', ['connect', 'compass', 'jekyll-build'], function() {
    $.shelljs.exec('open http://localhost:9000/app/');
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ watch
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('watch', ['server'], function() {

    $.watch(wfs, function(){
      gulp.start('jekyll-build');
      // gulp.src(wfs).pipe($.connect.reload());
    });

    // Watch style files
    $.watch([_.sass + '/*.{sass,scss}'] , function() {
      gulp.start('compass');
    });

    // Watch template files
    // $.watch([_.tmpl + '/*.html'], function() {
    //   gulp.start('jekyll-build');
    // });
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ clean dist folder
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('clean', function() {
    return $.del([_.dist]);
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ alias
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('start', ['watch']);
  gulp.task('test',  ['jshint']);
  gulp.task('build', ['jekyll-build', 'compass', 'clean'], function(){
    gulp.start(['html', 'image']);
    return gulp.src(['app/font/*'])
      .pipe(gulp.dest(_.dist + '/font/'));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ default
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('default', ['build']);
}(require('gulp'), require('gulp-load-plugins')));
