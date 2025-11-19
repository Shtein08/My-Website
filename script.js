
// --- Логика Модального Окна ---
const gameModal = document.getElementById('gameModal');
const openGameButton = document.getElementById('openGameButton');
const closeButton = document.querySelector('.modal .close-button');
const startGameButton = document.getElementById('startGameButton'); // Кнопка старта игры внутри модалки

// Открыть модальное окно
openGameButton.addEventListener('click', (event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке '#'
    gameModal.style.display = 'flex'; // Показываем модальное окно
    gameModal.classList.remove('hidden'); // Удаляем класс скрытия, если был
    resetGame(); // Сбросить игру при открытии модального окна
});

// Закрыть модальное окно
closeButton.addEventListener('click', () => {
    gameModal.classList.add('hidden'); // Добавляем класс для анимации скрытия
    stopGame(); // Остановить игру при закрытии модального окна
    // Дождемся окончания анимации перед полным скрытием
    gameModal.addEventListener('animationend', function handler() {
        if (gameModal.classList.contains('hidden')) {
            gameModal.style.display = 'none';
            gameModal.removeEventListener('animationend', handler);
        }
    });
});

// Закрыть модальное окно, если кликнуть вне его содержимого
window.addEventListener('click', (event) => {
    if (event.target == gameModal) {
        gameModal.classList.add('hidden'); // Анимируем скрытие
        stopGame(); // Остановить игру при закрытии
        gameModal.addEventListener('animationend', function handler() {
            if (gameModal.classList.contains('hidden')) {
                gameModal.style.display = 'none';
                gameModal.removeEventListener('animationend', handler);
            }
        });
    }
});


// --- Логика Игры Змейка ---
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverMessage = document.getElementById('gameOverMessage');

const gridSize = 20; // Размер одной "клетки" на поле
let tileCount = canvas.width / gridSize; // Количество клеток по ширине/высоте

let snake = [
    { x: 10, y: 10 } // Начальная позиция змейки
];
let food = {};
let dx = 0; // Направление по X
let dy = 0; // Направление по Y
let score = 0;
let gameInterval; // Для хранения setInterval ID
let gameSpeed = 150; // Скорость игры (меньше число = быстрее)
let isGameOver = true;
let changingDirection = false; // Флаг для предотвращения двойных нажатий

// Инициализация или сброс игры
function resetGame() {
    stopGame(); // Остановить любую текущую игру
    snake = [
        { x: 10, y: 10 }
    ];
    dx = 0;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    isGameOver = true;
    changingDirection = false;
    gameOverMessage.textContent = 'Нажмите "Начать игру" для старта.';
    gameOverMessage.style.color = '#3498db'; // Начальный цвет текста
    generateFood();
    draw(); // Отрисовать начальное состояние
}

// Запуск игры
function startGame() {
    if (isGameOver) {
        resetGame(); // Сбросить состояние перед стартом новой игры
        isGameOver = false;
        gameOverMessage.textContent = ''; // Убрать сообщение "Игра окончена!"
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// Остановка игры
function stopGame() {
    clearInterval(gameInterval);
    isGameOver = true;
    dx = 0;
    dy = 0;
}

// Основной игровой цикл
function gameLoop() {
    changingDirection = false;
    if (isGameOver) return; // Остановить цикл, если игра окончена

    update();
    draw();
}

// Обновление состояния игры
function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Проверка столкновения со стенами
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount
    ) {
        endGame();
        return;
    }

    // Проверка столкновения с самим собой
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head); // Добавить новую голову

    // Проверка, съедена ли еда
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood(); // Сгенерировать новую еду
    } else {
        snake.pop(); // Удалить хвост, если еда не съедена
    }
}

// Отрисовка элементов на холсте
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистить холст

    // Рисуем змейку
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#27ae60' : '#2ecc71'; // Голова темнее
        ctx.strokeStyle = '#2c3e50';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // Рисуем еду
    ctx.fillStyle = '#e74c3c';
    ctx.strokeStyle = '#c0392b';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Генерация случайной позиции еды
function generateFood() {
    let newFoodX, newFoodY;
    let collisionWithSnake;

    do {
        newFoodX = Math.floor(Math.random() * tileCount);
        newFoodY = Math.floor(Math.random() * tileCount);
        collisionWithSnake = false;

        // Проверить, не появилась ли еда на теле змейки
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFoodX && snake[i].y === newFoodY) {
                collisionWithSnake = true;
                break;
            }
        }
    } while (collisionWithSnake);

    food = { x: newFoodX, y: newFoodY };
}

// Обработка нажатий клавиш для изменения направления
function changeDirection(event) {
    if (changingDirection || isGameOver) return; // Игнорировать, если уже меняем направление или игра окончена

    changingDirection = true;
    const keyPressed = event.keyCode;

    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Завершение игры
function endGame() {
    stopGame();
    isGameOver = true;
    gameOverMessage.textContent = `Игра окончена! Ваш счет: ${score}.`;
    gameOverMessage.style.color = '#e74c3c'; // Красный цвет для сообщения об окончании игры
    startGameButton.textContent = 'Начать заново';
}

// Привязываем обработчик к кнопке внутри модального окна
startGameButton.addEventListener('click', startGame);

// Привязываем обработчик событий клавиатуры к документу
document.addEventListener('keydown', changeDirection);

// Инициализируем игру при загрузке скрипта, чтобы отобразить первое состояние
resetGame();
