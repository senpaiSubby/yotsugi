const gulp = require('gulp')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

const copyMediaAssets = () => gulp.src(['./src/core/images/**/*']).pipe(gulp.dest('./build/core/images'))

const copyWebServer = () =>
  gulp.src(['./src/subprocesses/Api Server/app/**/*']).pipe(gulp.dest('./build/subprocesses/Api Server/app'))

const buildProject = () => {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('build'))
}

exports.default = gulp.series(buildProject, copyWebServer, copyMediaAssets)
