var gulp         = require('gulp'),
    rigger       = require('gulp-rigger'), /*Плагин позволяет импортировать один файл в другой простой конструкцией //= footer.html*/
    sourcemaps   = require('gulp-sourcemaps'), /*это способ связать минифицированный/объединённый файл с файлами, из которых он получился. Во время сборки для боевого окружения помимо минификации и объединения файлов также генерируется файл-маппер, который содержит информацию об исходных файлах. Когда производится обращение к конкретному месту в минифицированном файле, то производится поиск в маппере, по которому вычисляется строка и символ в исходном файле.*/
    uglify       = require('gulp-uglify'), /*будет сжимать наш JS*/
    sass         = require('gulp-sass'),
    prefixer     = require('gulp-autoprefixer'),
    postcss 		 = require("gulp-postcss"),
    mqpacker 		 = require("css-mqpacker"), /*группирует media queries и перемещает их в конец файла*/
    cssmin 			 = require("gulp-csso"), /*минифицирует css-файл */
    watch        = require('gulp-watch'),
    del          = require('del'),
    browserSync  = require('browser-sync'),
    reload       = browserSync.reload;

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html:  'build/',
        js:    'build/js/',
        css:   'build/css/',
        img:   'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html:  'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js:    'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img:   'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html:  'src/**/*.html',
        js:    'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img:   'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('browser-sync', function() {
    browserSync({
        server:{
            baseDir: "./build"
        },
    });
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('style:dev', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(postcss([mqpacker({sort: true})])) //группируем media queries и перемещаем их в конец файла
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}))
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(postcss([mqpacker({sort: true})])) //группируем media queries и перемещаем их в конец файла
        .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'style:dev',
    'js:build',
    'image:build',
    'fonts:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });

    watch([path.watch.style], function(event, cb) {
        gulp.start('style:dev');
    });

    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });

    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });

    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['clean', 'build', 'browser-sync', 'watch']);