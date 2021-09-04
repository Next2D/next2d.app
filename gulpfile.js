const gulp        = require("gulp");
const concat      = require("gulp-concat");
const uglify      = require("gulp-uglify-es").default;
const cleanCSS    = require("gulp-clean-css");
const rename      = require("gulp-rename");
const browserSync = require("browser-sync").create();
const minimist    = require("minimist");
const htmlmin     = require("gulp-htmlmin");
const ejs         = require("gulp-ejs");

const options = minimist(process.argv.slice(2), {
    "boolean": [ "prodBuild" ],
    "default": {
        "prodBuild": false
    }
});

function buildEJS ()
{
    return gulp
        .src([
            "src/ejs/**/*.ejs",
            "!src/ejs/**/_*.ejs"
        ])
        .pipe(ejs())
        .pipe(rename({ "extname": ".html" }))
        .pipe(gulp.dest("docs"));
}

/**
 * @description HTMLをminifyして出力
 * @return {*}
 * @public
 */
function minifyHTML ()
{
    return gulp
        .src(["docs/index.html", "docs/**/*.html"])
        .pipe(htmlmin({
            "collapseWhitespace" : true,
            "removeComments"     : true
        }))
        .pipe(gulp.dest("docs"));
}

/**
 * @description JavaScriptをまとめてminifyして出力
 * @return {*}
 * @public
 */
function buildJavaScript()
{
    const build = gulp
        .src(["src/javascript/*.js"])
        .pipe(concat("main.min.js"));

    if (options.prodBuild) {
        build.pipe(uglify({ "output": { "comments": /^!/ } }));
    }

    return build.pipe(gulp.dest("docs/assets/js"));
}

/**
 * @description StyleSheetをまとめてminifyして出力
 * @return {*}
 * @public
 */
function buildStyleSheet ()
{
    return gulp
        .src("src/stylesheet/*.css")
        .pipe(cleanCSS())
        .pipe(rename({ "extname": ".min.css" }))
        .pipe(gulp.dest("docs/assets/css/"));
}

/**
 * @description local serverを起動
 * @return {void}
 * @public
 */
function browser (done)
{
    browserSync.init({
        "server": {
            "baseDir": "docs",
            "index": "index.html"
        },
        "reloadOnRestart": true
    });
    done();
}

/**
 * @description local serverを再読込
 * @return {void}
 * @public
 */
function reload (done)
{
    browserSync.reload();
    done();
}

/**
 * @description ファイルを監視、変更があればビルドしてlocal serverを再読込
 * @return {void}
 * @public
 */
function watchFiles ()
{
    gulp
        .watch("src/stylesheet/*.css")
        .on("change", gulp.series(buildStyleSheet, reload));

    gulp
        .watch("src/javascript/*.js")
        .on("change", gulp.series(buildJavaScript, reload));

    gulp
        .watch("src/ejs/**/*.ejs")
        .on("change", gulp.series(buildEJS, minifyHTML, reload));
}

exports.default = gulp.series(
    buildStyleSheet,
    buildJavaScript,
    buildEJS,
    minifyHTML,
    browser,
    watchFiles
);