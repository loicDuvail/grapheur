let functionsContainer = document.getElementById("functions-container");

function getAllIndexes(value, string = "") {
    let index = 0;
    let lastIndex = 0;
    let indexes = [];
    while (index != -1) {
        index = string.indexOf(value, index);
        indexes.push(index);

        if (lastIndex == index) {
            index = -1;
            indexes.pop();
        }

        lastIndex = index;
    }
    return indexes;
}

let currentColorIndex = 0;

function createFunctionBox(func) {
    func ||= {
        id: crypto.randomUUID(),
        functionStr: "",
        function: (x) => "",
        color: COLORS_ARRAY[currentColorIndex],
        strokeWidth: 2.5,
    };

    currentColorIndex = (currentColorIndex + 1) % 3;

    functions.push(func);

    functionsContainer.appendChild(createFunctionBoxHtml(func));

    graphEveryFunctions(2000, plane);
}

function createFunctionBoxHtml(func) {
    let funcBox = document.createElement("div");
    let funcInput = document.createElement("input");
    let removeFuncBoxBtn = document.createElement("div");
    removeFuncBoxBtn.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>`;

    removeFuncBoxBtn.onclick = () => {
        functionsContainer.removeChild(funcBox);
        functions.splice(functions.indexOf(func), 1);
        graphEveryFunctions(2000, plane);
    };

    removeFuncBoxBtn.classList.add("func-parent-delete-btn");

    funcInput.oninput = () => {
        setFunctionExpression(func, funcInput);
        graphEveryFunctions(2000, plane);
    };
    funcInput.value = func.functionStr;

    funcInput.classList.add("function-input");
    funcBox.classList.add("function-parent");

    funcBox.appendChild(funcInput);
    funcBox.appendChild(removeFuncBoxBtn);
    return funcBox;
}

function setFunctionExpression(func, funcInput) {
    let mathFunction = convertToJavascriptFunction(funcInput.value);
    func.function = mathFunction;
}

let MathMethods = [];

let MathObj = Object.getOwnPropertyNames(Math);
for (let method in MathObj) {
    MathMethods.push(MathObj[method]);
}

function convertToJavascriptFunction(functionStr) {
    MathMethods.forEach(
        (method) =>
            (functionStr = functionStr.replaceAll(method, `Math.${method}`))
    );

    if (functionStr.includes("sum")) functionStr = addSumNotation(functionStr);

    console.log(`(x)=>${functionStr}`);
    return eval(`(x)=>${functionStr}`);
}

function addSumNotation(functionStr) {
    let argumentsStrStart =
        functionStr.indexOf("(", functionStr.indexOf("sum")) + 1;

    let argumentsStrEnd = getArgumentsStrEnd(argumentsStrStart, functionStr);

    let argumentsStr = functionStr.substring(
        argumentsStrStart,
        argumentsStrEnd
    );

    let arguments = argumentsStr.split(",");

    console.log(arguments);

    const [i, n, func] = arguments;

    let str = `{let y = 0;
    for(let i = ${i};i < ${n};i++){
        y += ${func}
    };
    return y}`;

    console.log(str);

    return str;
}

function getArgumentsStrEnd(argStrStart, functionStr) {
    let startParenthesisCount = 1;
    let endParenthesisCount = 0;

    for (
        let charIndex = argStrStart;
        charIndex < functionStr.length;
        charIndex++
    ) {
        let char = functionStr[charIndex];
        if (char == ")") endParenthesisCount++;
        if (char == "(") startParenthesisCount++;

        console.log(startParenthesisCount);

        if (endParenthesisCount >= startParenthesisCount) return charIndex;
    }
}

createFunctionBox({
    id: crypto.randomUUID(),
    functionStr: "sin(x**2)",
    function: (x) => Math.sin(x ** 2),
    color: COLORS_ARRAY[currentColorIndex],
    strokeWidth: 2.5,
});
createFunctionBox({
    id: crypto.randomUUID(),
    functionStr: "log(x)",
    function: (x) => Math.log(x),
    color: COLORS_ARRAY[currentColorIndex],
    strokeWidth: 2.5,
});
