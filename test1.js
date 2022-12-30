const functionInput = document.getElementById("function-input");
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 1;
canvas.height = window.innerHeight - 1;
const ctx = canvas.getContext("2d");

//base range in which function will be calculated and displayed
let xRange = { min: -10, max: 10 };
xRange.range = Math.abs(xRange.max - xRange.min);

let canvasRatio = ctx.canvas.height / ctx.canvas.width;
//yRange calculated so that resulting plane is orthonormal
let yRange = {
    min: xRange.min * canvasRatio,
    max: xRange.max * canvasRatio,
};

let backgroundColor = "white";

//number of points that will be calculated on every graph
let precision = 2000;

// all coords will be children of points objects (points = {x, y} for instance)

//////////// useful functions ////////////

function drawLine(p1, p2, color = "black", strokeWidth) {
    //invert y axis to match maths conventions
    p1.y = ctx.canvas.height - p1.y;
    p2.y = ctx.canvas.height - p2.y;

    //draw line
    if (strokeWidth) ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function map(input, inputRange = xRange, outputRange) {
    const inputRangeValue =
        inputRange.range || Math.abs(inputRange.max - inputRange.min);
    const outputRangeValue =
        outputRange.range || Math.abs(outputRange.max - outputRange.min);
    const scale = outputRangeValue / inputRangeValue;

    const output = (input - inputRange.min) * scale + outputRange.min;
    return output;
}

//draws line inside plane defined by xRange and yRange
function drawLineInPlane(p1, p2, color, strokeWidth) {
    const xInputRange = xRange;
    const xOutputRange = { min: 0, max: ctx.canvas.width };
    const yInputRange = yRange;
    const yOutputRange = { min: 0, max: ctx.canvas.height };

    const mappedP1 = {
        x: map(p1.x, xInputRange, xOutputRange),
        y: map(p1.y, yInputRange, yOutputRange),
    };

    const mappedP2 = {
        x: map(p2.x, xInputRange, xOutputRange),
        y: map(p2.y, yInputRange, yOutputRange),
    };

    drawLine(mappedP1, mappedP2, color, strokeWidth);
}

/////// all code related to drawing grid plane ////////

function drawAxes() {
    drawLineInPlane(
        { x: xRange.min, y: 0 },
        { x: xRange.max, y: 0 },
        "black",
        "1.3"
    );
    drawLineInPlane(
        { x: 0, y: yRange.min },
        { x: 0, y: yRange.max },
        "black",
        "1.3"
    );
}

function drawGridLineIndex(
    index,
    x,
    y,
    xShift = 0,
    yShift = 0,
    textAlign = "center"
) {
    index = limitToFirstDecimalPlace(index);

    x = map(x, xRange, { min: 0, max: canvas.width }) + xShift;
    y = canvas.height - map(y, yRange, { min: 0, max: canvas.height }) + yShift;

    if (x < 0) {
        drawText(index, 0, y, "grey", "left");
    }
    if (x > canvas.width) {
        drawText(index, canvas.width, y, "grey", "right");
    }
    if (y < 0) {
        drawText(index, x, 14, "grey", textAlign);
    }
    if (y > canvas.height)
        drawText(index, x, canvas.height - 10, "grey", textAlign);

    drawText(index, x, y, "black", textAlign);
}

function drawText(text, x, y, color, textAlign = "center") {
    ctx.textAlign = textAlign;
    ctx.font = "15px Courier New";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function limitToFirstDecimalPlace(num) {
    if (num % 1 == 0) return num;
    let dec = parseInt((num - parseInt(num)) * 10);
    let i = 1;
    while (dec == 0) {
        i++;
        dec = parseInt((num - parseInt(num)) * 10 ** i);
    }
    return num.toFixed(i);
}

function drawGridXSubLines(x, verticalLineInterval, i, direction = 1) {
    let subLineInterval = verticalLineInterval / 5;
    if (
        (i % 3 == 0 && verticalLineInterval < 1) ||
        (i % 3 == 2 && verticalLineInterval >= 1)
    ) {
        subLineInterval = verticalLineInterval / 4;
    }

    if (direction == -1)
        for (x; x < verticalLineInterval; x += subLineInterval) {
            drawLineInPlane(
                { x, y: yRange.min },
                { x, y: yRange.max },
                "lightGrey",
                0.2
            );
        }
    else
        for (x; x > verticalLineInterval; x -= subLineInterval) {
            drawLineInPlane(
                { x, y: yRange.min },
                { x, y: yRange.max },
                "lightGrey",
                0.2
            );
        }
}

function drawGridYSubLines(y, verticalLineInterval, i, direction = 1) {
    let subLineInterval = verticalLineInterval / 5;
    if (i % 3 == 1) {
        subLineInterval = verticalLineInterval / 4;
    }
    if (direction == -1)
        for (y; y < verticalLineInterval; y += subLineInterval) {
            drawLineInPlane(
                { x: xRange.min, y },
                { x: xRange.max, y },
                "lightGrey",
                0.3
            );
        }
    else {
        for (y; y > verticalLineInterval; y -= subLineInterval) {
            drawLineInPlane(
                { x: xRange.min, y },
                { x: xRange.max, y },
                "lightGrey",
                0.3
            );
        }
    }
}

function drawGrid() {
    let intervalMultiples = [1, 2, 5];
    const maxVerLineNum = 16;
    const minVerLineNum = 8;
    // 1 2 5 10 20 50 100 200 500 1000 2000 5000 10000
    let verticalLineInterval;
    let i = 0;
    let tenX = 0;
    //initial value set to this to start while loop successfuly
    let vertiLineNum = maxVerLineNum + 1;

    if (xRange.range > maxVerLineNum)
        while (vertiLineNum > maxVerLineNum) {
            verticalLineInterval = intervalMultiples[i % 3] * 10 ** tenX;
            vertiLineNum = parseInt(xRange.range / verticalLineInterval);
            i++;
            tenX = parseInt(i / 3);
        }
    else {
        vertiLineNum = 0;
        while (vertiLineNum < minVerLineNum) {
            verticalLineInterval =
                1 / (intervalMultiples[i % 3] * 10 ** (tenX - 1));
            vertiLineNum = parseInt(xRange.range / verticalLineInterval);
            i++;
            tenX = parseInt(i / 3);
        }
    }

    for (
        let x = verticalLineInterval;
        x <= xRange.max;
        x += verticalLineInterval
    ) {
        drawLineInPlane(
            { x, y: yRange.min },
            { x, y: yRange.max },
            "black",
            0.37
        );
        drawGridXSubLines(x, verticalLineInterval, i, 1);
        drawGridLineIndex(x, x, 0, 0, 15);
    }

    for (
        let x = -verticalLineInterval;
        x >= xRange.min;
        x -= verticalLineInterval
    ) {
        drawLineInPlane(
            { x, y: yRange.min },
            { x, y: yRange.max },
            "black",
            0.37
        );
        drawGridXSubLines(x, verticalLineInterval, i, -1);
        drawGridLineIndex(x, x, 0, 0, 15);
    }

    for (
        let y = verticalLineInterval;
        y <= yRange.max;
        y += verticalLineInterval
    ) {
        drawLineInPlane(
            { x: xRange.min, y },
            { x: xRange.max, y },
            "black",
            0.37
        );
        drawGridYSubLines(y, verticalLineInterval, i);
        drawGridLineIndex(y, 0, y, -5, 4, "right");
    }

    for (
        let y = -verticalLineInterval;
        y >= yRange.min;
        y -= verticalLineInterval
    ) {
        drawLineInPlane(
            { x: xRange.min, y },
            { x: xRange.max, y },
            "black",
            0.37
        );
        drawGridYSubLines(y, verticalLineInterval, i, -1);
        drawGridLineIndex(y, 0, y, -5, 4, "right");
    }

    drawGridLineIndex(0, 0, 0, -10, 15);
}

drawAxes();
drawGrid();

//////////// function graphing related ////////////

//returns image of input based on input function
function getImage(stringFunction, x) {
    let func = stringFunction.replace("sin", "Math.sin");
    func = func.replace("cos", "Math.cos");
    func = func.replace("log", "Math.log");
    const y = eval(func || "x");
    return y;
}

function graphFunction(func, color = "red") {
    //stores previous y value to draw lines
    let prevX = xRange.min;
    let prevY = getImage(func, prevX);

    let xIncrement = xRange.range / precision;

    for (let x = xRange.min + xIncrement; x < xRange.max; x += xIncrement) {
        let y = getImage(func, x);
        drawLineInPlane({ x: prevX, y: prevY }, { x, y }, color, "2");
        prevX = x;
        prevY = y;
    }
}

let functions = [];

function graphEveryFunctions() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes();
    drawGrid();

    functions.forEach((func) => {
        graphFunction(func, "rgba(40, 40, 169, 0.641)");
    });
}

functionInput.addEventListener("keydown", (key) => {
    if (key.code == "Enter") {
        functions.push(functionInput.value);
        graphEveryFunctions();
        functionInput.value = "";
    }
});

///////// mouse drag related //////////

let mousePosX, mousePosY;

addEventListener("mousemove", (e) => {
    mousePosX = e.clientX;
    mousePosY = e.clientY;
});

//move on graph using mouse
document.onmousedown = () => {
    //style
    canvas.style.cursor = "grabbing";

    let prevX = mousePosX;
    let prevY = mousePosY;

    let graphRedrawInterval = setInterval(() => {
        let x = mousePosX;
        let y = mousePosY;

        let xShift = prevX - x;
        let yShift = prevY - y;

        prevX = x;
        prevY = y;

        let mappedXShift =
            (xShift / canvas.width) * Math.abs(xRange.min - xRange.max);
        let mappedYShift =
            (-yShift / canvas.height) * Math.abs(yRange.min - yRange.max);

        let newXRange = {
            min: xRange.min + mappedXShift,
            max: xRange.max + mappedXShift,
            range: Math.abs(xRange.min - xRange.max),
        };
        let newYRange = {
            min: yRange.min + mappedYShift,
            max: yRange.max + mappedYShift,
        };

        xRange = newXRange;
        yRange = newYRange;

        graphEveryFunctions();
    });

    (document.onmouseup = () => clearInterval(graphRedrawInterval)),
        (canvas.style.cursor = "grab");
};

//zoom back and forth using arrow keys with invarient point being (0,0) point
addEventListener("keydown", (key) => {
    if (key.code === "ArrowDown") {
        xRange.min *= 1.05;
        xRange.max *= 1.05;
        xRange.range = Math.abs(xRange.min - xRange.max);
        yRange.min *= 1.05;
        yRange.max *= 1.05;
        yRange.range = Math.abs(yRange.min - yRange.max);
        graphEveryFunctions();
    }
    if (key.code === "ArrowUp") {
        xRange.min = xRange.min / 1.05;
        xRange.max = xRange.max / 1.05;
        xRange.range = Math.abs(xRange.min - xRange.max);
        yRange.min = yRange.min / 1.05;
        yRange.max = yRange.max / 1.05;
        yRange.range = Math.abs(yRange.min - yRange.max);
        graphEveryFunctions();
    }
});
