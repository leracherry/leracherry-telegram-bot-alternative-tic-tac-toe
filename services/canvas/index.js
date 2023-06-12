const { createCanvas } = require('canvas');

class CanvasService {
    createDefaultCanvas(moves, active, activeInner){

        let arrayFigures = []

        if(moves) {
            arrayFigures = moves
        }

        // Создание нового изображения
        const canvasWidth = 600; // Ширина холста
        const canvasHeight = 600; // Высота холста

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const canvasContext = canvas.getContext('2d');

// Заливка фона белым цветом
        canvasContext.fillStyle = '#FFFFFF'; // Белый цвет
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

// Количество квадратов
        const squareCount = 9; // Количество квадратов
        const squareSize = (canvasWidth - 10 * 4) / 3; // Размер квадрата
        const innerSquareSize = (squareSize - 10 * 4) / 3; // Размер внутреннего квадрата

// Цвета
        const outerSquareColor = '#0000FF'; // Синий цвет
        const innerSquareColor = '#00FF00'; // Зеленый цвет
        const borderColor = '#000000'; // Черный цвет
        const crossColor = '#FF0000'; // Красный цвет
        const circleColor = '#FFFFFF'; // Белый цвет

// Рисование квадратов
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = (squareSize + 10) * col + 10;
                const y = (squareSize + 10) * row + 10;

                // Рисование внешнего квадрата
                canvasContext.fillStyle = outerSquareColor;
                canvasContext.fillRect(x, y, squareSize, squareSize);

                // Рисование внутренних квадратов
                for (let innerRow = 0; innerRow < 3; innerRow++) {
                    for (let innerCol = 0; innerCol < 3; innerCol++) {
                        const innerX = x + (innerSquareSize + 10) * innerCol + 10;
                        const innerY = y + (innerSquareSize + 10) * innerRow + 10;

                        // Рисование внутреннего квадрата
                        canvasContext.fillStyle = innerSquareColor;
                        canvasContext.fillRect(innerX, innerY, innerSquareSize, innerSquareSize);

                        // Рисование границы внутреннего квадрата
                        canvasContext.strokeStyle = borderColor;
                        canvasContext.lineWidth = 1;
                        canvasContext.strokeRect(innerX, innerY, innerSquareSize, innerSquareSize);

                        for (let item = 0; item < arrayFigures.length; item++) {
                            // Рисование нолика
                            if (row === arrayFigures[item].row && col === arrayFigures[item].col && innerRow === arrayFigures[item].innerRow && innerCol === arrayFigures[item].innerCol) {
                                if(arrayFigures[item].figure === '0') {
                                    canvasContext.strokeStyle = crossColor;

                                    const centerX = innerX + innerSquareSize / 2;
                                    const centerY = innerY + innerSquareSize / 2;
                                    const radius = innerSquareSize / 2 - 10;

                                    canvasContext.fillStyle = circleColor;
                                    canvasContext.beginPath();
                                    canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                                    canvasContext.stroke();
                                }
                                if(arrayFigures[item].figure === 'X') {
                                    canvasContext.strokeStyle = crossColor;
                                    canvasContext.lineWidth = 2;

                                    canvasContext.beginPath();
                                    canvasContext.moveTo(innerX + 10, innerY + 10);
                                    canvasContext.lineTo(innerX + innerSquareSize - 10, innerY + innerSquareSize - 10);
                                    canvasContext.moveTo(innerX + 10, innerY + innerSquareSize - 10);
                                    canvasContext.lineTo(innerX + innerSquareSize - 10, innerY + 10);
                                    canvasContext.moveTo(innerX + 10, innerY + 10);
                                    canvasContext.lineTo(innerX + innerSquareSize - 10, innerY + innerSquareSize - 10);
                                    canvasContext.stroke();
                                }
                            }
                        }

                        if (active && row === active.row && col === active.col) {
                            // Рисование обводки вокруг активного квадрата
                            const borderSize = 5; // Размер обводки
                            const startX = x - borderSize;
                            const startY = y - borderSize;
                            const sizeWithBorder = squareSize + 2 * borderSize;

                            canvasContext.strokeStyle = 'red'; // Красный цвет
                            canvasContext.lineWidth = borderSize;
                            canvasContext.strokeRect(startX, startY, sizeWithBorder, sizeWithBorder);
                        }

                        if (
                            activeInner &&
                            row === activeInner.row &&
                            col === activeInner.col &&
                            innerRow === activeInner.innerRow &&
                            innerCol === activeInner.innerCol
                        ) {
                            const borderSize = 5; // Размер обводки
                            const startX = innerX - borderSize;
                            const startY = innerY - borderSize;
                            const sizeWithBorder = innerSquareSize + 2 * borderSize;

                            canvasContext.strokeStyle = 'brown'; // Коричневый цвет
                            canvasContext.lineWidth = borderSize;
                            canvasContext.strokeRect(startX, startY, sizeWithBorder, sizeWithBorder);
                        }
                    }
                }
            }
        }
        return canvas
    }
}

module.exports = new CanvasService()