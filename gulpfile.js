var gulp         = require('gulp'),
    del          = require("del"),
    gulpif       = require("gulp-if"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    minifycss    = require("gulp-minify-css"),
    uglify       = require("gulp-uglify"),
    rename       = require("gulp-rename"),
    webpack      = require("gulp-webpack"),
    hash         = require("gulp-hash"),
    concat       = require("gulp-concat");


var DIR_MIXIN = __dirname + "/dev/mixin/",
    DIR_MINJS = __dirname + "/dev/minjs/",
    DIR_MAGIC = __dirname + "/dev/magic/";


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
    del(DIR_MAGIC+"dist/magic-*.css");

    return gulp.src(DIR_MAGIC+"src/core/main.scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(rename("magic.css"))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
        .pipe(minifycss())
        .pipe(rename("magic.min.css"))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
        .pipe(rename("magic.css"))
        .pipe(hash({hashLength: 5}))
        .pipe(rename({extname: ".min.css"}))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
})

gulp.task("dev-magic-js", function() {
    var LIB_MINJS = DIR_MAGIC + "/src/lib/minjs/",
        DIR_CORE  = DIR_MAGIC + "/src/core/";

    del("dist/magic-*.js");

    return gulp.src(DIR_CORE + "main.js")
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
        .pipe(uglify())
        .pipe(rename("magic.min.js"))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
        .pipe(rename("magic.js"))
        .pipe(hash({hashLength: 5}))
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest(DIR_MAGIC+"dist/"))
})

gulp.task("clean.magic", function() {
    del(DIR_MAGIC+"dist/magic*");
})