// Глобальные переменные:                            
var FIELD_SIZE_X = 20; //строки
var FIELD_SIZE_Y = 20; //столбцы
var SNAKE_SPEED = 200; // Интервал между перемещениями змейки
var snake = []; // Сама змейка
var direction = 'y+'; // Направление движения змейки
var gameIsRunning = false; // Запущена ли игра
var snake_timer; // Таймер змейки
var food_timer; // Таймер для еды
var score = 0; // Результат

function init() {
    prepareGameField(); // Генерация поля

    var wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле

    /*
	if (16 * (FIELD_SIZE_X + 1) < 380) {
        wrap.style.width = '380px';
    }
    else {
        wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
    }
    */
    wrap.style.width = '400px';
    // События кнопок Старт и Новая игра
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

    // Отслеживание клавиш клавиатуры
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    // Создаём таблицу
    var game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table');

    // Генерация ячеек игровой таблицы
    for (var i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (var j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.append(cell); // Добавление ячейки
        }
        game_table.append(row); // Добавление строки
    }

    document.getElementById('snake-field').append(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    gameIsRunning = true;
    respawn(); //создали змейку

    snake_timer = setInterval(move, SNAKE_SPEED); //каждые 200мс запускаем функцию move
    food_unit_timer = setInterval(() => createFood.call(food), 5000);
    bomb_unit_timer = setInterval(() => createFood.call(bomb), 6000); //каждые 6с запускаем функцию addBombUnit
}

/**
 * Функция расположения змейки на игровом поле
 */
function respawn() {
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Хвост змейки
    var snake_tail = document.querySelector('.cell-' + start_coord_y + '-' + start_coord_x);
    snake_tail.classList.add('snake-unit');

    // Голова змейки
    var snake_head = document.querySelector('.cell-' + (start_coord_y - 1) + '-' + start_coord_x);
    snake_head.classList.add('snake-unit');

    snake.push(snake_tail);
    snake.push(snake_head);
}

/**
 * Движение змейки
 */
function move() {
    //console.log('move',direction);
    // Сборка классов
    var snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');

    // Сдвиг головы
    var new_unit;
    var snake_coords = snake_head_classes[1].split('-'); //преобразовали строку в массив
    var coord_y = parseInt(snake_coords[1]);
    var coord_x = parseInt(snake_coords[2]);

    // Определяем новую точку
    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0];
    } else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0];
    } else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
    } else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    checkUnit(new_unit)

    function checkUnit(new_unit) {
        if (!isSnakeUnit(new_unit) && new_unit !== undefined && isBombUnit(new_unit)) {
            // Добавление новой части змейки
            new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
            snake.push(new_unit);

            // Проверяем, надо ли убрать хвост
            if (!haveFood(new_unit)) {
                // Находим хвост
                var removed = snake.splice(0, 1)[0];
                var classes = removed.getAttribute('class').split(' ');

                // удаляем хвост
                removed.setAttribute('class', classes[0] + ' ' + classes[1]);
            }
        } else if (new_unit == undefined) {
            if (direction == 'x-') {
                new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (FIELD_SIZE_X - 1))[0];
            } else if (direction == 'x+') {
                new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + 0)[0];
            } else if (direction == 'y+') {
                new_unit = document.getElementsByClassName('cell-' + (FIELD_SIZE_Y - 1) + '-' + (coord_x))[0];
            } else if (direction == 'y-') {
                new_unit = document.getElementsByClassName('cell-' + 0 + '-' + (coord_x))[0];
            }
            checkUnit(new_unit) // в случае выхода за границу поля переопределили новые координаты и перезапустили функцию
        } else {
            finishTheGame();
        }
    }
}
/*
 * Проверка на змейку
 * @param unit
 * @returns {boolean}
 */
function isSnakeUnit(unit) {
    var check = false;

    if (snake.includes(unit)) {
        check = true;
    }
    return check;
}

/*
 * Проверка на бомбочку
 */
function isBombUnit(unit) {
    var check = true;
    var classes = unit.getAttribute('class').split(' '); // взяли новую точку движения и представили её классы в виде массива
    if (classes.includes('bomb-unit')) { // проверили, нет ли среди классов новой точки класса bomb-unit
        check = false;
    }
    return check;
}

/*
 * проверка на еду
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    var check = false;

    var unit_classes = unit.getAttribute('class').split(' ');

    // Если еда
    if (unit_classes.includes('food-unit')) {
        check = true;
        createFood.call(food);
        score++;
        scoreboard = document.querySelector("#score");
        scoreboard.innerText = "Ваш результат " + score;
    }
    return check;
}

/**
 * Создание еды / бомбочки
 * принимает параметр 'food-unit' или 'bomb-unit'
 */

var food = {
    title: 'food-unit'
}

var bomb = {
    title: 'bomb-unit'
}

function createFood() {
    var foodCreated = false;

    while (!foodCreated) { //пока еду не создали
        // рандом
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        // проверка на змейку
        if (!food_cell_classes.includes('snake-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + this.title);
            foodCreated = true;
        }
    }
}

/*
 * Изменение направления движения змейки
 * @param e - событие
 */
function changeDirection(e) {
    console.log(e);
    switch (e.keyCode) {
        case 37: // Клавиша влево
            if (direction != 'x+') {
                direction = 'x-'
            }
            break;
        case 38: // Клавиша вверх
            if (direction != 'y-') {
                direction = 'y+'
            }
            break;
        case 39: // Клавиша вправо
            if (direction != 'x-') {
                direction = 'x+'
            }
            break;
        case 40: // Клавиша вниз
            if (direction != 'y+') {
                direction = 'y-'
            }
            break;
    }
}

/**
 * Функция завершения игры
 */
function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    clearInterval(food_unit_timer);
    clearInterval(bomb_unit_timer);
    alert('Вы проиграли! Ваш результат: ' + score.toString());
}

/**
 * Новая игра
 */
function refreshGame() {
    location.reload();
}

// Инициализация
window.onload = init;