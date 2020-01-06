const gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')

const copyFiles = () => {
  return gulp
    .src(['./src/subprocesses/webServer/app/**/*'])
    .pipe(gulp.dest('./build/subprocesses/webServer/app'))
}

const buildProject = () => {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('build'))
}

exports.default = gulp.series(buildProject, copyFiles)
