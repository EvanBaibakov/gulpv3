"use strict" // строгий режим
// конст это подключка модулей в проект 1
const { src, dest } = require("gulp") //  считывать записывать
const gulp = require("gulp") // обьявляем понстанту и пишем рекваер
// конструкция по умолчению, далше индивидуально
const autoprefixer = require("gulp-autoprefixer") // сисс свойства вебкит нужен чтоб выставлять префиксы для сиссс файлов
const cssbeautify = require("gulp-cssbeautify"); // красивый сисс фаил
const removeComments = require('gulp-strip-css-comments'); // удаляет коменты и минифицирует фаил сисс
const rename = require("gulp-rename"); // переминивывает в мин сисс
const sass = require("gulp-sass")(require('sass')); //gulp sass и модуль сасс еще
const cssnano = require("gulp-cssnano"); // сжимает сисс фаил
const uglify = require("gulp-uglify"); // минификация джис фаила
const plumber = require("gulp-plumber"); //пламбер склеивает фалилы и в случае ощибок дает запуститься общему файил
const rigger = require('gulp-rigger'); // добавил в сборку самостоятельно так как не читался джиэс склеиваем джава скрипт файлы, можно разрабить несколько файлов логики, а галм ригер скомпилирует их в дест одним
const panini = require("panini"); // работа в шаблоне html
const imagemin = require("gulp-imagemin"); //immeyaem kartinki
const del = require("del"); // не работает сжимает картинки проверить версионность прописать как делать откат версии
// откат npm i gulp-imagemin@7.1.0 --save-dev
const notify = require("gulp-notify") // плагин дел также надо проверять на корректность работы сборки либо откат до шестой версии
const browserSync = require("browser-sync").create(); // локальный сервер и настройка параметров

//2

/*Paths пути вместо етой команды обривеатура паф с приставкой*/
const srcPath = "src/"
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css/",
        js: distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    }, // подпапки идут через две звездочки
    src: {
        html: srcPath + "*.html",
        css: srcPath + "assets/scss/*.scss",
        js: srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {

        html: srcPath + "**/*.html",
        js: srcPath + "assets/js/**/*.js",
        css: srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"

    },
    clean: "./" + distPath
}

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
}


function html() {
    panini.refresh()
    return src(path.src.html, { base: srcPath }) // путь к html failu // base srcPath запасной вариант что ничего не ломалось 
        .pipe(plumber())
        //пайп это метод задача срц считываем дест записываем
        .pipe(panini({
            root: srcPath,
            layouts: srcPath + "tpl/layouts/",
            partials: srcPath + "tpl/partials/",
            data: srcPath + "tpl/data/"
        }))
        .pipe(dest(path.build.html)) //доставка куда доставить построенное 
        .pipe(browserSync.reload({ stream: true }));
}

function css() {
    return src(path.src.css, { base: srcPath + "assets/scss/" }) //возращаем 
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS nesrabotal",
                    messege: "Error: <%= error.messege %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass()) // из ссисс в сас
        .pipe(autoprefixer())
        .pipe(cssbeautify()) //красивая отрисовка
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false, //не давать делать с с индексом ничего
            discardComments: {
                removeAll: true
            } // само собой минифицированый фаил не читабельный поэтому коменты убераем
        })) //приводит к супер уменшеному виду
        .pipe(removeComments()) //удалять коменты будет
        .pipe(rename({
            suffix: ".min",
            extname: ".css"

        })) // добавляем суфикс мин все логично в коде
        .pipe(dest(path.build.css)) //в десте строим сисс с учетом паф
        .pipe(browserSync.reload({ stream: true }));
    0

}

function js() {
    return src(path.src.js, { base: srcPath + "assets/js/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "js nesrabotal",
                    messege: "Error: <%= error.messege %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(rigger())//собираем воедино
        .pipe(dest(path.build.js))
        .pipe(uglify()) // минификация
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));
}

function images() {
    return src(path.src.images, { base: srcPath + "assets/images/" })
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));

}
function fonts() {
    return src(path.src.fonts, { base: srcPath + "assets/fonts/" })
        .pipe(browserSync.reload({ stream: true }));
}
function clean() {
    return del(path.clean) // используем функцию дел далее модуль паф и клинп
}
function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watchFiles, serve)

//3
exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch