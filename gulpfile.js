const gulp = require('gulp')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

const copyFiles = () => {
  gulp
    .src(['./src/subprocesses/webServer/app/**/*'])
    .pipe(gulp.dest('./build/subprocesses/webServer/app'))

  return gulp.src(['./src/core/images/**/*']).pipe(gulp.dest('./build/core/images'))
}

const buildProject = () => {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('build'))
}

exports.default = gulp.series(buildProject, copyFiles)
