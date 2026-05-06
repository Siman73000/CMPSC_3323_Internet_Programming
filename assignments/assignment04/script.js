const graph = document.getElementById("graph");
const modeSelect = document.getElementById("mode");
const expressionFields = document.getElementById("expressionFields");
const graphButton = document.getElementById("graphButton");
const resetButton = document.getElementById("resetButton");
const statusText = document.getElementById("status");
const graphTitle = document.getElementById("graphTitle");
const themeToggle = document.getElementById("themeToggle");
const mathModeButton = document.getElementById("mathModeButton");
const algorithmModeButton = document.getElementById("algorithmModeButton");
const mathControls = document.getElementById("mathControls");
const algorithmControls = document.getElementById("algorithmControls");
const mathWorkspace = document.getElementById("mathWorkspace");
const algorithmWorkspace = document.getElementById("algorithmWorkspace");

const algorithmCategory = document.getElementById("algorithmCategory");
const sortingControls = document.getElementById("sortingControls");
const searchingControls = document.getElementById("searchingControls");
const hashingControls = document.getElementById("hashingControls");
const algorithmTitle = document.getElementById("algorithmTitle");
const algorithmStatus = document.getElementById("algorithmStatus");
const algorithmStage = document.getElementById("algorithmStage");
const pseudocodeBlock = document.getElementById("pseudocodeBlock");
const traceLog = document.getElementById("traceLog");
const runAlgorithmButton = document.getElementById("runAlgorithmButton");
const stepAlgorithmButton = document.getElementById("stepAlgorithmButton");
const generateArrayButton = document.getElementById("generateArrayButton");
const resetAlgorithmButton = document.getElementById("resetAlgorithmButton");
const hashActionButtons = document.getElementById("hashActionButtons");
const hashInsertButton = document.getElementById("hashInsertButton");
const hashFindButton = document.getElementById("hashFindButton");
const hashDeleteButton = document.getElementById("hashDeleteButton");
const hashResetButton = document.getElementById("hashResetButton");

const fieldPresets = {
  cartesian2d: [
    { id: "f", label: "Function y = f(x)", value: "sin(x) + 0.1*x^2" }
  ],
  parametric2d: [
    { id: "xt", label: "x(t)", value: "cos(t)" },
    { id: "yt", label: "y(t)", value: "sin(t)" }
  ],
  polar2d: [
    { id: "r", label: "r(θ)", value: "2*sin(4*theta)" }
  ],
  derivative2d: [
    { id: "f", label: "Function f(x), app graphs f'(x)", value: "x^3 - 3*x + sin(x)" }
  ],
  integral2d: [
    { id: "f", label: "Function f(x), app shades ∫f(x)dx", value: "exp(-x^2)" }
  ],
  vector2d: [
    { id: "p", label: "P(x, y)", value: "-y" },
    { id: "q", label: "Q(x, y)", value: "x" }
  ],
  ode2d: [
    { id: "f", label: "dy/dx = f(x, y)", value: "y - x^2 + 1" }
  ],
  surface3d: [
    { id: "f", label: "Surface z = f(x, y)", value: "sin(sqrt(x^2 + y^2))" }
  ],
  parametric3d: [
    { id: "xt", label: "x(t)", value: "cos(t)" },
    { id: "yt", label: "y(t)", value: "sin(t)" },
    { id: "zt", label: "z(t)", value: "t/4" }
  ],
  vector3d: [
    { id: "p", label: "P(x, y, z)", value: "-y" },
    { id: "q", label: "Q(x, y, z)", value: "x" },
    { id: "r", label: "R(x, y, z)", value: "0.5*z" }
  ]
};

const modeTitles = {
  cartesian2d: "2D Cartesian Grapher",
  parametric2d: "2D Parametric Grapher",
  polar2d: "2D Polar Grapher",
  derivative2d: "Derivative Grapher",
  integral2d: "Integral Grapher",
  vector2d: "2D Vector Field Grapher",
  ode2d: "First-Order ODE Grapher",
  surface3d: "3D Surface Grapher",
  parametric3d: "3D Parametric Curve Grapher",
  vector3d: "3D Vector Field Grapher"
};

const pseudocode = {
  bubble: `for i from 0 to n - 2
  for j from 0 to n - i - 2
    if A[j] > A[j + 1]
      swap A[j] and A[j + 1]`,
  selection: `for i from 0 to n - 1
  minIndex = i
  for j from i + 1 to n - 1
    if A[j] < A[minIndex]
      minIndex = j
  swap A[i] and A[minIndex]`,
  insertion: `for i from 1 to n - 1
  key = A[i]
  j = i - 1
  while j >= 0 and A[j] > key
    A[j + 1] = A[j]
    j = j - 1
  A[j + 1] = key`,
  merge: `mergeSort(A, left, right)
  if left >= right return
  mid = floor((left + right) / 2)
  mergeSort(A, left, mid)
  mergeSort(A, mid + 1, right)
  merge sorted halves`,
  quick: `quickSort(A, low, high)
  if low < high
    pivotIndex = partition(A, low, high)
    quickSort(A, low, pivotIndex - 1)
    quickSort(A, pivotIndex + 1, high)`,
  heap: `build max heap
for end from n - 1 down to 1
  swap A[0] with A[end]
  heapify A[0..end-1]`,
  linear: `for i from 0 to n - 1
  if A[i] == target
    return i
return not found`,
  binary: `sort A first
low = 0, high = n - 1
while low <= high
  mid = floor((low + high) / 2)
  if A[mid] == target return mid
  if A[mid] < target low = mid + 1
  else high = mid - 1`,
  jump: `sort A first
step = floor(sqrt(n))
jump by block until A[min(step, n) - 1] >= target
linear scan inside that block`,
  hashing: `hash(key) = sum(character codes) mod tableSize

Separate chaining:
  store collisions in a linked list style bucket

Open addressing:
  try computed index, then probe until an open slot is found`
};

const complexityInfo = {
  bubble: ["Best O(n)", "Average O(n²)", "Space O(1)"],
  selection: ["Best O(n²)", "Average O(n²)", "Space O(1)"],
  insertion: ["Best O(n)", "Average O(n²)", "Space O(1)"],
  merge: ["Best O(n log n)", "Average O(n log n)", "Space O(n)"],
  quick: ["Best O(n log n)", "Average O(n log n)", "Worst O(n²)"],
  heap: ["Best O(n log n)", "Average O(n log n)", "Space O(1)"],
  linear: ["Best O(1)", "Average O(n)", "Space O(1)"],
  binary: ["Best O(1)", "Average O(log n)", "Needs sorted data"],
  jump: ["Best O(1)", "Average O(√n)", "Needs sorted data"],
  hashing: ["Average O(1)", "Worst O(n)", "Load factor matters"]
};

let currentSteps = [];
let currentStepIndex = 0;
let isAnimating = false;
let hashTable = [];
let lastHashProbes = [];

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function getNumber(id) {
  const value = Number(document.getElementById(id).value);
  if (!Number.isFinite(value)) throw new Error(`${id} must be a valid number.`);
  return value;
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function setAlgorithmStatus(message, isError = false) {
  algorithmStatus.textContent = message;
  algorithmStatus.classList.toggle("error", isError);
}

function currentThemeIsDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function plotLayout(title, is3D = false) {
  const dark = currentThemeIsDark();
  const textColor = dark ? "#f8fafc" : "#111827";
  const gridColor = dark ? "rgba(255,255,255,0.16)" : "rgba(17,24,39,0.14)";
  const paperColor = "rgba(0,0,0,0)";

  const layout = {
    title: { text: title, font: { color: textColor } },
    paper_bgcolor: paperColor,
    plot_bgcolor: paperColor,
    font: { color: textColor },
    margin: { t: 56, r: 28, b: 48, l: 55 },
    hovermode: "closest",
    xaxis: { zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor },
    yaxis: { zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor }
  };

  if (is3D) {
    layout.scene = {
      xaxis: { gridcolor: gridColor, zerolinecolor: gridColor, backgroundcolor: "rgba(0,0,0,0)" },
      yaxis: { gridcolor: gridColor, zerolinecolor: gridColor, backgroundcolor: "rgba(0,0,0,0)" },
      zaxis: { gridcolor: gridColor, zerolinecolor: gridColor, backgroundcolor: "rgba(0,0,0,0)" }
    };
  }

  return layout;
}

function range(start, end, count) {
  if (count < 2) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function indexRange(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function compileExpression(source) {
  try {
    return math.compile(source);
  } catch {
    throw new Error(`Could not parse expression: ${source}`);
  }
}

function safeEval(compiled, scope) {
  try {
    const value = compiled.evaluate(scope);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function finitePairs(xs, ys) {
  const cleanX = [];
  const cleanY = [];
  for (let i = 0; i < xs.length; i += 1) {
    const y = ys[i];
    cleanX.push(xs[i]);
    cleanY.push(Number.isFinite(y) ? y : null);
  }
  return [cleanX, cleanY];
}

function renderExpressionFields() {
  const mode = modeSelect.value;
  graphTitle.textContent = modeTitles[mode];
  expressionFields.innerHTML = "";

  for (const field of fieldPresets[mode]) {
    const wrapper = document.createElement("div");
    wrapper.className = "control-group";

    const label = document.createElement("label");
    label.setAttribute("for", field.id);
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = field.id;
    input.type = "text";
    input.autocomplete = "off";
    input.value = field.value;

    wrapper.append(label, input);
    expressionFields.appendChild(wrapper);
  }

  document.querySelectorAll(".ode-only").forEach((element) => {
    element.classList.toggle("hidden", mode !== "ode2d");
  });
}

function graphCartesian2D() {
  const f = compileExpression(getValue("f"));
  const xs = range(getNumber("xMin"), getNumber("xMax"), getNumber("resolution"));
  const ys = xs.map((x) => safeEval(f, { x }));
  const [cleanX, cleanY] = finitePairs(xs, ys);

  Plotly.newPlot(graph, [{ x: cleanX, y: cleanY, type: "scatter", mode: "lines", name: "f(x)" }], plotLayout("y = f(x)"), { responsive: true });
  setStatus("Graphed y = f(x). Undefined or infinite values are skipped.");
}

function graphDerivative2D() {
  const expression = getValue("f");
  let derivative;
  try {
    derivative = math.derivative(expression, "x").toString();
  } catch {
    throw new Error("Could not compute the symbolic derivative for this expression.");
  }

  const f = compileExpression(expression);
  const fp = compileExpression(derivative);
  const xs = range(getNumber("xMin"), getNumber("xMax"), getNumber("resolution"));
  const ys = xs.map((x) => safeEval(f, { x }));
  const dys = xs.map((x) => safeEval(fp, { x }));

  Plotly.newPlot(graph, [
    { x: xs, y: ys, type: "scatter", mode: "lines", name: "f(x)", opacity: 0.45 },
    { x: xs, y: dys, type: "scatter", mode: "lines", name: `f'(x) = ${derivative}` }
  ], plotLayout("Derivative"), { responsive: true });

  setStatus(`Symbolic derivative: f'(x) = ${derivative}`);
}

function graphIntegral2D() {
  const f = compileExpression(getValue("f"));
  const xs = range(getNumber("xMin"), getNumber("xMax"), getNumber("resolution"));
  const ys = xs.map((x) => safeEval(f, { x }) ?? 0);

  const cumulative = [0];
  for (let i = 1; i < xs.length; i += 1) {
    const dx = xs[i] - xs[i - 1];
    cumulative.push(cumulative[i - 1] + 0.5 * dx * (ys[i] + ys[i - 1]));
  }

  const total = cumulative[cumulative.length - 1];

  Plotly.newPlot(graph, [
    { x: xs, y: ys, type: "scatter", mode: "lines", fill: "tozeroy", name: "f(x) signed area" },
    { x: xs, y: cumulative, type: "scatter", mode: "lines", name: "Cumulative integral" }
  ], plotLayout("Numeric Integral"), { responsive: true });

  setStatus(`Approximate signed area over the selected x-range: ${total.toPrecision(8)}.`);
}

function graphParametric2D() {
  const xt = compileExpression(getValue("xt"));
  const yt = compileExpression(getValue("yt"));
  const ts = range(getNumber("tMin"), getNumber("tMax"), getNumber("resolution"));
  const xs = ts.map((t) => safeEval(xt, { t }));
  const ys = ts.map((t) => safeEval(yt, { t }));

  Plotly.newPlot(graph, [{ x: xs, y: ys, type: "scatter", mode: "lines", name: "r(t)" }], plotLayout("2D Parametric Curve"), { responsive: true });
  setStatus("Graphed the 2D parametric curve.");
}

function graphPolar2D() {
  const rExpression = compileExpression(getValue("r"));
  const thetas = range(getNumber("tMin"), getNumber("tMax"), getNumber("resolution"));
  const rs = thetas.map((theta) => safeEval(rExpression, { theta, t: theta }));

  Plotly.newPlot(graph, [{ r: rs, theta: thetas.map((value) => value * 180 / Math.PI), type: "scatterpolar", mode: "lines", name: "r(θ)" }], {
    ...plotLayout("Polar Graph"),
    polar: { radialaxis: { visible: true } }
  }, { responsive: true });

  setStatus("Graphed the polar function. θ is entered in radians and displayed in degrees.");
}

function graphVector2D() {
  const p = compileExpression(getValue("p"));
  const q = compileExpression(getValue("q"));
  const density = getNumber("vectorDensity");
  const xs = range(getNumber("xMin"), getNumber("xMax"), density);
  const ys = range(getNumber("yMin"), getNumber("yMax"), density);
  const traces = [];
  const scale = 0.28 * Math.min((xs[xs.length - 1] - xs[0]) / density, (ys[ys.length - 1] - ys[0]) / density);

  for (const x of xs) {
    for (const y of ys) {
      const u = safeEval(p, { x, y });
      const v = safeEval(q, { x, y });
      if (u === null || v === null) continue;
      const mag = Math.hypot(u, v) || 1;
      const dx = scale * u / mag;
      const dy = scale * v / mag;
      traces.push({
        x: [x, x + dx, null],
        y: [y, y + dy, null],
        type: "scatter",
        mode: "lines",
        line: { width: 1.6 },
        hoverinfo: "skip",
        showlegend: false
      });
    }
  }

  Plotly.newPlot(graph, traces, plotLayout("2D Vector Field"), { responsive: true });
  setStatus("Graphed the normalized 2D vector field.");
}

function rk4Step(compiled, x, y, h) {
  const f = (xVal, yVal) => safeEval(compiled, { x: xVal, y: yVal }) ?? 0;
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y + h * k1 / 2);
  const k3 = f(x + h / 2, y + h * k2 / 2);
  const k4 = f(x + h, y + h * k3);
  return y + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
}

function solveOdeDirection(compiled, xStart, yStart, xEnd, hSigned) {
  const xs = [xStart];
  const ys = [yStart];
  let x = xStart;
  let y = yStart;
  const maxSteps = 20000;

  for (let i = 0; i < maxSteps; i += 1) {
    if ((hSigned > 0 && x >= xEnd) || (hSigned < 0 && x <= xEnd)) break;
    const h = Math.abs(xEnd - x) < Math.abs(hSigned) ? xEnd - x : hSigned;
    y = rk4Step(compiled, x, y, h);
    x += h;
    if (!Number.isFinite(y)) break;
    xs.push(x);
    ys.push(y);
  }

  return { xs, ys };
}

function graphOde2D() {
  const f = compileExpression(getValue("f"));
  const xMin = getNumber("xMin");
  const xMax = getNumber("xMax");
  const yMin = getNumber("yMin");
  const yMax = getNumber("yMax");
  const x0 = getNumber("x0");
  const y0 = getNumber("y0");
  const h = Math.abs(getNumber("odeStep"));
  if (h <= 0) throw new Error("ODE step must be greater than zero.");

  const right = solveOdeDirection(f, x0, y0, xMax, h);
  const left = solveOdeDirection(f, x0, y0, xMin, -h);
  const solutionX = [...left.xs.reverse(), ...right.xs.slice(1)];
  const solutionY = [...left.ys.reverse(), ...right.ys.slice(1)];

  const density = Math.max(8, Math.min(18, getNumber("vectorDensity")));
  const xs = range(xMin, xMax, density);
  const ys = range(yMin, yMax, density);
  const traces = [];
  const scale = 0.25 * Math.min((xMax - xMin) / density, (yMax - yMin) / density);

  for (const x of xs) {
    for (const y of ys) {
      const slope = safeEval(f, { x, y });
      if (slope === null) continue;
      const mag = Math.hypot(1, slope) || 1;
      const dx = scale / mag;
      const dy = scale * slope / mag;
      traces.push({
        x: [x - dx, x + dx, null],
        y: [y - dy, y + dy, null],
        type: "scatter",
        mode: "lines",
        line: { width: 1 },
        hoverinfo: "skip",
        showlegend: false
      });
    }
  }

  traces.push({ x: solutionX, y: solutionY, type: "scatter", mode: "lines", line: { width: 4 }, name: "RK4 solution" });
  traces.push({ x: [x0], y: [y0], type: "scatter", mode: "markers", marker: { size: 9 }, name: "Initial condition" });

  Plotly.newPlot(graph, traces, plotLayout("ODE Slope Field and Solution"), { responsive: true });
  setStatus("Solved the first-order ODE numerically using fourth-order Runge-Kutta and graphed the slope field.");
}

function graphSurface3D() {
  const f = compileExpression(getValue("f"));
  const resolution = Math.min(getNumber("resolution"), 100);
  const xs = range(getNumber("xMin"), getNumber("xMax"), resolution);
  const ys = range(getNumber("yMin"), getNumber("yMax"), resolution);
  const z = ys.map((y) => xs.map((x) => safeEval(f, { x, y })));

  Plotly.newPlot(graph, [{ x: xs, y: ys, z, type: "surface", contours: { z: { show: true, usecolormap: true } } }], plotLayout("z = f(x, y)", true), { responsive: true });
  setStatus("Graphed the 3D surface z = f(x, y). Resolution is capped at 100 for performance.");
}

function graphParametric3D() {
  const xt = compileExpression(getValue("xt"));
  const yt = compileExpression(getValue("yt"));
  const zt = compileExpression(getValue("zt"));
  const ts = range(getNumber("tMin"), getNumber("tMax"), getNumber("resolution"));
  const xs = ts.map((t) => safeEval(xt, { t }));
  const ys = ts.map((t) => safeEval(yt, { t }));
  const zs = ts.map((t) => safeEval(zt, { t }));

  Plotly.newPlot(graph, [{ x: xs, y: ys, z: zs, type: "scatter3d", mode: "lines", line: { width: 6 }, name: "r(t)" }], plotLayout("3D Parametric Curve", true), { responsive: true });
  setStatus("Graphed the 3D parametric curve.");
}

function graphVector3D() {
  const p = compileExpression(getValue("p"));
  const q = compileExpression(getValue("q"));
  const r = compileExpression(getValue("r"));
  const density = Math.max(4, Math.min(10, getNumber("vectorDensity")));
  const xs = range(getNumber("xMin"), getNumber("xMax"), density);
  const ys = range(getNumber("yMin"), getNumber("yMax"), density);
  const zs = range(-5, 5, density);

  const x = [];
  const y = [];
  const z = [];
  const u = [];
  const v = [];
  const w = [];

  for (const xVal of xs) {
    for (const yVal of ys) {
      for (const zVal of zs) {
        const pVal = safeEval(p, { x: xVal, y: yVal, z: zVal });
        const qVal = safeEval(q, { x: xVal, y: yVal, z: zVal });
        const rVal = safeEval(r, { x: xVal, y: yVal, z: zVal });
        if (pVal === null || qVal === null || rVal === null) continue;
        x.push(xVal); y.push(yVal); z.push(zVal);
        u.push(pVal); v.push(qVal); w.push(rVal);
      }
    }
  }

  Plotly.newPlot(graph, [{
    x, y, z, u, v, w,
    type: "cone",
    sizemode: "absolute",
    sizeref: 0.45,
    anchor: "tail",
    name: "F(x,y,z)"
  }], plotLayout("3D Vector Field", true), { responsive: true });

  setStatus("Graphed the 3D vector field using cones. z-range is fixed from -5 to 5 in this template.");
}

function graphSelectedMode() {
  try {
    const mode = modeSelect.value;
    if (mode === "cartesian2d") graphCartesian2D();
    if (mode === "parametric2d") graphParametric2D();
    if (mode === "polar2d") graphPolar2D();
    if (mode === "derivative2d") graphDerivative2D();
    if (mode === "integral2d") graphIntegral2D();
    if (mode === "vector2d") graphVector2D();
    if (mode === "ode2d") graphOde2D();
    if (mode === "surface3d") graphSurface3D();
    if (mode === "parametric3d") graphParametric3D();
    if (mode === "vector3d") graphVector3D();
  } catch (error) {
    setStatus(error.message, true);
    console.error(error);
  }
}

function resetDefaults() {
  document.getElementById("xMin").value = -10;
  document.getElementById("xMax").value = 10;
  document.getElementById("yMin").value = -10;
  document.getElementById("yMax").value = 10;
  document.getElementById("tMin").value = 0;
  document.getElementById("tMax").value = 6.283185307;
  document.getElementById("resolution").value = 120;
  document.getElementById("vectorDensity").value = 14;
  document.getElementById("x0").value = 0;
  document.getElementById("y0").value = 1;
  document.getElementById("odeStep").value = 0.05;
  renderExpressionFields();
  graphSelectedMode();
}

function parseArrayInput(inputId = "arrayInput") {
  const raw = document.getElementById(inputId).value;
  const values = raw.split(/[,\s]+/).map((item) => Number(item.trim())).filter((value) => Number.isFinite(value));
  if (values.length < 1) throw new Error("Enter at least one numeric array value.");
  if (values.length > 60) throw new Error("Use 60 or fewer values for readable animation.");
  return values;
}

function addTrace(message) {
  const item = document.createElement("li");
  item.textContent = message;
  traceLog.prepend(item);
}

function clearTrace() {
  traceLog.innerHTML = "";
}

function makeStep(array, message, options = {}) {
  return {
    array: [...array],
    message,
    active: options.active ?? [],
    compare: options.compare ?? [],
    swap: options.swap ?? [],
    sorted: options.sorted ?? [],
    pivot: options.pivot ?? [],
    range: options.range ?? [],
    eliminated: options.eliminated ?? [],
    found: options.found ?? []
  };
}

function renderBars(array, step = {}) {
  const values = array.length ? array : [0];
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);
  const minValue = Math.min(...values);
  const hasNegative = minValue < 0;
  algorithmStage.innerHTML = "";

  const bars = document.createElement("div");
  bars.className = "bars";

  values.forEach((value, index) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";
    if (step.active?.includes(index) || step.range?.includes(index)) wrap.classList.add("active");
    if (step.compare?.includes(index)) wrap.classList.add("compare");
    if (step.swap?.includes(index)) wrap.classList.add("swap");
    if (step.sorted?.includes(index)) wrap.classList.add("sorted");
    if (step.pivot?.includes(index)) wrap.classList.add("pivot");
    if (step.eliminated?.includes(index)) wrap.classList.add("eliminated");
    if (step.found?.includes(index)) wrap.classList.add("found");

    const bar = document.createElement("div");
    bar.className = "bar";
    const normalized = Math.abs(value) / maxAbs;
    bar.style.height = `${Math.max(8, normalized * 330)}px`;
    if (hasNegative && value < 0) bar.style.opacity = "0.58";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = value;

    wrap.append(bar, label);
    bars.appendChild(wrap);
  });

  algorithmStage.appendChild(bars);
  if (step.message) setAlgorithmStatus(step.message);
}

function renderComplexity(key) {
  const items = complexityInfo[key] ?? [];
  const row = document.createElement("div");
  row.className = "complexity-row";
  for (const item of items) {
    const pill = document.createElement("div");
    pill.className = "complexity-pill";
    const [label, value] = item.split(" ");
    pill.innerHTML = `<strong>${label}</strong><span>${item.replace(label, "").trim()}</span>`;
    row.appendChild(pill);
  }
  algorithmStage.appendChild(row);
}

function bubbleSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting bubble sort.")];
  let swapped = false;
  for (let i = 0; i < a.length - 1; i += 1) {
    swapped = false;
    for (let j = 0; j < a.length - i - 1; j += 1) {
      steps.push(makeStep(a, `Compare A[${j}] and A[${j + 1}].`, { compare: [j, j + 1], sorted: indexRange(a.length - i, a.length - 1) }));
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        steps.push(makeStep(a, `Swap positions ${j} and ${j + 1}.`, { swap: [j, j + 1] }));
      }
    }
    steps.push(makeStep(a, `Pass ${i + 1} complete. Largest remaining value moved into place.`, { sorted: indexRange(a.length - i - 1, a.length - 1) }));
    if (!swapped) break;
  }
  steps.push(makeStep(a, "Bubble sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function selectionSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting selection sort.")];
  for (let i = 0; i < a.length; i += 1) {
    let min = i;
    steps.push(makeStep(a, `Assume A[${i}] is the minimum.`, { active: [i], sorted: indexRange(0, i - 1) }));
    for (let j = i + 1; j < a.length; j += 1) {
      steps.push(makeStep(a, `Compare current minimum A[${min}] with A[${j}].`, { compare: [min, j], sorted: indexRange(0, i - 1) }));
      if (a[j] < a[min]) {
        min = j;
        steps.push(makeStep(a, `New minimum found at index ${min}.`, { active: [min], sorted: indexRange(0, i - 1) }));
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push(makeStep(a, `Swap A[${i}] with the minimum at A[${min}].`, { swap: [i, min] }));
    }
    steps.push(makeStep(a, `Index ${i} is now sorted.`, { sorted: indexRange(0, i) }));
  }
  steps.push(makeStep(a, "Selection sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function insertionSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting insertion sort.", { sorted: [0] })];
  for (let i = 1; i < a.length; i += 1) {
    const key = a[i];
    let j = i - 1;
    steps.push(makeStep(a, `Select key ${key} at index ${i}.`, { active: [i], sorted: indexRange(0, i - 1) }));
    while (j >= 0 && a[j] > key) {
      steps.push(makeStep(a, `A[${j}] is greater than key ${key}; shift it right.`, { compare: [j, j + 1] }));
      a[j + 1] = a[j];
      steps.push(makeStep(a, `Shifted value from index ${j} to index ${j + 1}.`, { swap: [j, j + 1] }));
      j -= 1;
    }
    a[j + 1] = key;
    steps.push(makeStep(a, `Insert key ${key} at index ${j + 1}.`, { swap: [j + 1], sorted: indexRange(0, i) }));
  }
  steps.push(makeStep(a, "Insertion sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function mergeSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting merge sort.")];

  function merge(left, mid, right) {
    const leftPart = a.slice(left, mid + 1);
    const rightPart = a.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;
    steps.push(makeStep(a, `Merge ranges [${left}, ${mid}] and [${mid + 1}, ${right}].`, { range: indexRange(left, right) }));
    while (i < leftPart.length && j < rightPart.length) {
      steps.push(makeStep(a, `Compare ${leftPart[i]} and ${rightPart[j]}.`, { compare: [left + i, mid + 1 + j] }));
      if (leftPart[i] <= rightPart[j]) {
        a[k] = leftPart[i];
        i += 1;
      } else {
        a[k] = rightPart[j];
        j += 1;
      }
      steps.push(makeStep(a, `Write merged value at index ${k}.`, { swap: [k], range: indexRange(left, right) }));
      k += 1;
    }
    while (i < leftPart.length) {
      a[k] = leftPart[i];
      steps.push(makeStep(a, `Copy remaining left value into index ${k}.`, { swap: [k] }));
      i += 1;
      k += 1;
    }
    while (j < rightPart.length) {
      a[k] = rightPart[j];
      steps.push(makeStep(a, `Copy remaining right value into index ${k}.`, { swap: [k] }));
      j += 1;
      k += 1;
    }
  }

  function sort(left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, a.length - 1);
  steps.push(makeStep(a, "Merge sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function quickSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting quick sort.")];

  function partition(low, high) {
    const pivot = a[high];
    let i = low - 1;
    steps.push(makeStep(a, `Choose pivot ${pivot} at index ${high}.`, { pivot: [high], range: indexRange(low, high) }));
    for (let j = low; j < high; j += 1) {
      steps.push(makeStep(a, `Compare A[${j}] with pivot ${pivot}.`, { compare: [j, high], pivot: [high] }));
      if (a[j] <= pivot) {
        i += 1;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push(makeStep(a, `Move A[${j}] into the less-than-pivot region.`, { swap: [i, j], pivot: [high] }));
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push(makeStep(a, `Place pivot in final position ${i + 1}.`, { swap: [i + 1, high], sorted: [i + 1] }));
    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pivotIndex = partition(low, high);
      sort(low, pivotIndex - 1);
      sort(pivotIndex + 1, high);
    }
  }

  sort(0, a.length - 1);
  steps.push(makeStep(a, "Quick sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function heapSteps(input) {
  const a = [...input];
  const steps = [makeStep(a, "Starting heap sort.")];

  function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      steps.push(makeStep(a, `Compare parent A[${i}] with left child A[${left}].`, { compare: [i, left] }));
      if (a[left] > a[largest]) largest = left;
    }
    if (right < n) {
      steps.push(makeStep(a, `Compare current largest with right child A[${right}].`, { compare: [largest, right] }));
      if (a[right] > a[largest]) largest = right;
    }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push(makeStep(a, `Swap A[${i}] with A[${largest}] to restore heap order.`, { swap: [i, largest] }));
      heapify(n, largest);
    }
  }

  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i -= 1) {
    heapify(a.length, i);
  }
  steps.push(makeStep(a, "Max heap built. The largest value is at the root.", { active: [0] }));

  for (let end = a.length - 1; end > 0; end -= 1) {
    [a[0], a[end]] = [a[end], a[0]];
    steps.push(makeStep(a, `Move max value into final position ${end}.`, { swap: [0, end], sorted: indexRange(end, a.length - 1) }));
    heapify(end, 0);
  }

  steps.push(makeStep(a, "Heap sort complete.", { sorted: a.map((_, index) => index) }));
  return steps;
}

function getSortSteps(algorithm, array) {
  if (algorithm === "bubble") return bubbleSteps(array);
  if (algorithm === "selection") return selectionSteps(array);
  if (algorithm === "insertion") return insertionSteps(array);
  if (algorithm === "merge") return mergeSteps(array);
  if (algorithm === "quick") return quickSteps(array);
  if (algorithm === "heap") return heapSteps(array);
  return bubbleSteps(array);
}

function linearSearchSteps(array, target) {
  const steps = [makeStep(array, `Starting linear search for ${target}.`)];
  for (let i = 0; i < array.length; i += 1) {
    steps.push(makeStep(array, `Check index ${i}.`, { compare: [i], eliminated: indexRange(0, i - 1) }));
    if (array[i] === target) {
      steps.push(makeStep(array, `Found ${target} at index ${i}.`, { found: [i] }));
      return steps;
    }
  }
  steps.push(makeStep(array, `${target} was not found.`, { eliminated: array.map((_, index) => index) }));
  return steps;
}

function binarySearchSteps(input, target) {
  const array = [...input].sort((a, b) => a - b);
  const steps = [makeStep(array, `Binary search uses sorted data. Searching for ${target}.`)];
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const eliminated = array.map((_, index) => index).filter((index) => index < low || index > high);
    steps.push(makeStep(array, `low=${low}, high=${high}, mid=${mid}. Compare A[${mid}] with ${target}.`, { compare: [mid], range: indexRange(low, high), eliminated }));
    if (array[mid] === target) {
      steps.push(makeStep(array, `Found ${target} at sorted index ${mid}.`, { found: [mid] }));
      return steps;
    }
    if (array[mid] < target) {
      low = mid + 1;
      steps.push(makeStep(array, `${array[mid]} is too small, discard the left half.`, { eliminated: array.map((_, index) => index).filter((index) => index < low || index > high) }));
    } else {
      high = mid - 1;
      steps.push(makeStep(array, `${array[mid]} is too large, discard the right half.`, { eliminated: array.map((_, index) => index).filter((index) => index < low || index > high) }));
    }
  }

  steps.push(makeStep(array, `${target} was not found.`, { eliminated: array.map((_, index) => index) }));
  return steps;
}

function jumpSearchSteps(input, target) {
  const array = [...input].sort((a, b) => a - b);
  const steps = [makeStep(array, `Jump search uses sorted data. Searching for ${target}.`)];
  const n = array.length;
  const jump = Math.max(1, Math.floor(Math.sqrt(n)));
  let previous = 0;
  let current = jump;

  while (previous < n && array[Math.min(current, n) - 1] < target) {
    const blockEnd = Math.min(current, n) - 1;
    steps.push(makeStep(array, `Block ending at index ${blockEnd} is too small; jump forward.`, { compare: [blockEnd], eliminated: indexRange(previous, blockEnd) }));
    previous = current;
    current += jump;
  }

  const end = Math.min(current, n);
  steps.push(makeStep(array, `Linear scan from index ${previous} to ${end - 1}.`, { range: indexRange(previous, end - 1) }));
  for (let i = previous; i < end; i += 1) {
    steps.push(makeStep(array, `Check index ${i}.`, { compare: [i] }));
    if (array[i] === target) {
      steps.push(makeStep(array, `Found ${target} at sorted index ${i}.`, { found: [i] }));
      return steps;
    }
  }

  steps.push(makeStep(array, `${target} was not found.`, { eliminated: array.map((_, index) => index) }));
  return steps;
}

function getSearchSteps(algorithm, array, target) {
  if (algorithm === "linear") return linearSearchSteps(array, target);
  if (algorithm === "binary") return binarySearchSteps(array, target);
  if (algorithm === "jump") return jumpSearchSteps(array, target);
  return linearSearchSteps(array, target);
}

function updatePseudocode() {
  const category = algorithmCategory.value;
  let key = "bubble";
  if (category === "sorting") key = document.getElementById("sortAlgorithm").value;
  if (category === "searching") key = document.getElementById("searchAlgorithm").value;
  if (category === "hashing") key = "hashing";
  pseudocodeBlock.textContent = pseudocode[key];
}

function renderCurrentAlgorithmInitial() {
  try {
    clearTrace();
    updatePseudocode();
    const category = algorithmCategory.value;
    if (category === "sorting") {
      const array = parseArrayInput("arrayInput");
      const algorithm = document.getElementById("sortAlgorithm").value;
      renderBars(array, { message: "Sorting array loaded. Press Run or Step." });
      renderComplexity(algorithm);
    } else if (category === "searching") {
      const array = parseArrayInput("searchArrayInput");
      const algorithm = document.getElementById("searchAlgorithm").value;
      const displayArray = algorithm === "linear" ? array : [...array].sort((a, b) => a - b);
      renderBars(displayArray, { message: algorithm === "linear" ? "Search array loaded." : "Search array loaded and displayed in sorted order." });
      renderComplexity(algorithm);
    } else {
      initializeHashTable(false);
      renderHashTable();
    }
  } catch (error) {
    setAlgorithmStatus(error.message, true);
  }
}

function setAlgorithmCategory() {
  const category = algorithmCategory.value;
  sortingControls.classList.toggle("hidden", category !== "sorting");
  searchingControls.classList.toggle("hidden", category !== "searching");
  hashingControls.classList.toggle("hidden", category !== "hashing");
  hashActionButtons.classList.toggle("hidden", category !== "hashing");
  runAlgorithmButton.classList.toggle("hidden", category === "hashing");
  stepAlgorithmButton.classList.toggle("hidden", category === "hashing");
  generateArrayButton.classList.toggle("hidden", category === "hashing");
  algorithmTitle.textContent = {
    sorting: "Sorting Algorithm Visualizer",
    searching: "Searching Algorithm Visualizer",
    hashing: "Hash Table Visualizer"
  }[category];
  currentSteps = [];
  currentStepIndex = 0;
  renderCurrentAlgorithmInitial();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAnimationSpeed() {
  const category = algorithmCategory.value;
  const raw = category === "searching" ? document.getElementById("searchSpeed").value : document.getElementById("animationSpeed").value;
  return Number(raw);
}

function createStepsForCurrentAlgorithm() {
  const category = algorithmCategory.value;
  if (category === "sorting") {
    const array = parseArrayInput("arrayInput");
    const algorithm = document.getElementById("sortAlgorithm").value;
    return getSortSteps(algorithm, array);
  }
  if (category === "searching") {
    const array = parseArrayInput("searchArrayInput");
    const target = Number(document.getElementById("searchTarget").value);
    if (!Number.isFinite(target)) throw new Error("Search target must be numeric.");
    const algorithm = document.getElementById("searchAlgorithm").value;
    return getSearchSteps(algorithm, array, target);
  }
  return [];
}

function showStep(step) {
  renderBars(step.array, step);
  addTrace(step.message);
}

function stepAlgorithm() {
  try {
    if (algorithmCategory.value === "hashing") return;
    if (!currentSteps.length || currentStepIndex >= currentSteps.length) {
      currentSteps = createStepsForCurrentAlgorithm();
      currentStepIndex = 0;
      clearTrace();
    }
    const step = currentSteps[currentStepIndex];
    showStep(step);
    currentStepIndex += 1;
    const algorithm = algorithmCategory.value === "sorting" ? document.getElementById("sortAlgorithm").value : document.getElementById("searchAlgorithm").value;
    if (currentStepIndex >= currentSteps.length) renderComplexity(algorithm);
  } catch (error) {
    setAlgorithmStatus(error.message, true);
  }
}

async function runAlgorithm() {
  if (isAnimating || algorithmCategory.value === "hashing") return;
  try {
    isAnimating = true;
    runAlgorithmButton.disabled = true;
    stepAlgorithmButton.disabled = true;
    clearTrace();
    currentSteps = createStepsForCurrentAlgorithm();
    currentStepIndex = 0;
    const maxRenderedSteps = 520;
    const stride = currentSteps.length > maxRenderedSteps ? Math.ceil(currentSteps.length / maxRenderedSteps) : 1;

    for (let i = 0; i < currentSteps.length; i += stride) {
      showStep(currentSteps[i]);
      currentStepIndex = i + 1;
      await delay(getAnimationSpeed());
    }

    const finalStep = currentSteps[currentSteps.length - 1];
    showStep(finalStep);
    currentStepIndex = currentSteps.length;
    const algorithm = algorithmCategory.value === "sorting" ? document.getElementById("sortAlgorithm").value : document.getElementById("searchAlgorithm").value;
    renderComplexity(algorithm);
  } catch (error) {
    setAlgorithmStatus(error.message, true);
  } finally {
    isAnimating = false;
    runAlgorithmButton.disabled = false;
    stepAlgorithmButton.disabled = false;
  }
}

function generateRandomArray() {
  const size = Math.max(5, Math.min(36, Number(document.getElementById("arraySize").value) || 16));
  const array = Array.from({ length: size }, () => Math.floor(Math.random() * 96) + 4);
  document.getElementById("arrayInput").value = array.join(", ");
  document.getElementById("searchArrayInput").value = [...array].sort((a, b) => a - b).join(", ");
  currentSteps = [];
  currentStepIndex = 0;
  renderCurrentAlgorithmInitial();
}

function hashString(key, size) {
  let total = 0;
  for (let i = 0; i < key.length; i += 1) {
    total = (total * 31 + key.charCodeAt(i)) % size;
  }
  return total;
}

function initializeHashTable(force = true) {
  const size = Math.max(5, Math.min(23, Number(document.getElementById("hashTableSize").value) || 11));
  const strategy = document.getElementById("hashStrategy").value;
  if (force || hashTable.length !== size || !hashTable.length) {
    hashTable = Array.from({ length: size }, () => strategy === "chaining" ? [] : null);
    lastHashProbes = [];
  }
}

function renderHashTable(message = "Hash table ready.") {
  const strategy = document.getElementById("hashStrategy").value;
  algorithmStage.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "hash-grid";

  hashTable.forEach((slot, index) => {
    const cell = document.createElement("div");
    cell.className = "hash-slot";
    if (lastHashProbes.includes(index)) cell.classList.add("active");

    const indexBadge = document.createElement("span");
    indexBadge.className = "hash-index";
    indexBadge.textContent = index;
    cell.appendChild(indexBadge);

    if (strategy === "chaining") {
      if (!slot.length) {
        const empty = document.createElement("div");
        empty.className = "hash-empty";
        empty.textContent = "empty bucket";
        cell.appendChild(empty);
      } else {
        slot.forEach((entry) => {
          const item = document.createElement("div");
          item.className = "hash-item";
          item.textContent = `${entry.key}: ${entry.value}`;
          cell.appendChild(item);
        });
      }
    } else if (!slot || slot.deleted) {
      const empty = document.createElement("div");
      empty.className = "hash-empty";
      empty.textContent = slot?.deleted ? "deleted marker" : "empty slot";
      cell.appendChild(empty);
    } else {
      const item = document.createElement("div");
      item.className = "hash-item";
      item.textContent = `${slot.key}: ${slot.value}`;
      cell.appendChild(item);
    }

    grid.appendChild(cell);
  });

  algorithmStage.appendChild(grid);
  renderComplexity("hashing");
  setAlgorithmStatus(message);
}

function probeIndex(base, attempt, size, strategy) {
  if (strategy === "linear") return (base + attempt) % size;
  if (strategy === "quadratic") return (base + attempt * attempt) % size;
  return base;
}

function hashInsert() {
  initializeHashTable(false);
  const strategy = document.getElementById("hashStrategy").value;
  const key = document.getElementById("hashKey").value.trim();
  const value = document.getElementById("hashValue").value.trim();
  if (!key) {
    setAlgorithmStatus("Enter a key before inserting.", true);
    return;
  }
  const size = hashTable.length;
  const base = hashString(key, size);
  lastHashProbes = [];

  if (strategy === "chaining") {
    lastHashProbes.push(base);
    const existing = hashTable[base].find((entry) => entry.key === key);
    if (existing) existing.value = value;
    else hashTable[base].push({ key, value });
    addTrace(`hash("${key}") = ${base}; ${existing ? "updated existing key" : "inserted into chain"}.`);
    renderHashTable(`Inserted ${key} using separate chaining at bucket ${base}.`);
    return;
  }

  for (let attempt = 0; attempt < size; attempt += 1) {
    const index = probeIndex(base, attempt, size, strategy);
    lastHashProbes.push(index);
    const slot = hashTable[index];
    if (!slot || slot.deleted || slot.key === key) {
      hashTable[index] = { key, value };
      addTrace(`hash("${key}") = ${base}; probe ${attempt} placed key at index ${index}.`);
      renderHashTable(`Inserted ${key} at index ${index} after ${attempt + 1} probe(s).`);
      return;
    }
    addTrace(`Collision at index ${index}; probing again.`);
  }

  renderHashTable("Hash table is full. Could not insert key.");
}

function hashFind() {
  initializeHashTable(false);
  const strategy = document.getElementById("hashStrategy").value;
  const key = document.getElementById("hashKey").value.trim();
  if (!key) {
    setAlgorithmStatus("Enter a key before searching.", true);
    return;
  }
  const size = hashTable.length;
  const base = hashString(key, size);
  lastHashProbes = [];

  if (strategy === "chaining") {
    lastHashProbes.push(base);
    const found = hashTable[base].find((entry) => entry.key === key);
    addTrace(`hash("${key}") = ${base}; scanned chain at bucket ${base}.`);
    renderHashTable(found ? `Found ${key}: ${found.value}.` : `${key} was not found.`);
    return;
  }

  for (let attempt = 0; attempt < size; attempt += 1) {
    const index = probeIndex(base, attempt, size, strategy);
    lastHashProbes.push(index);
    const slot = hashTable[index];
    if (!slot) {
      addTrace(`Probe ${attempt}: index ${index} is empty, so the key is not present.`);
      renderHashTable(`${key} was not found.`);
      return;
    }
    if (!slot.deleted && slot.key === key) {
      addTrace(`Probe ${attempt}: found ${key} at index ${index}.`);
      renderHashTable(`Found ${key}: ${slot.value}.`);
      return;
    }
    addTrace(`Probe ${attempt}: checked index ${index}.`);
  }

  renderHashTable(`${key} was not found after probing the table.`);
}

function hashDelete() {
  initializeHashTable(false);
  const strategy = document.getElementById("hashStrategy").value;
  const key = document.getElementById("hashKey").value.trim();
  if (!key) {
    setAlgorithmStatus("Enter a key before deleting.", true);
    return;
  }
  const size = hashTable.length;
  const base = hashString(key, size);
  lastHashProbes = [];

  if (strategy === "chaining") {
    lastHashProbes.push(base);
    const originalLength = hashTable[base].length;
    hashTable[base] = hashTable[base].filter((entry) => entry.key !== key);
    const removed = hashTable[base].length !== originalLength;
    addTrace(`hash("${key}") = ${base}; ${removed ? "removed from chain" : "key not found"}.`);
    renderHashTable(removed ? `Deleted ${key}.` : `${key} was not found.`);
    return;
  }

  for (let attempt = 0; attempt < size; attempt += 1) {
    const index = probeIndex(base, attempt, size, strategy);
    lastHashProbes.push(index);
    const slot = hashTable[index];
    if (!slot) {
      renderHashTable(`${key} was not found.`);
      return;
    }
    if (!slot.deleted && slot.key === key) {
      hashTable[index] = { deleted: true };
      addTrace(`Probe ${attempt}: replaced ${key} with a deleted marker at index ${index}.`);
      renderHashTable(`Deleted ${key}.`);
      return;
    }
  }

  renderHashTable(`${key} was not found after probing the table.`);
}

function resetHashTable() {
  initializeHashTable(true);
  clearTrace();
  renderHashTable("Hash table cleared.");
}

function switchAppMode(mode) {
  const showMath = mode === "math";
  mathControls.classList.toggle("hidden", !showMath);
  mathWorkspace.classList.toggle("hidden", !showMath);
  algorithmControls.classList.toggle("hidden", showMath);
  algorithmWorkspace.classList.toggle("hidden", showMath);
  mathModeButton.classList.toggle("active", showMath);
  algorithmModeButton.classList.toggle("active", !showMath);
  localStorage.setItem("visualizerMode", mode);

  if (showMath) graphSelectedMode();
  else renderCurrentAlgorithmInitial();
}

modeSelect.addEventListener("change", () => {
  renderExpressionFields();
  setStatus("Mode changed. Enter an expression and press Graph.");
});

graphButton.addEventListener("click", graphSelectedMode);
resetButton.addEventListener("click", resetDefaults);

themeToggle.addEventListener("click", () => {
  const nextTheme = currentThemeIsDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("mathGrapherTheme", nextTheme);
  if (mathWorkspace.classList.contains("hidden")) renderCurrentAlgorithmInitial();
  else graphSelectedMode();
});

mathModeButton.addEventListener("click", () => switchAppMode("math"));
algorithmModeButton.addEventListener("click", () => switchAppMode("algorithm"));
algorithmCategory.addEventListener("change", setAlgorithmCategory);
document.getElementById("sortAlgorithm").addEventListener("change", renderCurrentAlgorithmInitial);
document.getElementById("searchAlgorithm").addEventListener("change", renderCurrentAlgorithmInitial);
document.getElementById("hashStrategy").addEventListener("change", resetHashTable);
document.getElementById("hashTableSize").addEventListener("change", resetHashTable);
runAlgorithmButton.addEventListener("click", runAlgorithm);
stepAlgorithmButton.addEventListener("click", stepAlgorithm);
generateArrayButton.addEventListener("click", generateRandomArray);
resetAlgorithmButton.addEventListener("click", renderCurrentAlgorithmInitial);
hashInsertButton.addEventListener("click", hashInsert);
hashFindButton.addEventListener("click", hashFind);
hashDeleteButton.addEventListener("click", hashDelete);
hashResetButton.addEventListener("click", resetHashTable);

document.querySelectorAll(".example").forEach((button) => {
  button.addEventListener("click", () => {
    switchAppMode("math");
    modeSelect.value = button.dataset.mode;
    renderExpressionFields();
    for (const [key, value] of Object.entries(button.dataset)) {
      const target = document.getElementById(key);
      if (target && key !== "mode") target.value = value;
    }
    graphSelectedMode();
  });
});

document.querySelectorAll(".algorithm-example").forEach((button) => {
  button.addEventListener("click", () => {
    switchAppMode("algorithm");
    algorithmCategory.value = button.dataset.category;
    setAlgorithmCategory();
    if (button.dataset.sort) document.getElementById("sortAlgorithm").value = button.dataset.sort;
    if (button.dataset.search) document.getElementById("searchAlgorithm").value = button.dataset.search;
    if (button.dataset.strategy) document.getElementById("hashStrategy").value = button.dataset.strategy;
    if (button.dataset.array) {
      document.getElementById("arrayInput").value = button.dataset.array;
      document.getElementById("searchArrayInput").value = button.dataset.array;
    }
    if (button.dataset.target) document.getElementById("searchTarget").value = button.dataset.target;
    renderCurrentAlgorithmInitial();
  });
});

const savedTheme = localStorage.getItem("mathGrapherTheme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

renderExpressionFields();
setAlgorithmCategory();
const savedMode = localStorage.getItem("visualizerMode") || "math";
switchAppMode(savedMode);
