const gulp        = require("gulp");
const concat      = require("gulp-concat");
const uglify      = require("gulp-uglify-es").default;
const cleanCSS    = require("gulp-clean-css");
const rename      = require("gulp-rename");
const browserSync = require("browser-sync").create();
const htmlmin     = require("gulp-htmlmin");
const ejs         = require("gulp-ejs");
const i18n        = require("gulp-html-i18n");

/**
 * @description TOPページを書き出し
 * @return {*}
 * @public
 */
const buildTopEJS = () =>
{
    return gulp
        .src(["src/ejs/**/_top.ejs"])
        .pipe(ejs())
        .pipe(rename({
            "basename": "index",
            "extname": ".html"
        }))
        .pipe(gulp.dest("docs"));
};

/**
 * @description EJSからHTMLを生成
 * @return {*}
 * @public
 */
const buildEJS = () =>
{
    return gulp
        .src([
            "src/ejs/**/*.ejs",
            "!src/ejs/**/_*.ejs"
        ])
        .pipe(ejs())
        .pipe(rename({ "extname": ".html" }))
        .pipe(gulp.dest("dist"));
};

/**
 * @description HTMLをminifyして出力
 * @return {*}
 * @public
 */
const minifyHTML = () =>
{
    return gulp
        .src(["docs/**/*.html"])
        .pipe(htmlmin({
            "collapseWhitespace" : true,
            "removeComments"     : true
        }))
        .pipe(gulp.dest("docs"));
};

/**
 * @description JavaScriptをまとめてminifyして出力
 * @return {*}
 * @public
 */
const buildJavaScript = () =>
{
    return gulp
        .src(["src/javascript/*.js"])
        .pipe(concat("main.min.js"))
        .pipe(uglify({ "output": { "comments": /^!/ } }))
        .pipe(gulp.dest("docs/assets/js"));
};

/**
 * @description StyleSheetをまとめてminifyして出力
 * @return {*}
 * @public
 */
const buildStyleSheet = () =>
{
    return gulp
        .src("src/stylesheet/*.css")
        .pipe(cleanCSS())
        .pipe(rename({ "extname": ".min.css" }))
        .pipe(gulp.dest("docs/assets/css/"));
};

/**
 * @description local serverを起動
 * @return {void}
 * @public
 */
const browser = (done) =>
{
    browserSync.init({
        "server": {
            "baseDir": "docs",
            "index": "index.html"
        },
        "reloadOnRestart": true
    });
    done();
};

/**
 * @description local serverを再読込
 * @return {void}
 * @public
 */
const reload = (done) =>
{
    browserSync.reload();
    done();
};

/**
 * @description ファイルを監視、変更があればビルドしてlocal serverを再読込
 * @return {*}
 * @public
 */
const buildLang = () =>
{
    return gulp
        .src("dist/**/*.html")
        .pipe(i18n({
            "langDir": "./language",
            "createLangDirs": true,
            "renderEngine": "mustache"
        }))
        .pipe(gulp.dest("docs"));
};

/**
 * @description ファイルを監視、変更があればビルドしてlocal serverを再読込
 * @return {void}
 * @public
 */
const watchFiles = () =>
{
    gulp
        .watch("src/stylesheet/*.css")
        .on("change", gulp.series(buildStyleSheet, reload));

    gulp
        .watch("src/javascript/*.js")
        .on("change", gulp.series(buildJavaScript, reload));

    gulp
        .watch([
            "src/**/*.ejs",
            "language/**/*.json"
        ])
        .on("change", gulp.series(
            buildEJS,
            buildTopEJS,
            buildLang,
            minifyHTML,
            reload
        ));
};

exports.default = gulp.series(
    buildStyleSheet,
    buildJavaScript,
    buildEJS,
    buildTopEJS,
    buildLang,
    minifyHTML,
    browser,
    watchFiles
);

exports.build = gulp.series(
    buildStyleSheet,
    buildJavaScript,
    buildEJS,
    buildTopEJS,
    buildLang,
    minifyHTML
);
