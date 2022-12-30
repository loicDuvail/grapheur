const functionInput = document.getElementById("function-input");
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 1;
canvas.height = window.innerHeight - 1;
const ctx = canvas.getContext("2d");

function map(
    value,
    inputInterval = { min: 0, max: 1 },
    outputInterval = { min: -10, max: 10 }
) {
    //start by mapping between 0 and 1
    const inputRange = Math.abs(inputInterval.max - inputInterval.min);
    const shrinkedValue = (value - inputInterval.min) / inputRange;
    //then map to outputInterval
    const outputRange = Math.abs(outputInterval.max - inputInterval.min);
    const output = shrinkedValue * outputRange + outputInterval.min;
    return output;
}

function drawLine(x1, y1, x2, y2, lineWidth = 1, color = "red") {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawLineOnPlane(
    x1,
    y1,
    x2,
    y2,
    planeXMin,
    planeYMin,
    planeXMax,
    planeYMax,
    lineWidth = 1,
    color = "red"
) {
    // draws line on canvas by mapping inputs from mathematical plane
    //dimensions to canvas dimensions (plane covers canvas)

    let mappedX1 = map(
        x1,
        { min: planeXMin, max: planeXMax },
        { min: 0, max: ctx.canvas.width }
    );
    let mappedY1 =
        ctx.canvas.height -
        map(
            y1,
            { min: planeYMin, max: planeYMax },
            { min: 0, max: ctx.canvas.height }
        );
    let mappedX2 = map(
        x2,
        { min: planeXMin, max: planeXMax },
        { min: 0, max: ctx.canvas.width }
    );
    let mappedY2 =
        ctx.canvas.height -
        map(
            y2,
            { min: planeYMin, max: planeYMax },
            { min: 0, max: ctx.canvas.height }
        );

    drawLine(mappedX1, mappedY1, mappedX2, mappedY2, lineWidth, color);
}

function getGridXInterval(planeXmin, planeXMax) {
    let planeXRange = Math.abs(planeXmin - planeXMax);

    let possibleBases = [1, 2, 3];
    let powerOfTen = 0;

    let maxVerticalLinesNum = 16;
    let minVerticalLineNum = 10;
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

function drawPlaneAxis(planeXMin, planeYMin, planeXMax, planeYMax) {
    //x axis
    drawLineOnPlane(
        planeXMin,
        0,
        planeXMax,
        0,
        planeXMin,
        planeYMin,
        planeXMax,
        planeYMax,
        1.3,
        "black"
    );
    //y axis
    drawLineOnPlane(
        0,
        planeYMin,
        0,
        planeYMax,
        planeXMin,
        planeYMin,
        planeXMax,
        planeYMax,
        1.3,
        "black"
    );
}

//formats number to clear everything after first non-zero decimal
//and displays as power of ten if too big. used to avoid having to big
//grid indexes displayed
function formatLineIndex(num) {
    if (num < 1) {
        let dec = parseInt(num * 10);
        let i = 0;
        while (dec == 0) {
            i++;
            dec = parseInt(num * 10 ** i);
        }
        return num.toFixed(i);
    }
    if (num.toString().length > 6) {
        let powerOfTen = parseInt(Math.log10(num));
        let factor = num / 10 ** powerOfTen;
        if (factor == 1) return "10" + convertNumToPower(powerOfTen);
        return formatLineIndex(factor) + "×10" + convertNumToPower(powerOfTen);
    }
    return num;
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
    planeXMin,
    planeXMax,
    planeYMin,
    planeYMax,
    xShift,
    yShift,
    textAlign = "center"
) {
    let mappedX = map(
        x,
        { min: planeXMin, max: planeXMax },
        { min: 0, max: canvas.width }
    );
    let mappedY =
        canvas.height -
        map(
            y,
            { min: planeYMin, max: planeYMax },
            { min: 0, max: canvas.height }
        );

    ctx.fillStyle = "black";

    if (mappedX < 5) {
        mappedX = 10;
        ctx.fillStyle = "grey";
    }
    if (mappedX > canvas.width) {
        mappedX = canvas.width - 10;
        ctx.fillStyle = "grey";
    }
    if (mappedY < 0) {
        mappedY = 10;
        ctx.fillStyle = "grey";
    }
    if (mappedY > canvas.height) {
        mappedY = canvas.height - 10;
        ctx.fillStyle = "grey";
    }

    ctx.beginPath();
    ctx.textAlign = textAlign;
    ctx.font = "14px arial";
    if (index == 0) return ctx.fillText(index, mappedX - 12, mappedY + 20);

    ctx.fillText(index, mappedX + xShift, mappedY + yShift);
}

function drawXSublines(
    x,
    xInterval,
    planeXMin,
    planeXMax,
    planeYMin,
    planeYMax
) {
    let xSign = x / Math.abs(x);
    let linesNb = 5;
    if (xInterval.toString()[0] == 2) {
        linesNb = 4;
    }
    let sublineInterval = xInterval / linesNb;

    if (xSign == 1)
        for (let i = x; i < x + xInterval; i += sublineInterval) {
            drawLineOnPlane(
                i,
                planeYMin,
                i,
                planeYMax,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
    else
        for (let i = x; i > x - xInterval; i -= sublineInterval) {
            drawLineOnPlane(
                i,
                planeYMin,
                i,
                planeYMax,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
    if (x == 0) {
        for (let i = x; i > x - xInterval; i -= sublineInterval) {
            drawLineOnPlane(
                i,
                planeYMin,
                i,
                planeYMax,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
        for (let i = x; i < x + xInterval; i += sublineInterval) {
            drawLineOnPlane(
                i,
                planeYMin,
                i,
                planeYMax,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
    }
}

function drawYSublines(
    y,
    xInterval,
    planeXMin,
    planeXMax,
    planeYMin,
    planeYMax
) {
    let ySign = y / Math.abs(y);
    let linesNb = 5;
    if (xInterval.toString()[0] == 2) {
        linesNb = 4;
    }
    let sublineInterval = xInterval / linesNb;

    if (ySign == 1)
        for (let i = y; i < y + xInterval; i += sublineInterval) {
            drawLineOnPlane(
                planeXMin,
                i,
                planeXMax,
                i,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.3,
                "grey"
            );
        }
    else
        for (let i = y; i > y - xInterval; i -= sublineInterval) {
            drawLineOnPlane(
                planeXMin,
                i,
                planeXMax,
                i,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
    if (y == 0) {
        for (let i = y; i > y - xInterval; i -= sublineInterval) {
            drawLineOnPlane(
                planeXMin,
                i,
                planeXMax,
                i,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
        for (let i = y; i < y + xInterval; i += sublineInterval) {
            drawLineOnPlane(
                planeXMin,
                i,
                planeXMax,
                i,
                planeXMin,
                planeYMin,
                planeXMax,
                planeYMax,
                0.2,
                "grey"
            );
        }
    }
}

function drawGrid(planeXMin, planeYMin, planeXMax, planeYMax) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlaneAxis(planeXMin, planeYMin, planeXMax, planeYMax);

    const xInterval = getGridXInterval(planeXMin, planeXMax);

    for (let x = 0; x <= planeXMax; x += xInterval) {
        drawLineOnPlane(
            x,
            planeYMin,
            x,
            planeYMax,
            planeXMin,
            planeYMin,
            planeXMax,
            planeYMax,
            0.3,
            "black"
        );
        drawGridLineIndex(
            x,
            x,
            0,
            planeXMin,
            planeXMax,
            planeYMin,
            planeYMax,
            0,
            20,
            "center"
        );
        drawXSublines(x, xInterval, planeXMin, planeXMax, planeYMin, planeYMax);
    }

    for (let x = -xInterval; x >= planeXMin; x -= xInterval) {
        drawLineOnPlane(
            x,
            planeYMin,
            x,
            planeYMax,
            planeXMin,
            planeYMin,
            planeXMax,
            planeYMax,
            0.3,
            "black"
        );
        drawGridLineIndex(
            x,
            x,
            0,
            planeXMin,
            planeXMax,
            planeYMin,
            planeYMax,
            0,
            20,
            "center"
        );
        drawXSublines(x, xInterval, planeXMin, planeXMax, planeYMin, planeYMax);
    }

    for (let y = 0; y <= planeYMax; y += xInterval) {
        drawLineOnPlane(
            planeXMin,
            y,
            planeXMax,
            y,
            planeXMin,
            planeYMin,
            planeXMax,
            planeYMax,
            0.3,
            "black"
        );
        if (y != 0)
            drawGridLineIndex(
                y,
                0,
                y,
                planeXMin,
                planeXMax,
                planeYMin,
                planeYMax,
                -7,
                4,
                "right"
            );
        drawYSublines(y, xInterval, planeXMin, planeXMax, planeYMin, planeYMax);
    }

    for (let y = -xInterval; y >= planeYMin; y -= xInterval) {
        drawLineOnPlane(
            planeXMin,
            y,
            planeXMax,
            y,
            planeXMin,
            planeYMin,
            planeXMax,
            planeYMax,
            0.3,
            "black"
        );
        drawGridLineIndex(
            y,
            0,
            y,
            planeXMin,
            planeXMax,
            planeYMin,
            planeYMax,
            -7,
            4,
            "right"
        );
        drawYSublines(y, xInterval, planeXMin, planeXMax, planeYMin, planeYMax);
    }
}

let graphXInterval = { min: -10, max: 10 };

let canvasRatio = canvas.height / canvas.width;

let graphYInterval = {
    min: graphXInterval.min * canvasRatio,
    max: graphXInterval.max * canvasRatio,
};

drawGrid(
    graphXInterval.min,
    graphYInterval.min,
    graphXInterval.max,
    graphYInterval.max
);

let mouseX;
let mouseY;

document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

document.onmousedown = (e) => {
    let prevX = e.clientX;
    let prevY = e.clientY;

    let mouseMoveInterval = setInterval(() => {
        let x = mouseX;
        let y = mouseY;

        let xDiff = prevX - x;
        let yDiff = prevY - y;

        prevX = x;
        prevY = y;

        xDiff =
            (xDiff / canvas.width) *
            Math.abs(graphXInterval.min - graphXInterval.max);
        yDiff =
            -(yDiff / canvas.height) *
            Math.abs(graphYInterval.min - graphYInterval.max);

        graphXInterval.min += xDiff;
        graphYInterval.min += yDiff;
        graphXInterval.max += xDiff;
        graphYInterval.max += yDiff;

        drawGrid(
            graphXInterval.min,
            graphYInterval.min,
            graphXInterval.max,
            graphYInterval.max
        );
    }, 20);

    document.onmouseup = () => {
        clearInterval(mouseMoveInterval);
    };
};

document.onkeydown = (key) => {
    if (key.code === "ArrowUp") {
        graphXInterval.min /= 1.1;
        graphXInterval.max /= 1.1;
        graphYInterval.min /= 1.1;
        graphYInterval.max /= 1.1;
        drawGrid(
            graphXInterval.min,
            graphYInterval.min,
            graphXInterval.max,
            graphYInterval.max
        );
    }
    if (key.code === "ArrowDown") {
        graphXInterval.min *= 1.1;
        graphXInterval.max *= 1.1;
        graphYInterval.min *= 1.1;
        graphYInterval.max *= 1.1;
        drawGrid(
            graphXInterval.min,
            graphYInterval.min,
            graphXInterval.max,
            graphYInterval.max
        );
    }
};
