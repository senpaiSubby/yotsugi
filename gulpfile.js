const gulp = require('gulp')

const copyFiles = () => {
  return gulp
    .src(['./src/subprocesses/webServer/app/**/*'])
    .pipe(gulp.dest('./dist/subprocesses/webServer/app'))
}

// Complex tasks
// const js = gulp.series(scriptsLint, scripts)

// Export tasks
exports.copy = copyFiles
// exports.js = js
