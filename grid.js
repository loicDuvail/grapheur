const gridCanvas = document.getElementById("grid-canvas");
gridCanvas.width = window.innerWidth - 1;
gridCanvas.height = window.innerHeight - 1;
let canvasRatio = gridCanvas.height / gridCanvas.width;
const gridCtx = gridCanvas.getContext("2d");

const plane = {};
plane.xInterval = {
    min: -10,
    max: 10,
};
plane.yInterval = {
    min: plane.xInterval.min * canvasRatio,
    max: plane.xInterval.max * canvasRatio,
};

function map(
    value,
    inputInterval = { min, max },
    outputInterval = { min, max }
) {
    const inputRangeValue = Math.abs(inputInterval.max - inputInterval.min);
    const outputRangeValue = Math.abs(outputInterval.max - outputInterval.min);
    const scale = outputRangeValue / inputRangeValue;

    const output = (value - inputInterval.min) * scale + outputInterval.min;
    return output;
}

function drawLine(
    x1,
    y1,
    x2,
    y2,
    ctx,
    lineWidth = 1,
    color = "red",
    stroke = true
) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (stroke) ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    if (stroke) ctx.stroke();
}

function drawLineOnPlane(
    x1,
    y1,
    x2,
    y2,
    plane,
    ctx,
    lineWidth = 1,
    color = "red"
) {
    // draws line on canvas by mapping inputs from mathematical plane
    //dimensions to canvas dimensions (plane covers canvas)
    let outputXInterval = { min: 0, max: gridCanvas.width };
    let outputYInterval = { min: 0, max: gridCanvas.height };

    let mappedX1 = map(x1, plane.xInterval, outputXInterval);
    let mappedY1 =
        gridCanvas.height - map(y1, plane.yInterval, outputYInterval);
    let mappedX2 = map(x2, plane.xInterval, outputXInterval);
    let mappedY2 =
        gridCanvas.height - map(y2, plane.yInterval, outputYInterval);

    drawLine(mappedX1, mappedY1, mappedX2, mappedY2, ctx, lineWidth, color);
}

function drawAxes(plane) {
    drawLineOnPlane(
        plane.xInterval.min,
        0,
        plane.xInterval.max,
        0,
        plane,
        gridCtx,
        1.3,
        "black"
    );
    drawLineOnPlane(
        0,
        plane.yInterval.min,
        0,
        plane.yInterval.max,
        plane,
        gridCtx,
        1.3,
        "black"
    );
}

function getGridXInterval(plane) {
    let planeXRange = Math.abs(plane.xInterval.min - plane.xInterval.max);

    let possibleBases = [1, 2, 5];
    let powerOfTen = 0;

    let maxVerticalLinesNum = parseInt(window.innerWidth / 100) + 1;
    let minVerticalLineNum = maxVerticalLinesNum / 2;
    let verticalLinesNum;
    let xInterval;

    let i = 0;
    if (planeXRange > maxVerticalLinesNum)
        do {
            xInterval = possibleBases[i % 3] * 10 ** powerOfTen;
            verticalLinesNum = planeXRange / xInterval;
            i++;
            powerOfTen = parseInt(i / 3);
        } while (verticalLinesNum > maxVerticalLinesNum);
    else
        do {
            xInterval = 1 / possibleBases[i % 3] / 10 ** powerOfTen;
            verticalLinesNum = planeXRange / xInterval;
            i++;
            powerOfTen = parseInt(i / 3);
        } while (verticalLinesNum < minVerticalLineNum);

    return xInterval;
}

//formats number to clear everything after last ~non-zero decimal
//and displays as power of ten if too big. used to avoid having to big
//grid indexes displayed
function formatLineIndex(num, xInterval) {
    if (num % 1 == 0) return num;
    if (Math.abs(num / xInterval) < 10 ** -4) return 0;

    let dec = 0;
    let i = 1;
    while (dec == 0) {
        dec = getNthDigit(xInterval, i);
        i++;
    }
    if (getNthDigit(num, i) != 0 && getNthDigit(num, i) != 9)
        return num.toFixed(i);
    return num.toFixed(i - 1);
}

function getNthDigit(num, n) {
    let dec = parseInt(num * 10 ** n).toString();
    return parseInt(dec[dec.length - 1]);
}

function convertNumToPower(num) {
    let powers = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁻"];
    let power = "";
    num = num.toString();
    for (let i = 0; i < num.length; i++) {
        if (num[i] === "-") power += powers[10];
        else {
            let digit = parseInt(num[i]);
            power += powers[digit];
        }
    }
    return power;
}

function drawGridLineIndex(
    index,
    x,
    y,
    plane,
    xShift,
    yShift,
    textAlign = "center",
    xInterval
) {
    let mappedX = map(x, plane.xInterval, { min: 0, max: gridCanvas.width });
    let mappedY =
        gridCanvas.height -
        map(y, plane.yInterval, { min: 0, max: gridCanvas.height });

    gridCtx.fillStyle = "black";

    if (mappedX < 5) {
        mappedX = 10;
        gridCtx.fillStyle = "grey";
    }
    if (mappedX > gridCanvas.width) {
        mappedX = gridCanvas.width - 10;
        gridCtx.fillStyle = "grey";
    }
    if (mappedY < 0) {
        mappedY = 10;
        gridCtx.fillStyle = "grey";
    }
    if (mappedY > gridCanvas.height) {
        mappedY = gridCanvas.height - 10;
        gridCtx.fillStyle = "grey";
    }

    gridCtx.beginPath();
    gridCtx.textAlign = textAlign;
    gridCtx.font = "14px arial";

    index = formatLineIndex(index, xInterval);

    if (index == 0) return gridCtx.fillText(index, mappedX - 8, mappedY + 17);

    gridCtx.fillText(index, mappedX + xShift, mappedY + yShift);
}

function drawGridXSubLines(plane, xInterval) {
    let interval = xInterval / 5;
    if (
        xInterval.toString()[xInterval.toString().length - 1] == 2 ||
        xInterval.toString()[0] == 2
    )
        interval = xInterval / 4;

    for (
        let x = xInterval * (parseInt(plane.xInterval.min / xInterval) - 1);
        x <= plane.xInterval.max;
        x += interval
    ) {
        drawLineOnPlane(
            x,
            plane.yInterval.min,
            x,
            plane.yInterval.max,
            plane,
            gridCtx,
            0.1,
            "black"
        );
    }
}

function drawGridYSublines(plane, xInterval) {
    let interval = xInterval / 5;
    if (
        xInterval.toString()[xInterval.toString().length - 1] == 2 ||
        xInterval.toString()[0] == 2
    )
        interval = xInterval / 4;

    for (
        let y = xInterval * (parseInt(plane.yInterval.min / xInterval) - 1);
        y <= plane.yInterval.max;
        y += interval
    ) {
        drawLineOnPlane(
            plane.xInterval.min,
            y,
            plane.xInterval.max,
            y,
            plane,
            gridCtx,
            0.1,
            "black"
        );
    }
}

function drawGrid(plane) {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    drawAxes(plane);

    let xInterval = getGridXInterval(plane);

    drawGridXSubLines(plane, xInterval);
    drawGridYSublines(plane, xInterval);

    for (
        let x = xInterval * parseInt(plane.xInterval.min / xInterval);
        x < plane.xInterval.max;
        x += xInterval
    ) {
        drawLineOnPlane(
            x,
            plane.yInterval.min,
            x,
            plane.yInterval.max,
            plane,
            gridCtx,
            0.5,
            "grey"
        );
        drawGridLineIndex(x, x, 0, plane, 0, 17, undefined, xInterval);
    }

    for (
        let y = xInterval * parseInt(plane.yInterval.min / xInterval);
        y < plane.yInterval.max;
        y += xInterval
    ) {
        drawLineOnPlane(
            plane.xInterval.min,
            y,
            plane.xInterval.max,
            y,
            plane,
            gridCtx,
            0.5,
            "grey"
        );
        if (formatLineIndex(y, xInterval) != 0)
            drawGridLineIndex(y, 0, y, plane, -5, 4, "right", xInterval);
    }
}

drawGrid(plane);

let mouseX = 0;
let mouseY = 0;
document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

document.onmousedown = () => {
    let prevX = mouseX;
    let prevY = mouseY;
    let mouseShiftInterval = setInterval(() => {
        let x = mouseX;
        let y = mouseY;

        let xShift = prevX - x;
        let yShift = y - prevY;

        prevX = x;
        prevY = y;

        xShift =
            (xShift / gridCanvas.width) *
            Math.abs(plane.xInterval.min - plane.xInterval.max);
        yShift =
            (yShift / gridCanvas.height) *
            Math.abs(plane.yInterval.min - plane.yInterval.max);

        plane.xInterval.min += xShift;
        plane.xInterval.max += xShift;
        plane.yInterval.min += yShift;
        plane.yInterval.max += yShift;

        drawGrid(plane);
        graphEveryFunctions(precision, plane);
    }, 10);

    document.onmouseup = () => clearInterval(mouseShiftInterval);
};

document.onkeydown = (key) => {
    if (key.code === "ArrowUp") {
        plane.xInterval.min /= 1.03;
        plane.xInterval.max /= 1.03;
        plane.yInterval.min /= 1.03;
        plane.yInterval.max /= 1.03;
        drawGrid(plane);
        graphEveryFunctions(precision, plane);
    }
    if (key.code === "ArrowDown") {
        plane.xInterval.min *= 1.03;
        plane.xInterval.max *= 1.03;
        plane.yInterval.min *= 1.03;
        plane.yInterval.max *= 1.03;
        drawGrid(plane);
        graphEveryFunctions(precision, plane);
    }
};
