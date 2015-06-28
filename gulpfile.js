var gulp         = require('gulp-param')(require('gulp'), process.argv),
    del          = require("del"),
    gulpif       = require("gulp-if"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    minifycss    = require("gulp-minify-css"),
    uglify       = require("gulp-uglify"),
    rename       = require("gulp-rename"),
    webpack      = require("gulp-webpack"),
    hash         = require("gulp-hash"),
    browserSync  = require('browser-sync'),
    reload       = browserSync.reload,
    concat       = require("gulp-concat");


var DIR_APP       = __dirname + "/app/",
    DIR_MIXIN     = __dirname + "/dev/mixin/",
    DIR_MINJS     = __dirname + "/dev/minjs/",
    DIR_MAGIC     = __dirname + "/dev/magic/",
    DIR_MAGIC_VUE = __dirname + "/dev/magic-vue/";

var release = false;    // 是否为发布输出，发布输出会压缩优化

/* mixin 想关任务方法 */
gulp.task("dev-mixin", function() {
    return gulp.src([DIR_MIXIN+"src/core/*.scss",
            DIR_MIXIN+"src/eui/varible/_z-index.scss",
            DIR_MIXIN+"src/eui/varible/_color.scss",
            DIR_MIXIN+"src/eui/varible/_base.scss",
            DIR_MIXIN+"src/eui/varible/button.scss",
            DIR_MIXIN+"src/eui/varible/*.scss",
            DIR_MIXIN+"src/eui/component/*.scss"])
        .pipe(concat("mixin.scss"))
        .pipe(gulp.dest(DIR_MIXIN+"dist/"))
        .pipe(gulp.dest(DIR_MAGIC+"src/lib/"));
})

gulp.task("clean.mixin", function() {
    del(DIR_MIXIN+"dist/mixin.scss");
    del(DIR_MAGIC+"src/lib/mixin.scss");
})


/* minjs 相关任务方法 */
gulp.task("dev-minjs", function() {
    return gulp.src(DIR_MINJS+"dist/*.js")
        .pipe(gulp.dest(DIR_MAGIC+"src/lib/minjs/"));
})

gulp.task("clean.minjs", function() {
    del(DIR_MIXIN+"dist/mixin.scss");
    del(DIR_MAGIC+"src/lib/minjs");
})


/* magic 相关任务方法 */
gulp.task("dev-magic-css", function() {
    gulp.src(DIR_MAGIC+"src/core/main.scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(rename("magic.css"))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
        .pipe(gulp.dest(DIR_APP+"pub/lib/"))

    if (release /* 发布时才优化 */) {
        gulp.src(DIR_MAGIC+"dist/magic.css")
            .pipe(minifycss())
            .pipe(rename("magic.min.css"))
            .pipe(gulp.dest(DIR_MAGIC+"dist/"))
    }
})

gulp.task("dev-magic-js", function() {
    var LIB_MINJS = DIR_MAGIC + "/src/lib/minjs/",
        DIR_CORE  = DIR_MAGIC + "/src/core/";

    gulp.src(DIR_CORE + "main.js")
        .pipe(webpack({
                entry: DIR_CORE + "main.js",
                output: {
                    filename: "magic.js"
                },
                resolve: {
                    alias: {
                        util:  LIB_MINJS + "util.js",
                        query: LIB_MINJS + "selector.js",
                        director: LIB_MINJS + "director.js",
                        domready: LIB_MINJS + "ondomready.js",
                        extend:   LIB_MINJS + "extend.js",
                        promise:  LIB_MINJS + "promise.js",
                        jsonp  :  LIB_MINJS + "jsonp.js",
                    }
                },
                module: {
                    loaders: [
                        { test: /\.html$/, loader: "html" },
                        { test: /\.scss$/, loader: "style!css!sass!autoprefixer" }
                    ]
                }
            }))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
        .pipe(gulp.dest(DIR_MAGIC_VUE+"src/lib/"))

    if (release /* 发布时才优化 */) {
        gulp.src(DIR_MAGIC+"dist/magic.js")
            .pipe(uglify())
            .pipe(rename("magic.min.js"))
            .pipe(gulp.dest(DIR_MAGIC+"dist/"))
    }
})

gulp.task("clean.magic", function() {
    del(DIR_MAGIC+"dist/magic*");
})


/* magic-vue 相关任务*/
gulp.task("dev-magic-vue", function() {
    var DIR_SRC = DIR_MAGIC_VUE + "/src/";

    gulp.src(DIR_SRC+"main.js")
        .pipe(webpack({
                entry: DIR_SRC+"main.js",
                output: {
                    filename: "magic.vue.js"
                },
                module: {
                    loaders: [
                        { test: /\.html$/, loader: "html" },
                        { test: /\.scss$/, loader: "style!css!sass!autoprefixer" }
                    ]
                }
            }))
        .pipe(gulp.dest(DIR_MAGIC_VUE+"dist/"))
        .pipe(gulp.dest(DIR_APP+"pub/lib/"))

    if (release /* 发布时才优化 */) {
        gulp.src(DIR_MAGIC_VUE+"dist/magic.vue.js")
            .pipe(uglify())
            .pipe(rename("magic.vue.min.js"))
            .pipe(gulp.dest(DIR_MAGIC_VUE+"dist/"))
    }
})

gulp.task("clean.magic-vue", function() {
    del(DIR_MAGIC_VUE+"dist/magic*");
})

/* 监控刷新调试 */
gulp.task("serve", function() {
    browserSync({
        server: "./app/"
    });
})