/* jshint esversion: 9 */
// How am i supposed to draw multiple things with different transformations and a uniform matrix without everything doing the last transformation or only one block
// rendering at a time?
// How would I transform any vector plane to the xy plane?

function main () {
  /// Retrieve DOM Elements ///

  const canvas = document.getElementById('canid');
  const context = getWebGLContext(canvas);
  const webPage = document.getElementById('page');
  const lightButton = document.getElementById('lightButton');
  const normalButton = document.getElementById('normalButton');

  /// Define Shaders ///

  const vShader =
        'attribute vec4 a_color;' +
        'attribute vec4 a_pos;' +
        'varying vec4 v_color;' +

        'void main() {' +
        '  v_color = a_color;' +
        '  gl_Position = a_pos;' +
        '}';
  const fShader =
        'precision mediump float;' +
        'precision mediump int;' +

        'varying vec4 v_color;' +
        'uniform int mode;' +

        'void main() {' +
        '  if (mode == 0) {' +
        '    gl_FragColor = v_color;' +
        '  } else if (mode == 1) {' +
        '  } else if (mode == 2) {' +
        '  } else if (mode == 3) {' +
        '  }' +
        '}';

  /// Prepare WebGL and load hypervariables ///

  context.clearColor(0.0, 0.0, 0.5, 1.0);
  context.clear(context.COLOR_BUFFER_BIT);
  context.enable(context.BLEND);
  context.enable(context.DEPTH_TEST);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

  createShaderProgram(context, vShader, fShader);

  initTexture(context.TEXTURE0, 'src/squarebricks.jpg');
  initTexture(context.TEXTURE1, 'src/grass.jpg');

  /// Define Fields ///

  let activeTextures = 0;
  const TEX_MIN = 2;
  let globalTime = 0;
  let globalSign = 1;

  /// Define Vertex Attribute Arrays ///

  let posArray = [];
  let colArray = [];
  let uvArray = [];
  let normArray = [];

  /// Instantiate buffers ///

  const posArrayBuffer = context.createBuffer();
  const colArrayBuffer = context.createBuffer();
  const uvArrayBuffer = context.createBuffer();
  const normArrayBuffer = context.createBuffer();

  assignBuffer('a_pos', posArrayBuffer, 3);
  assignBuffer('a_color', colArrayBuffer, 4);
  //assignBuffer('a_texCoord', uvArrayBuffer, 2);
  //assignBuffer('a_normals', normArrayBuffer, 3);

  /// Define Matrix Transformations ///

  worldMat = new Matrix4(); // Transforms polygons from modeling to world space
  viewMat = new Matrix4(); // Transforms polygons from world to view space
  perspMat = new Matrix4(); // Transforms polygons from view to world space

  /// Define functions ///

  // Empty the attribute data arrays
  function clearBuffers () {
    posArray = [];
    uvArray = [];
    colArray = [];
    normArray = [];
  }

  // Readies texture loading for when the resource actually loads
  function initTexture (active, imgsrc) {
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1);
    const img = new Image();
    img.onload = function () { loadTexture(active, img); };
    img.src = imgsrc;
  }

  // Assigns an image to a texture object, also assigning it to an active texture slot
  function loadTexture (active, img) {
    const tex = context.createTexture();
    context.activeTexture(active);
    context.bindTexture(context.TEXTURE_2D, tex);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, img);
    ++activeTextures;
    if (activeTextures === TEX_MIN) {
      timer();
      drawWorld();
    }
  }

  // Converts coordinates from an HTML DOM document to OpenGL
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

  // Assigns a buffer to an attribute variable
  function assignBuffer (varString, buffer, size) {
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.vertexAttribPointer(context.getAttribLocation(context.program, varString), size, context.FLOAT, false, 0, 0);
    context.enableVertexAttribArray(context.getAttribLocation(context.program, varString));
  }

  // Copies an array of data to a buffer
  function loadBuffer (buffer, data) {
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);
  }

  function addTriangle (v1, v2, v3, uv1 = [-1, -1], uv2 = [-1, -1], uv3 = [-1, -1], color = [1, 0, 0, 1]) {
    //console.log()
    posArray = posArray.concat(v1, v2, v3);
    colArray = colArray.concat(color, color, color);
    uvArray = uvArray.concat(uv1, uv2, uv3);
  }

  function addQuad (vul, vur, vlr, vll, uvul, uvur, uvlr, uvll, color) {
    addTriangle(vlr, vll, vul, uvlr, uvll, uvul, color);
    addTriangle(vul, vur, vlr, uvul, uvur, uvlr, color);
  }

  function addCuboid (width, height, depth, color) {
    // ULF corner: center - width + height + depth
    const ulf = [-1 * width / 2, height / 2, depth];
    const ulb = [-1 * width / 2, height / 2, -1 * depth / 2];
    const llf = [-1 * width / 2, -1 * height / 2, depth / 2];
    const llb = [-1 * width / 2, -1 * height / 2, -1 * depth / 2];
    const urf = [width / 2, height / 2, depth / 2];
    const urb = [width / 2, height / 2, -1 * depth / 2];
    const lrf = [width / 2, -1 * height / 2, depth / 2];
    const lrb = [width / 2, -1 * height / 2, -1 * depth / 2];

    addQuad(ulf, urf, lrf, llf); // Add front face
    addQuad(urb, ulb, llb, lrb); // Back face
    addQuad(ulb, ulf, llf, llb); // Left face
    addQuad(urf, urb, lrb, lrf); // Right face
    addQuad(lrf, llf, llb, lrb); // Bottom face
    addQuad(ulb, urb, urf, ulf); // Top face
  }

  function addCube (length, color) {
    addCuboid(length, length, length, color);
  }

  // Add a sphere of polygons centered at the origin to the posArray array
  // We're really rotating around the xz plane
  function addSphere (divisions = 18, radius = 1) {
    if (divisions % 2 !== 0) {
      throw 'addSphere Error: Odd number of divisions';
    } else if (divisions <= 0) {
      throw 'addSphere Error: Must have more than zero divisions';
    }

    const divAngle = 2 * Math.PI / divisions;

    // firstAngle is the angle of the first circle on the xz plane
    for (let firstAngle = 0; firstAngle < 2 * Math.PI; firstAngle += divAngle) { // Executes d times
      const secondAngle = firstAngle + divAngle;
      const firstCircle = [];
      const secondCircle = [];
      for (let i = -1 * Math.PI / 2, count = 0; i <= Math.PI / 2 + 0.00001; i += divAngle, ++count) { // Executes d * d times
        const firstMat = yMatrixRad(firstAngle);
        let firstVert = [Math.cos(i) * radius, Math.sin(i) * radius, 0];
        firstVert = matrixProd(firstMat, firstVert);
        firstCircle.push(firstVert);
        const secondMat = yMatrixRad(secondAngle);
        let secondVert = [Math.cos(i) * radius, Math.sin(i) * radius, 0];
        secondVert = matrixProd(secondMat, secondVert);
        secondCircle.push(secondVert);
        if (count > 0) {
          const firstVert = secondCircle[count - 1];
          const secondVert = firstCircle[count - 1];
          const thirdVert = firstCircle[count];
          const fourthVert = firstCircle[count];
          const fifthVert = secondCircle[count];
          const sixthVert = secondCircle[count - 1];

          addTriangle(firstVert, secondVert, thirdVert);
          addTriangle(fourthVert, fifthVert, sixthVert);
          normArray = normArray.concat(firstVert, secondVert, thirdVert, fourthVert, fifthVert, sixthVert);
        }
      }
    }
  }

  function draw (mode) {
    // Load attribute data into buffers
    loadBuffer(colArrayBuffer, colArray);
    //loadBuffer(uvArrayBuffer, uvArray);
    loadBuffer(posArrayBuffer, posArray);
    //loadBuffer(normArrayBuffer, normArray);

    // Assign uniform variables
    context.uniform1i(context.getUniformLocation(context.program, 'mode'), mode); // mode 0 = flat colors, mode 1 = shaded colors, mode 2 = flat textures, mode 3 = shaded textures
    //context.uniform4fv(context.getUniformLocation(context.program, 'eyePos'), eyePos.concat(1));
    //context.uniform4fv(context.getUniformLocation(context.program, 'lightPos'), lightPos.concat(1));

    context.drawArrays(context.TRIANGLES, 0, posArray.length / 3);
  }

  function timer () {
    ++globalTime;
    if (globalTime % 20 == 0) {
      globalSign *= -1;
    }
    window.requestAnimationFrame(timer);
  }

  function drawWorld () {
    context.clear(context.DEPTH_BUFFER_BIT);
    context.clear(context.COLOR_BUFFER_BIT);
    clearBuffers();
    //addCube(5);
    //addTriangle([1, 0, 0], [-1, 0, 0], [-1, 1, 0]);
    //addQuad([-0.5, 0.5, 0], [0.5, 0.5, 0], [0.5, -0.5, 0], [-0.5, -0.5, 0]);
    addCuboid(1, 1, 1);
    draw(0);
    window.requestAnimationFrame(drawWorld);
  }
}
