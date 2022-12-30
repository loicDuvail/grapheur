const functionInput = document.getElementById("function-input");
const graphCanvas = document.getElementById("functions-canvas");
graphCanvas.width = window.innerWidth - 1;
graphCanvas.height = window.innerHeight - 1;

const graphCtx = graphCanvas.getContext("2d");
graphCtx.lineCap = "round";

let precision = 2000;

const COLORS_OBJ = {
    green: "#388c46e0",
    red: "#c74440e0",
    blue: "#2d70b3e0",
};

const COLORS_ARRAY = ["#388c46e0", "#c74440e0", "#2d70b3e0"];

let functions = [];

async function graphFunction(
    func,
    precision,
    xInterval,
    ctx,
    color = "red",
    strokeWidth,
    funcObj
) {
    if (funcObj.function(1) === "") return;
    let valuePairs;
    if (!funcObj.valuePairs || !funcObj.xInterval)
        valuePairs = await getValuePairs(func, xInterval, precision, plane);

    let prevX = valuePairs[0].x;
    let prevY = valuePairs[0].y;

    ctx.beginPath();
    for (const valuePair of valuePairs) {
        let { x, y } = valuePair;
        drawLine(prevX, prevY, x, y, ctx, strokeWidth, color, false);
        prevX = x;
        prevY = y;
    }
    ctx.stroke();
}

function graphEveryFunctions(precision, plane) {
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    let { xInterval } = plane;

    functions.forEach((func) =>
        graphFunction(
            func.function,
            precision,
            xInterval,
            graphCtx,
            func.color,
            func.strokeWidth,
            func
        )
    );
}
graphEveryFunctions(precision, plane);

////////// other way /////////

function getValuePairs(func, xInterval, precision, plane) {
    let xMin = xInterval.min;
    let xMax = xInterval.max;
    let xRange = Math.abs(xMin - xMax);
    let step = xRange / precision;

    let valuePairs = [];

    return new Promise((resolve, reject) => {
        for (let x = xMin; x <= xMax; x += step) {
            let y = func(x);
            let mappedX = map(x, plane.xInterval, {
                min: 0,
                max: graphCanvas.width,
            });
            let mappedY =
                graphCanvas.height -
                map(y, plane.yInterval, {
                    min: 0,
                    max: graphCanvas.height,
                });

            valuePairs.push({ x: mappedX, y: mappedY });
        }

        resolve(valuePairs);
    });
}

function completeValuePairs(funcObj, xInterval, precision) {
    let previousXinterval = funcObj.xInterval;
    let { valuePairs } = funcObj;

    let xDiff = previousXinterval.min - xInterval.min;
    let xRange = Math.abs(xInterval.min - xInterval.max);

    let overflow = parseInt((xDiff / xRange) * precision);

    if (xDiff > 0) {
        let i = 0;
        while (i <= overflow) {
            valuePairs.pop();
            valuePairs.unshift();
        }
    }
}

////////// resize graph on window.resize event ////////////

window.onresize = () => {
    graphCanvas.height = window.innerHeight - 1;
    graphCanvas.width = window.innerWidth - 1;
    gridCanvas.height = window.innerHeight - 1;
    gridCanvas.width = window.innerWidth - 1;
    canvasRatio = graphCanvas.height / graphCanvas.width;
    plane.yInterval = {
        min: plane.xInterval.min * canvasRatio,
        max: plane.xInterval.max * canvasRatio,
    };
    drawGrid(plane);
    graphEveryFunctions(2000, plane);
};
