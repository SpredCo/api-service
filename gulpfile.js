const fs = require('fs');
const gulp = require('gulp');
const shell = require('gulp-shell');
var eslint = require('gulp-eslint');
const docGen = require('api-doc-generator');
const changelog = require('gulp-changelogmd');

gulp.task('default', function () {
  console.log('Default task');
});

gulp.task('changelog', function () {
  const pkg = JSON.parse(fs.readFileSync('./package.json'));

  return gulp.src('./CHANGELOG.md')
    .pipe(changelog(pkg.version))
    .pipe(gulp.dest('./'));
});

gulp.task('doc', function (done) {
  const pkg = JSON.parse(fs.readFileSync('./package.json'));

  docGen.generateDocumentation('./api-service.yaml', './CHANGELOG.md', pkg.version, './doc/', done);
});

gulp.task('lint', function () {
  return gulp.src(['*.js', 'test/**/**/*.js', 'route/**/*.js', 'auth/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('update', shell.task(['npm  update spred-common', 'npm  update spred-http-helper']));
