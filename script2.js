
// --- Логика Модального Окна ---
const gameModal = document.getElementById('gameModal');
const openGameButton = document.getElementById('openGameButton');
const closeButton = document.querySelector('.modal .close-button');
const startGameButton = document.getElementById('startGameButton');

// Открыть модальное окно
openGameButton.addEventListener('click', (event) => {
    event.preventDefault();
    gameModal.style.display = 'flex';
    gameModal.classList.remove('hidden');
    resetGame();
});

// Закрыть модальное окно
closeButton.addEventListener('click', () => {
    gameModal.classList.add('hidden');
    stopGame();
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
        gameModal.classList.add('hidden');
        stopGame();
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

// Получаем ссылки на кнопки управления
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

const gridSize = 20;
let tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 150;
let isGameOver = true;
let changingDirection = false;

// Инициализация или сброс игры
function resetGame() {
    stopGame();
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
    gameOverMessage.style.color = '#3498db';
    generateFood();
    draw();
}

// Запуск игры
function startGame() {
    if (isGameOver) {
        resetGame();
        isGameOver = false;
        gameOverMessage.textContent = '';
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
    if (isGameOver) return;

    update();
    draw();
}

// Обновление состояния игры
function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount
    ) {
        endGame();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

// Отрисовка элементов на холсте
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#27ae60' : '#2ecc71';
        ctx.strokeStyle = '#2c3e50';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

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

        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFoodX && snake[i].y === newFoodY) {
                collisionWithSnake = true;
                break;
            }
        }
    } while (collisionWithSnake);

    food = { x: newFoodX, y: newFoodY };
}

// Обработка изменения направления (для клавиатуры и кнопок)
function setDirection(newDx, newDy) {
    if (changingDirection || isGameOver) return;

    changingDirection = true;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (newDx === -1 && newDy === 0 && !goingRight) { // Left
        dx = -1; dy = 0;
    } else if (newDx === 1 && newDy === 0 && !goingLeft) { // Right
        dx = 1; dy = 0;
    } else if (newDx === 0 && newDy === -1 && !goingDown) { // Up
        dx = 0; dy = -1;
    } else if (newDx === 0 && newDy === 1 && !goingUp) { // Down
        dx = 0; dy = 1;
    }
}

// Обработка нажатий клавиш
function handleKeyPress(event) {
    const keyPressed = event.keyCode;

    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    if (keyPressed === LEFT_KEY) setDirection(-1, 0);
    if (keyPressed === UP_KEY) setDirection(0, -1);
    if (keyPressed === RIGHT_KEY) setDirection(1, 0);
    if (keyPressed === DOWN_KEY) setDirection(0, 1);
}

// Завершение игры
function endGame() {
    stopGame();
    isGameOver = true;
    gameOverMessage.textContent = `Игра окончена! Ваш счет: ${score}.`;
    gameOverMessage.style.color = '#e74c3c';
    startGameButton.textContent = 'Начать заново';
}

// Привязываем обработчик к кнопке старта внутри модального окна
startGameButton.addEventListener('click', startGame);

// Привязываем обработчики событий к кнопкам управления
upButton.addEventListener('click', () => setDirection(0, -1));
downButton.addEventListener('click', () => setDirection(0, 1));
leftButton.addEventListener('click', () => setDirection(-1, 0));
rightButton.addEventListener('click', () => setDirection(1, 0));


// Привязываем обработчик событий клавиатуры к документу
document.addEventListener('keydown', handleKeyPress);

// Инициализируем игру при загрузке скрипта
resetGame();
