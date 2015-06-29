var gulp         = require('gulp-param')(require('gulp'), process.argv),
    del          = require("del"),
    Q            = require("q"),
    gulpif       = require("gulp-if"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    minifycss    = require("gulp-minify-css"),
    mininline    = require("gulp-minify-inline"),
    minifyHTML   = require("gulp-minify-html"),
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
function task_dev_mixin() {
    var defer = Q.defer();

    gulp.src([DIR_MIXIN+"src/core/*.scss",
        DIR_MIXIN+"src/eui/varible/_z-index.scss",
        DIR_MIXIN+"src/eui/varible/_color.scss",
        DIR_MIXIN+"src/eui/varible/_base.scss",
        DIR_MIXIN+"src/eui/varible/button.scss",
        DIR_MIXIN+"src/eui/varible/*.scss",
        DIR_MIXIN+"src/eui/component/*.scss"])
    .pipe(concat("mixin.scss"))
    .pipe(gulp.dest(DIR_MIXIN+"dist/"))
    .pipe(gulp.dest(DIR_MAGIC+"src/lib/"))
    .pipe(gulp.dest(DIR_APP+"pub/lib/"))
    .on("finish", function() { defer.resolve(); })

    return defer.promise
}
gulp.task("dev-mixin", task_dev_mixin);


/* minjs 相关任务方法 */
function task_dev_minjs() {
    var defer = Q.defer()

    gulp.src(DIR_MINJS+"dist/*.js")
    .pipe(gulp.dest(DIR_MINJS+"dist/"))
    .pipe(gulp.dest(DIR_MAGIC+"src/lib/minjs/"))
    .on("finish", function() { defer.resolve() })

    return defer.promise
}
gulp.task("dev-minjs", task_dev_minjs)


/* magic 相关任务方法 */
function task_dev_magic_css() {
    var defer = Q.defer()

    gulp.src(DIR_MAGIC+"src/core/main.scss")
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename("magic.css"))
    .pipe(gulp.dest(DIR_MAGIC+"dist/"))
    .pipe(gulp.dest(DIR_APP+"pub/lib/"))
    .on("finish", function() {
        if (release /* 发布时才优化 */) {
            gulp.src(DIR_MAGIC+"dist/magic.css")
            .pipe(minifycss())
            .pipe(rename("magic.min.css"))
            .pipe(gulp.dest(DIR_MAGIC+"dist/"))
            .on("finish", function() { defer.resolve(); })
        } else {
            defer.resolve();
        }
    })

    return defer.promise
}
gulp.task("dev-magic-css", task_dev_magic_css);

function task_dev_magic_js() {
    var LIB_MINJS = DIR_MAGIC + "/src/lib/minjs/",
        DIR_CORE  = DIR_MAGIC + "/src/core/";

    var defer = Q.defer()

    webpack({
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
        })
    .pipe(gulp.dest(DIR_MAGIC+"dist/"))
    .pipe(gulp.dest(DIR_MAGIC_VUE+"src/lib/"))
    .on("finish", function() {
        if (release /* 发布时才优化 */) {
            gulp.src(DIR_MAGIC+"dist/magic.js")
            .pipe(uglify())
            .pipe(rename("magic.min.js"))
            .pipe(gulp.dest(DIR_MAGIC+"dist/"))
            .on("finish", function() { defer.resolve(); })
        } else {
            defer.resolve();
        }
    })

    return defer.promise;
}
gulp.task("dev-magic-js", task_dev_magic_js);


/* magic-vue 相关任务*/
function task_dev_magic_vue() {
    var DIR_SRC = DIR_MAGIC_VUE + "/src/";

    var defer = Q.defer()

    webpack({
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
        })
    .pipe(gulp.dest(DIR_MAGIC_VUE+"dist/"))
    .pipe(gulp.dest(DIR_APP+"pub/lib/"))
    .on("finish", function() {
        if (release /* 发布时才优化 */) {
            gulp.src(DIR_MAGIC_VUE+"dist/magic.vue.js")
            .pipe(uglify())
            .pipe(rename("magic.vue.min.js"))
            .pipe(gulp.dest(DIR_MAGIC_VUE+"dist/"))
            .on("finish", function() { defer.resolve() })
        } else {
            defer.resolve()
        }
    })

    return defer.promise 
}
gulp.task("dev-magic-vue", task_dev_magic_vue);


/* APP 相关任务 */
function task_dev_app_html() {
    var inline = {
            js: {output: { comments: true }},
            css: {output: { comments: true }}
        },
        html = { conditionals: true, spare: true };

    var defer = Q.defer()

    gulp.src(DIR_APP+"index.html")
    .pipe(gulpif(release, minifyHTML(html)))
    .pipe(gulpif(release, mininline(inline)))
    .pipe(gulp.dest(DIR_APP+"dist/"))
    .on("finish", function() { defer.resolve() })

    return defer.promise
}
gulp.task("dev-app-html", task_dev_app_html);

function task_dev_app_css() {
    var defer = Q.defer()

    gulp.src(DIR_APP+"pub/main.scss")
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulpif(release, minifycss()))
    .pipe(gulp.dest(DIR_APP+"pub/"))
    .on("finish", function() {
        gulp.src([DIR_APP+"pub/lib/magic.css",
                  DIR_APP+"pub/main.css"])
        .pipe(concat("main.css"))
        .pipe(gulpif(release, minifycss()))
        .pipe(gulp.dest(DIR_APP+"dist/page/"))
        .on("finish", function() { defer.resolve() })
    })

    return defer.promise
}
gulp.task("dev-app-css", task_dev_app_css);

function task_dev_app_pub() {
    var defer = Q.defer()

    gulp.src([DIR_APP+"pub/**/*", "!"+DIR_APP+"pub/main*",
              "!"+DIR_APP+"pub/lib/magic*",
              "!"+DIR_APP+"pub/lib/mixin.scss"])
    .pipe(gulp.dest(DIR_APP+"dist/pub/"))
    .on("finish", function() {
        defer.resolve()
    })

    return defer.promise
}
gulp.task("dev-app-pub", task_dev_app_pub);

function task_dev_app_js() {
    var UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin.js");
    var pugl = new UglifyJsPlugin({ sourceMap: false, mangle: false });

    var defer = Q.defer()

    gulp.src(DIR_APP+"pub/lib/vue.min.js")
        .pipe(gulp.dest(DIR_APP+"dist/pub/lib/"));

    webpack({
            entry: [DIR_APP  + "pub/main.js"],
            output: {
                filename: "[name].js",
                publicPath: "./page/"
            },
            module: {
                loaders: [
                    { test: /\.html$/, loader: "html" },
                    { test: /\.scss$/, loader: "style!css!sass!autoprefixer" },
                    { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192&name=../pub/img/[name].[ext]?[hash]'},
                ]
            },
            plugins: release ?  [pugl] : [],
        })
    .pipe(gulp.dest(DIR_APP + "dist/page"))
    .on("finish", function() { defer.resolve() })

    return defer.promise
}
gulp.task("dev-app-js", task_dev_app_js);

gulp.task("dev-app", function(rel) {
    release = rel ? true : false;

    return Q.all([
        task_dev_app_pub(),
        task_dev_app_html(),
        task_dev_app_css(),
        task_dev_app_js()
    ])
})


/* 监控刷新调试 */
gulp.task("serve", function() {
    browserSync({
        server: "./app/dist/"
    });

    /* mixin 动态刷新任务 */
    gulp.watch(["dev/mixin/src/**/*"], ["dev-mixin"])

    /* minjs 动态刷新任务 */
    gulp.watch(["dev/minjs/src/*"], ["dev-minjs"])

    /* magic 动态刷新任务 */
    gulp.watch(["dev/magic/src/**/*.scss"], ["dev-magic-css"])
    gulp.watch(["dev/magic/src/**/*.js"], ["dev-magic-js"])

    /* magic-vue 动态刷新任务 */
    gulp.watch(["dev/magic-vue/src/**/*"], ["dev-magic-vue"])

    /* APP 动态刷新任务 */
    gulp.watch(["app/index.html"], ["dev-app-html", reload])
    gulp.watch(["app/pub/lib/*.css", "app/pub/lib/*.scss",
                "app/pub/main.scss"], ["dev-app-css", reload])
    gulp.watch(["app/pub/lib/*.js", "app/page/**/*", "app/srvs/*.js",
                "app/pub/main.js"], ["dev-app-js", reload])
    gulp.watch(["app/pub/**/*", "!app/pub/main*", "!app/pub/lib/magic*",
                "!app/pub/lib/mixin.scss"], ["dev-app-pub", reload])
})

/* 全局构建任务 */
gulp.task("build.base", function() {
    return Q.all([
        task_dev_mixin(),
        task_dev_minjs()
    ])
})

gulp.task("build.magic", ["build.base"], function(rel) {
    release = rel ? true : false;

    return Q.all([
        task_dev_magic_css(),
        task_dev_magic_js()
    ])
})

gulp.task("build.vue", ["build.magic"], function(rel) {
    release = rel ? true : false;

    return Q.all([task_dev_magic_vue()])
})

gulp.task("build.app", ["build.vue"], function(rel) {
    release = rel ? true : false;

    gulp.run("dev-app");
})

gulp.task("build", function(rel) {
    release = rel ? true : false;

    gulp.run("build.app");
})

/* APP 清理任务 */
gulp.task("clean", function() {
    del(DIR_APP + "dist/");
    del(DIR_APP + "pub/main.css");
    del(DIR_APP + "pub/lib/magic*");
    del(DIR_APP + "pub/lib/mixin.scss");
})