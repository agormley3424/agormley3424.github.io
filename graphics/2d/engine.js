function main () {

  ///// Retrieve DOM Elements /////

  const canvas = document.getElementById("canid");
  const clearbutton = document.getElementById("clearbutton");
  const context = getWebGLContext(canvas);
  const redslider = document.getElementById("redslide");
  const greenslider = document.getElementById("greenslide");
  const blueslider = document.getElementById("blueslide");
  const trianglebutton = document.getElementById("trianglebutton");
  const segmentSlider = document.getElementById("segmentslide");
  const squarebutton = document.getElementById("squarebutton");
  const circlebutton = document.getElementById("circlebutton");
  const sizeSlider = document.getElementById("sizeslide");
  const alphaSlider = document.getElementById("alphaslide");
  const drawMode = document.getElementById("drawmode");
  const shapeColor = document.getElementById("shapecolor");
  const subAlpha = document.getElementById("subbutton");
  const invButton = document.getElementById("inversebutton");
  const alphaModeButton = document.getElementById("alphamodebutton");
  
  ///// Define Shaders /////
  const vShader =
        'attribute vec4 pos;' +
        'attribute float size;'+
        'attribute vec4 a_color;'+
        'varying vec4 v_color;'+
        'void main() {' +
        '  gl_Position = pos;' +
        '  gl_PointSize = size;'+
        '  v_color = a_color;'+
        '}';
  const fShader =
        'precision mediump float;'+
        'varying vec4 v_color;' +
        'void main() {' +
        '  gl_FragColor = v_color;'+
        '}';
  
  ///// Define Global Variables /////
  
  let shape = "Square";
  let size = sizeSlider.value;
  let red = redslider.value;
  let green = greenslider.value;
  let blue = blueslider.value;
  let segments = segmentSlider.value;
  let mousedown = false;
  let alpha = alphaSlider.value;

  ///// Define Vertex Attribute Arrays /////
  
  let pointPos = [];
  let pointCol = [];
  let pointSize = [];
  
  let triPos = [];
  let triCol = [];
  
  let circPos = [];
  let circCol = [];
  let circSize = [];
  
  ///// Ready webpage and load hypervariables /////

  context.clearColor(0.0, 0.0, 0.0, 1.0);
  context.clear(context.COLOR_BUFFER_BIT);
  createShaderProgram(context, vShader, fShader);
  
  context.enable(context.BLEND);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
  
  ///// Initialize buffers /////

  let pointPosBuffer = context.createBuffer();
  let pointColBuffer = context.createBuffer();
  let pointSizeBuffer = context.createBuffer();
  
  let triPosBuffer = context.createBuffer();
  let triColBuffer = context.createBuffer();
  
  let circPosBuffer = context.createBuffer();
  let circColBuffer = context.createBuffer();

  ///// Declare functions /////

  // Converts from HTML DOM coordinates to OpenGL
  function convertCoords (element, domX, domY) {
    const rect = element.getBoundingClientRect();

    // DOM to local element coordinates
    const elX = domX - rect.left;
    const elY = domY - rect.top;

    // Local element to OpenGL coordinates
    const openX = elX - rect.width / 2;
    const openY = rect.height / 2 - elY;
    
    // Scale OpenGL coordinates
    const scaledX = openX / (rect.width / 2);
    const scaledY = openY / (rect.width / 2);
    
    return [scaledX, scaledY];
  }
  
  // Assigns buffer to an attribute variable
  function assignBuffer (varString, buffer, size) {
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.vertexAttribPointer(context.getAttribLocation(context.program, varString), size, context.FLOAT, false, 0, 0);
    context.enableVertexAttribArray(context.getAttribLocation(context.program, varString));
  }

  // Assigns buffer to an attribute variable
  function unAssignBuffer (varString) {
    context.disableVertexAttribArray(context.getAttribLocation(context.program, varString));
  }
  
  // Copies an array of data to a buffer
  function loadBuffer (buffer, data) {
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);
  }

  // Add a new vertex to the point arrays
  function addPoint(center) {
    center = convertCoords(canvas, center[0], center[1]);
    
    pointPos.push(center[0], center[1]);
    pointCol.push(red, green, blue, alpha);
    pointSize.push(size*1.5);
  }
  
  // Draw all points currently stored
  function drawPoints() {
    loadBuffer(pointPosBuffer, pointPos);
    loadBuffer(pointColBuffer, pointCol);
    loadBuffer(pointSizeBuffer, pointSize);

    assignBuffer('pos', pointPosBuffer, 2);
    assignBuffer('a_color', pointColBuffer, 4);
    assignBuffer('size', pointSizeBuffer, 1);
    
    context.drawArrays(shape, 0, pointPos.length/2);
    
    unAssignBuffer('pos');
    unAssignBuffer('a_color');
    unAssignBuffer('size');
  }
  
  // Add three new vertices to the triangle arrays
  function addTriangle(center) {
    const x = Math.sin(Math.PI / 3) * size;
    const y = Math.cos(Math.PI / 3) * size;

    const v1 = [center[0], center[1] - size];
    const v2 = [center[0] + x, center[1] + y];
    const v3 = [center[0] - x, center[1] + y];
    
    const vertices = [v1, v2, v3];
    
    for (let v = 0; v < vertices.length; v++) {
      const openCoords = convertCoords(canvas, vertices[v][0], vertices[v][1]);
      triPos.push(openCoords[0], openCoords[1]);
      triCol.push(red, green, blue, alpha);
    }
  }
  
  // Draw all triangles currently stored
  function drawTriangles() {
    loadBuffer(triPosBuffer, triPos);
    loadBuffer(triColBuffer, triCol);

    assignBuffer('pos', triPosBuffer, 2);
    assignBuffer('a_color', triColBuffer, 4);
    context.drawArrays(context.TRIANGLES, 0, triPos.length / 2);

    unAssignBuffer('pos');
    unAssignBuffer('a_color');
  }
  
  // Add a circle to the circle vertex arrays
  function addCircle(center) {
    if (parseFloat(segments) === 1) {
      const x = Math.sin(Math.PI / 3) * parseFloat(size);
      const y = Math.cos(Math.PI / 3) * parseFloat(size);

      const prev1 = [center[0], center[1] - parseFloat(size)];
      const prev2 = [center[0] + x, center[1] + y];
      const prev3 = [center[0] - x, center[1] + y];
      
      const v1 = convertCoords(canvas, prev1[0], prev1[0]);
      const v2 = convertCoords(canvas, prev2[0], prev2[0]);
      const v3 = convertCoords(canvas, prev3[0], prev3[0]);
      
      addCircTriangle (v1, v2, v3);
    }
    else if (parseFloat(segments) === 2) {
      // Draw square
    } else {
      // Add vertex at center of unit circle
      const v1 = convertCoords(canvas, center[0], center[1]);
      
      // Add a vertex to the right on the unit circle
      const prev2 = [center[0] + parseFloat(size), center[1]];
      const v2 = convertCoords(canvas, prev2[0], prev2[1]);

      const prev3 = [center[0] + Math.cos(2*Math.PI/segments) * size, center[1] + Math.sin(2*Math.PI/segments) * size];
      const v3 = convertCoords(canvas, prev3[0], prev3[1]);
      
      addCircTriangle(v1, v2, v3);
      
      let lastVert = v3;
      for (let i = 2; i <= segments; i++) {
        const preNewVert = [center[0] + Math.cos(2*i*Math.PI/segments) * size, center[1] + Math.sin(2*i*Math.PI/segments) * size];
        const newVert = convertCoords(canvas, preNewVert[0], preNewVert[1]);
        
        addCircTriangle(v1, lastVert, newVert);
        lastVert = newVert;
      }
    }
  }
  
  // Add a manually defined triangle to the circle vertex arrays
  function addCircTriangle (v1, v2, v3) {
    circPos.push(v1[0], v1[1], v2[0], v2[1], v3[0], v3[1]);
    for (let i = 0; i < 3; i++) {
      circCol.push(red, green, blue, alpha);
    }
  }
  
  // Draw all stored circles
  function drawCircles() {
    if (parseFloat(segments) === 1) {
      drawTriangles();
    }
    loadBuffer(circPosBuffer, circPos);
    loadBuffer(circColBuffer, circCol);

    assignBuffer('pos', circPosBuffer, 2);
    assignBuffer('a_color', circColBuffer, 4);
    context.drawArrays(context.TRIANGLES, 0, circPos.length / 2);

    unAssignBuffer('pos');
    unAssignBuffer('a_color');
  }
  
  // Draw all currently stored Triangles
  function drawTriangles() {
    loadBuffer(triPosBuffer, triPos);
    loadBuffer(triColBuffer, triCol);

    assignBuffer('pos', triPosBuffer, 2);
    assignBuffer('a_color', triColBuffer, 4);
    context.drawArrays(context.TRIANGLES, 0, triPos.length / 2);
    
    unAssignBuffer('pos');
    unAssignBuffer('a_color');
  }

  ///// Define event handlers /////

  canvas.onmousemove = function (ev) {
    if (mousedown) {
      const center = [ev.clientX, ev.clientY];
      //const openCenter = convertCoords(canvas, ev.clientX, ev.clientY);
      if (shape === "Square") {
        addPoint(center);
      } else if (shape === "Triangle") {
        addTriangle(center);
      } else if (parseFloat(segments) === 1) {
        addTriangle(center);
      } else if (parseFloat(segments) === 2) {
        addPoint(center);
      } else {
        addCircle(center);
      }
      context.clear(context.COLOR_BUFFER_BIT);
      
      drawTriangles();
      drawPoints();
      drawCircles();
    }
  }
  
  canvas.onmousedown = function (ev) {
    mousedown = true;
    canvas.onmousemove(ev);
  }
  
  canvas.onmouseup = function (ev) {
    mousedown = false;
  }
  
  canvas.onmouseout = function (ev) {
    mousedown = false;
  }
  
  redslider.onchange = function (ev) {
    red = redslider.value;
    shapeColor.innerHTML = "Shape Color (RGB): (" + parseInt(255 * red) + ", " + parseInt(255 * green) + ", " + parseInt(255 * blue) + ")";
  }
  
  greenslider.onchange = function (ev) {
    green = greenslider.value;
    shapeColor.innerHTML = "Shape Color (RGB): (" + parseInt(255 * red) + ", " + parseInt(255 * green) + ", " + parseInt(255 * blue) + ")";
  }

  blueslider.onchange = function (ev) {
    blue = blueslider.value;
    shapeColor.innerHTML = "Shape Color (RGB): (" + parseInt(255 * red) + ", " + parseInt(255 * green) + ", " + parseInt(255 * blue) + ")";
  }
  
  segmentSlider.onchange = function (ev) {
    segments = segmentSlider.value;
  }

  trianglebutton.onclick = function (ev) {
    shape = "Triangle";
    drawMode.innerHTML = "Shape Selected: Triangles";
  }
  
  squarebutton.onclick = function (ev) {
    shape = "Square";
    drawMode.innerHTML = "Shape Selected: Squares";
  }
  
  circlebutton.onclick = function (ev) {
    shape = "Circle";
    drawMode.innerHTML = "Shape Selected: Circles";
  }
  
  clearbutton.onclick = function () {
    context.clear(context.COLOR_BUFFER_BIT);
    pointPos = [];
    pointCol = [];
    pointSize = [];
    
    triPos = [];
    triCol = [];
  
    circPos = [];
    circCol = [];
  }
  
  subAlpha.onclick = function (ev) {
    context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
    alphaModeButton.innerHTML="Mode Selected: Transparency";
    context.clear(context.COLOR_BUFFER_BIT);
    drawTriangles();
    drawPoints();
    drawCircles();
  }
  
  invButton.onclick = function (ev) {
    context.blendFunc(context.SRC_COLOR, context.ONE_MINUS_SRC_COLOR);
    alphaModeButton.innerHTML="Mode Selected: Saturation";
    context.clear(context.COLOR_BUFFER_BIT);
    drawTriangles();
    drawPoints();
    drawCircles();
  }
  
  sizeSlider.onchange = function () {
    size = sizeSlider.value;
  }
  
  alphaSlider.onchange = function () {
    alpha = alphaSlider.value;
  }
}
