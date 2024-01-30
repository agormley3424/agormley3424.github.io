/* jshint esversion: 9 */
// How am i supposed to draw multiple things with different transformations and a uniform matrix without everything doing the last transformation or only one block
// rendering at a time?
// How would I transform any vector plane to the xy plane?

function main () {
  /// // Retrieve DOM Elements /////

  const canvas = document.getElementById('canid');
  const context = getWebGLContext(canvas);
  const webPage = document.getElementById('page');
  const lightButton = document.getElementById('lightButton');
  const normalButton = document.getElementById('normalButton');

  /// // Define Shaders /////
  const vShader =
        'attribute vec4 pos;' +
        'attribute vec4 a_color;' +
        'uniform mat4 modelMatrix;' +
        'uniform mat4 camMatrix;' +
        'varying mat4 v_camMatrix;'+
        'uniform mat4 normalMatrix;'+
        'varying vec4 v_color;' +
        'attribute vec2 a_texCoord;' +
        'varying vec2 v_texCoord;' +
        'attribute vec4 a_normals;'+
        'varying vec4 v_normals;' +
        'varying vec4 v_pos;' +

        'void main() {' +
        '  gl_Position = camMatrix * modelMatrix * pos;' +
        '  v_color = a_color;' +
        '  v_texCoord = a_texCoord;' +
        '  v_pos = modelMatrix * pos;'+
        '  v_normals = normalMatrix * a_normals;'+
        '  v_camMatrix = camMatrix;'+
        '}';
  const fShader =
        'precision mediump float;' +
        'precision mediump int;' +
        'varying vec4 v_color;' +
        'varying vec2 v_texCoord;' +
        'uniform sampler2D texture;' +
        'uniform int mode;' +
        'varying vec4 v_pos;' +
        'uniform vec4 lightPos;'+
        'uniform vec4 eyePos;'+
        'varying vec4 v_normals;'+
        'varying mat4 v_camMatrix;'+

        'void main() {' +
        '  if (mode == 1) {' +
        '    gl_FragColor = v_color;' +
        '  } else if (mode == 0) {' +
        '     vec4 incVec = lightPos - v_pos;'+
        '     vec4 eyeVec = eyePos - v_pos;'+
        '     incVec = normalize(incVec);'+
        '     eyeVec = normalize(eyeVec);'+
        '     vec4 normVec = normalize(v_normals);'+

        '     vec3 ambLight = vec3(0.2, 0.2, 0.2);'+
        '     vec3 ambAlbedo = texture2D(texture, v_texCoord).xyz;'+
        '     vec3 ambCol = ambLight * ambAlbedo;' +

        '     vec3 difLight = vec3(0.5, 0.5, 0.5);' +
        '     vec3 difAlbedo = vec3(0.8, 0.8, 0.8);' +
        '     vec3 difCol2 = vec3(1, 0, 0);'+
        '     vec3 difCol1 = vec3(dot(incVec, normVec), dot(incVec, normVec), dot(incVec, normVec));'+
        '     vec3 difCol = difLight * difAlbedo * max(0.0, dot(incVec, normVec));'+

        '     vec4 refVec = reflect(-incVec, normVec);'+
        '     refVec = normalize(-refVec);'+
        '     float specDot = max(dot(refVec, eyeVec), 0.0);'+
        '     vec3 specCol1 = vec3(0.5, 0.5, 0.5) * pow(specDot, 4.0);'+

        '     vec4 halfDir = normalize(incVec + eyeVec);'+
        '     specDot = max(dot(halfDir, normVec), 0.0);'+
        '     vec3 specCol = vec3(1.0, 1.0, 1.0) * pow(specDot, 4.0);'+

        '     halfDir = normalize((incVec + eyeVec) / (abs(incVec + eyeVec)));'+
        '     vec3 specCol2 = vec3(1.0, 1.0, 1.0) - vec3(0.5, 0.5, 0.5) * pow(max(0.0, dot(normVec, halfDir)), 14.0);'+

        '     gl_FragColor = vec4(ambCol+ difCol + specCol, 1);'+
        '  } else if (mode == 2) {' +
        '     vec4 incVec = lightPos - v_pos;'+
        '     vec4 eyeVec = eyePos - v_pos;'+
        '     incVec = normalize(incVec);'+
        '     eyeVec = normalize(eyeVec);'+
        '     vec4 normVec = normalize(v_normals);'+

        '     vec3 ambLight = vec3(0.2, 0.2, 0.2);'+
        '     vec3 ambAlbedo = vec3(0.8, 0, 0);' +
        '     vec3 ambCol = ambLight * ambAlbedo;' +

        '     vec3 difLight = vec3(0.5, 0.5, 0.5);' +
        '     vec3 difAlbedo = vec3(0.8, 0.8, 0.8);' +
        '     vec3 difCol2 = vec3(1, 0, 0);'+
        '     vec3 difCol1 = vec3(dot(incVec, normVec), dot(incVec, normVec), dot(incVec, normVec));'+
        '     vec3 difCol = difLight * difAlbedo * max(0.0, dot(incVec, normVec));'+

        '     vec4 refVec = reflect(-incVec, normVec);'+
        '     refVec = normalize(-refVec);'+
        '     float specDot = max(dot(refVec, eyeVec), 0.0);'+
        '     vec3 specCol1 = vec3(0.5, 0.5, 0.5) * pow(specDot, 4.0);'+

        '     vec4 halfDir = normalize(incVec + eyeVec);'+
        '     specDot = max(dot(halfDir, normVec), 0.0);'+
        '     vec3 specCol = vec3(1.0, 1.0, 1.0) * pow(specDot, 4.0);'+

        '     halfDir = normalize((incVec + eyeVec) / (abs(incVec + eyeVec)));'+
        '     vec3 specCol2 = vec3(1.0, 1.0, 1.0) - vec3(0.5, 0.5, 0.5) * pow(max(0.0, dot(normVec, halfDir)), 14.0);'+

        '     gl_FragColor = vec4(ambCol+ difCol + specCol, 1);'+
        ' } else if (mode == 3) {'+
        '     vec4 normVec = normalize(v_normals);'+
        '     normVec.w = 1.0;'+
        '     gl_FragColor = (normVec + 1.0) / 2.0;'+
        '  }'+
        '}';

  /// // Ready webpage and load hypervariables /////

  console.log('hello world!');
  context.clearColor(0.0, 0.0, 0.5, 1.0);
  context.clear(context.COLOR_BUFFER_BIT);

  createShaderProgram(context, vShader, fShader);

  context.enable(context.BLEND);
  context.enable(context.DEPTH_TEST);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

  initTexture(context.TEXTURE0, 'src/squarebricks.jpg');
  initTexture(context.TEXTURE1, 'src/grass.jpg');

  /// // Define Global Variables /////

  let lastTime;
  let thisTime;
  let globalTime = 0;
  let globalSign = 1;
  let angle = 0;
  let FRLegAngle = -10;
  let FLLegAngle = 10;
  let BRLegAngle = 10;
  let BLLegAngle = -10;
  let headAngle = -10;
  let tailAngle = -10;

  let lightAngle = 0;

  let prevMode = 1;
  let colMode = 2;

  const modelMatrix = new Matrix4();
  const camMatrix = new Matrix4();
  const normalMatrix = new Matrix4();

  let eyePos = [0, 0, 9];
  let lookAt = [0, 0, 0];
  let up = [0, 1, 0];
  let lightPos = [-10, 8, -10];

  let lastMouse = [null, null];

  activeTextures = 0;
  const TEX_MIN = 2;

  /// // Define Vertex Attribute Arrays /////

  let quadPos = [];
  let quadCol = [];
  let quadUV = [];
  let quadNorm = [];

  /// // Instantiate buffers /////

  const quadPosBuffer = context.createBuffer();
  const quadColBuffer = context.createBuffer();
  const quadUVBuffer = context.createBuffer();
  const quadNormBuffer = context.createBuffer();

  assignBuffer('pos', quadPosBuffer, 3);
  assignBuffer('a_color', quadColBuffer, 4);
  assignBuffer('a_texCoord', quadUVBuffer, 2);
  assignBuffer('a_normals', quadNormBuffer, 3);

  /// // Declare functions /////

  function drawBody () {
    clearBuffers();
    dummyNormals(36);
    addColCuboid([0, -0.25, 0], 0.7, 1, 1, [0, 0, 1, 1], [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 0, 1]);
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawFrontLeftLeg () {
    clearBuffers();
    dummyNormals(36);
    FLLegAngle += -1 * globalSign;

    addColCuboid([0.4, -0.8, -0.4], 0.4, 0.2, 0.2, [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1]); // Front left leg
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.translate(0, -0.4, -0.4);
    modelMatrix.rotate(FLLegAngle, 1, 0, 0);
    modelMatrix.translate(0, 0.4, 0.4);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawFrontRightLeg () {
    clearBuffers();
    dummyNormals(36);
    FRLegAngle += globalSign;

    addColCuboid([-0.4, -0.8, -0.4], 0.4, 0.2, 0.2, [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1]); // Front right leg
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.translate(0, -0.4, -0.4);
    modelMatrix.rotate(FRLegAngle, 1, 0, 0);
    modelMatrix.translate(0, 0.4, 0.4);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawBackRightLeg () {
    clearBuffers();
    dummyNormals(36);
    BRLegAngle += -1 * globalSign;

    addColCuboid([-0.4, -0.8, 0.4], 0.4, 0.2, 0.2, [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1]); // Back right leg
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.translate(0, -0.4, 0.4);
    modelMatrix.rotate(BRLegAngle, 1, 0, 0);
    modelMatrix.translate(0, 0.4, -0.4);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawBackLeftLeg () {
    clearBuffers();
    dummyNormals(36);
    BLLegAngle += globalSign;

    addColCuboid([0.4, -0.8, 0.4], 0.4, 0.2, 0.2, [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [1, 1, 0, 1]); // Back left leg
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.translate(0, -0.4, 0.4);
    modelMatrix.rotate(BLLegAngle, 1, 0, 0);
    modelMatrix.translate(0, 0.4, -0.4);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawTail () {
    clearBuffers();
    dummyNormals(36);
    tailAngle += globalSign;

    addColCuboid([0, 0.05, 0.6], 0.1, 0.2, 0.3, [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [1, 0, 0, 0.5], [1, 0, 0, 0.5], [1, 0, 1, 1], [1, 0, 1, 1]); // Tail'*/
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.translate(0, 0, 0.3);
    modelMatrix.rotate(tailAngle, 0, 1, 0);
    modelMatrix.translate(0, 0, -0.3);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawHead () {
    clearBuffers();
    dummyNormals(36);
    headAngle += globalSign;

    addColCuboid([0, 0.25, -0.6], 0.3, 0.4, 0.6, [1, 0, 1, 1], [1, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]);
    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setTranslate(2.5, 0, 1);
    modelMatrix.rotate(headAngle, 0, 1, 0);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    drawQuads(1);
  }

  function drawAnimal () {
    context.clear(context.DEPTH_BUFFER_BIT);
    context.clear(context.COLOR_BUFFER_BIT);
    lastTime = Date.now();
    drawBody();
    drawHead();
    drawTail();
    drawBackLeftLeg();
    drawBackRightLeg();
    drawFrontLeftLeg();
    drawFrontRightLeg();
  }

  function clearBuffers() {
    quadPos = [];
    quadUV = [];
    quadCol = [];
    quadNorm = [];
  }

  function dummyNormals(vertices) {
    for (let i = 0; i < vertices; ++i) {
      quadNorm = quadNorm.concat([-1, -1, -1]);
    }
  }

  function drawFloor () {
    clearBuffers();
    addTexCuboid([0, -1, 0], 0.01, 12.5, 12.5, [0, 1], [1, 1], [0, 0], [1, 0]);
    //addColCuboid([0, -1, 0], 0.01, 12.5, 12.5, [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1], [0, 0.7, 0, 1]);
    context.uniform1i(context.getUniformLocation(context.program, 'texture'), 1);
    dummyNormals(36);

    drawQuads(0);
  }

  function drawSky () {
    clearBuffers();
    //addTexCube([0, 0, 0], 50, [0, 1], [1, 1], [0, 0], [1, 0]);
    addColCube([0, 0, 0], 50, [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1], [0, 0, 0.7, 1]);
    //context.uniform1i(context.getUniformLocation(context.program, 'texture'), 1);
    dummyNormals(36);

    drawQuads(1);
  }

  function drawBlock (center, length) {
    clearBuffers();
    addTexCube(center, length, [0, 1], [1, 1], [0, 0], [1, 0]);
    dummyNormals(36);

    context.uniform1i(context.getUniformLocation(context.program, 'texture'), 0);

    drawQuads(0);
  }

  // Draws a stack of blocks at some location
  // x and y are coordinates for the block center
  // floorHeight specifies the bottom of each stack
  // numBlocks is how many blocks to draw
  function drawBlocks (x, z, floorHeight, numBlocks, blockLength) {
    floorHeight -= (blockLength / 2);
    //console.log(x, z, floorHeight, numBlocks);

    for (let i = 1; i <= numBlocks; i += 1) {
      drawBlock([x, floorHeight + (blockLength * i), z], blockLength);
    }
  }

  function drawWorld () {
    context.clear(context.DEPTH_BUFFER_BIT);
    context.clear(context.COLOR_BUFFER_BIT);

    const height = 25;
    const width = 25;
    const floorHeight = -1;
    const blockLength = 0.5;

    map = new BetterArray(height, width, [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 2, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    ]);

    camMatrix.setPerspective(30, canvas.width / canvas.height, 1, 60);
    camMatrix.lookAt(eyePos[0], eyePos[1], eyePos[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
    modelMatrix.setIdentity();
    normalMatrix.setInverseOf(modelMatrix);

    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'camMatrix'), false, camMatrix.elements);
    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    context.uniformMatrix4fv(context.getUniformLocation(context.program, 'normalMatrix'), false, normalMatrix.elements);
    
    for (let z = 0; z < height; ++z) {
      for (let x = 0; x < width; ++x) {
        if (map.getVal(x, z) !== 0) {
          drawBlocks((x - Math.floor(width / 2)) * blockLength, (z - Math.floor(height / 2)) * blockLength, floorHeight, map.getVal(x, z), blockLength);
        }
      }
    }
    drawFloor();
    drawSky();
    drawSphere();
    drawAnimal();
    window.requestAnimationFrame(drawWorld);
  }

  function drawAnimal() {
    lastTime = Date.now();
    drawBody();
    drawHead();
    drawTail();
    drawBackLeftLeg();
    drawBackRightLeg();
    drawFrontLeftLeg();
    drawFrontRightLeg();
  }

  class BetterArray {
    array = [];
    height;
    width;

    constructor (height, width, arr) {
      if (arguments.length === 3) {
        if (arr.length !== height * width) {
          throw 'BetterArray Error: Array dimensions incorrect';
        }
        this.array = arr;
        this.width = width;
        this.height = height;
      } else if (arguments.length === 2) {
        for (let i = 0; i < height * width; ++i) {
          this.array.push(0);
        }
      } else {
        throw 'BetterArray Error: Invalid construction';
      }
    }

    // x and y start at 0
    getVal (x, y) {
      if (y >= this.height || x >= this.width) {
        throw 'BetterArray Error: getVal: Invalid dimensions';
      }
      return this.array[(y * this.width) + x];
    }

    setVal (x, y, value) {
      if (y >= this.height || x >= this.width) {
        throw 'BetterArray Error: getVal: Invalid dimensions';
      }
      this.array[(y * this.width) + x] = value;
    }

    getArray () {
      return this.array;
    }

    getDimensions () {
      return [height, width];
    }
  }

  // Return a vector's length
  function vectorMag (vec) {
    let sum = 0;
    for (const e of vec) {
      sum += e * e;
    }
    return Math.sqrt(sum);
  }

  // Return the sum of two vectors
  function vectorAdd (vec1, vec2) {
    const resultVec = [];
    if (vec1.length !== vec2.length) {
      throw 'vectorAdd Error: Vectors have unequal length';
    } else {
      for (let i = 0; i < vec1.length; ++i) {
        resultVec.push(vec1[i] + vec2[i]);
      }
      return resultVec;
    }
  }

  // Return the difference of two vectors (v1 - v2)
  function vectorSub (vec1, vec2) {
    const resultVec = [];
    if (vec1.length !== vec2.length) {
      throw 'vectorSub Error: Vectors have unequal length';
    } else {
      for (let i = 0; i < vec1.length; ++i) {
        resultVec.push(vec1[i] - vec2[i]);
      }
      return resultVec;
    }
  }

  // Return the cross product of two vectors (Moving left)
  function vectorCross (vec1, vec2) {
    const resultVec = [];
    if (vec1.length !== vec2.length) {
      throw 'vectorCross Error: Vectors have unequal length';
    } else {
      resultVec.push(vec1[1] * vec2[2] - vec1[2] * vec2[1]);
      resultVec.push(vec1[2] * vec2[0] - vec1[0] * vec2[2]);
      resultVec.push(vec1[0] * vec2[1] - vec1[1] * vec2[0]);

      return resultVec;
    }
  }

  // Returns the dot product of two vectors
  function vectorDot (vec1, vec2) {
    let result = 0;
    if (vec1.length !== vec2.length) {
      throw 'vectorDot Error: Vectors have unequal length';
    } else {
      for (let i = 0; i < vec1.length; ++i) {
        result += vec1[i] * vec2[i];
      }
    }
    return result;
  }

  // Multiplies a matrix by a vector
  // Each element of mat is a matrix row
  // Vec is treated as column vector
  function matrixProd (mat, vec) {
    if (mat.length === 0) {
      throw 'matrixProd Error: Empty matrix';
    } else if (mat[0].length !== vec.length) {
      throw 'matrixProd Error: Invalid operand size';
    }

    let resultVec = [];

    for (const row of mat) {
      resultVec.push(vectorDot(row, vec));
    }

    return resultVec;
  }

  // Scales a vector
  function vectorProd (scalar, vec) {
    for (let i = 0; i < vec.length; ++i) {
      vec[i] *= scalar;
    }
  }

  // Normalizes a vector
  function vecNormal (vec) {
    const length = vectorMag(vec);
    vectorProd((1 / length), vec);
  }

  // Returns an xyz rotation matrix around the y axis
  function rotMatrixH (rotAngle) {
    if (rotAngle === 0) {
      return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
    return [[Math.cos(Math.PI / rotAngle), 0, Math.sin(Math.PI / rotAngle)], [0, 1, 0], [-1 * Math.sin(Math.PI / rotAngle), 0, Math.cos(Math.PI / rotAngle)]];
  }

  // Returns an xyz rotation matrix around the x axis
  function rotMatrixV (rotAngle) {
    if (rotAngle === 0) {
      return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
    return [[1, 0, 0], [0, Math.cos(Math.PI / rotAngle), -1 * Math.sin(Math.PI / rotAngle)], [0, Math.sin(Math.PI / rotAngle), Math.cos(Math.PI / rotAngle)]];
  }

  function degToRad (degrees) {
    return Math.PI * degrees / 180;
  }

  function yMatrixDeg (degrees) {
    if (degrees === 0) {
      return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
    angle = degToRad (degrees);
    return [[Math.cos(angle), 0, Math.sin(angle)], [0, 1, 0], [-1 * Math.sin(angle), 0, Math.cos(angle)]];
  }

  function yMatrixRad (radians) {
    if (radians === 0) {
      return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
    return [[Math.cos(radians), 0, Math.sin(radians)], [0, 1, 0], [-1 * Math.sin(radians), 0, Math.cos(radians)]];
  }

  // Returns the euclidean distance between two 2D points
  function euclid (x1, y1, x2, y2) {
    return Math.sqr((Math.pow(x2, 2) - Math.pow(x1, 2)) + (Math.pow(y2, 2) - Math.pow(y1, 2)));
  }

  /// // Define event handlers /////

  canvas.onmousemove = function (e) {
    const newMouse = [e.clientX, e.clientY];
    if (lastMouse[0] !== null) {
      const xDif = newMouse[0] - lastMouse[0];
      const yDif = newMouse[1] - lastMouse[1];
      rotateCameraH(-2500 / xDif);
      rotateCameraV(-2500 / yDif);
    }
    lastMouse = newMouse;
  };

  canvas.onmouseout = function (e) {
    lastMouse = [null, null];
  }

  lightButton.onmousedown = function (e) {
    if (colMode < 3) {
       colMode = colMode === 2 ? 1 : 2;
    }
  }

  normalButton.onmousedown = function (e) {
    if (colMode === 3) {
      colMode = prevMode;
      prevMode = 3;
    } else {
      prevMode = colMode;
      colMode = 3;
    }
  }

  function rotateCameraH(angle) {
    mat = rotMatrixH(angle);
    const diff = vectorSub(eyePos, up);
    // Align camera vector with up vector
    lookAt = vectorAdd(lookAt, [-1 * diff[0], -1 * diff[1], -1 * diff[2]]);
    // Align camera vector with y-axis
    lookAt = vectorAdd(lookAt, [-1 * up[0], 0, -1 * up[2]]);
    // Rotate lookAt around y-axis
    lookAt = matrixProd(mat, lookAt);
    // Undo y-axis alignment
    lookAt = vectorAdd(lookAt, [up[0], 0, up[2]]);
    // Undo camera up alignment
    lookAt = vectorAdd(lookAt, [diff[0], diff[1], diff[2]]);

    /*
    lookAt = vectorAdd(lookAt, [-1 * eyePos[0], 0, -1 * eyePos[2]]);
    lookAt = matrixProd(mat, lookAt);
    lookAt = vectorAdd(lookAt, [eyePos[0], 0, eyePos[2]]);*/
  }

  // Rotate camera vertically by some angle
  function rotateCameraV(angle) {
    forwardVec = vectorSub(lookAt, eyePos);
    rightVec = vectorCross(up, forwardVec);
    vectorProd(-1, rightVec);
    //console.log(forwardVec);
    //console.log(rightVec);
    mat = rotMatrixV(angle);
    // Translate frame to center so that rightVec corresponds to camera position
    lookAt = vectorAdd(lookAt, [-1 * eyePos[0], -1 * eyePos[1], -1 * eyePos[2]]);
    // Translate frame such that rightVec is aligned with the x axis
    lookAt = vectorAdd(lookAt, [0, -1 * rightVec[1], -1 * rightVec[2]]);
    // Rotate lookAt around the x-axis
    lookAt = matrixProd(mat, lookAt);
    // Translate frame such that rightVec x-alignment is undone
    lookAt = vectorAdd(lookAt, [0, rightVec[1], rightVec[2]]);
    // Translate frame such that the camera is in its original position
    lookAt = vectorAdd(lookAt, [eyePos[0], eyePos[1], eyePos[2]]);
    //console.log(lookAt);
  }

  webPage.onkeydown = function (e) {
    let forwardVec;
    let leftVec;
    let rightVec;
    let backVec;
    let mat;

    try {
      switch (e.key) {
        case 'w':
          forwardVec = vectorSub(lookAt, eyePos);
          vecNormal(forwardVec);
          vectorProd(0.1, forwardVec);
          eyePos = vectorAdd(eyePos, forwardVec);
          lookAt = vectorAdd(lookAt, forwardVec);
          break;
        case 'a':
          forwardVec = vectorSub(lookAt, eyePos);
          leftVec = vectorCross(up, forwardVec);
          vecNormal(leftVec);
          vectorProd(0.05, leftVec);
          eyePos = vectorAdd(eyePos, leftVec);
          lookAt = vectorAdd(lookAt, leftVec);
          break;
        case 'd':
          forwardVec = vectorSub(lookAt, eyePos);
          rightVec = vectorCross(up, forwardVec);
          vecNormal(rightVec);
          vectorProd(-0.05, rightVec);
          eyePos = vectorAdd(eyePos, rightVec);
          lookAt = vectorAdd(lookAt, rightVec);
          break;
        case 's':
          backVec = vectorSub(lookAt, eyePos);
          vecNormal(backVec);
          vectorProd(-0.1, backVec);
          eyePos = vectorAdd(eyePos, backVec);
          lookAt = vectorAdd(lookAt, backVec);
          break;
        case 'q':
          rotateCameraH(100);
          break;
        case 'e':
          rotateCameraH(-100);
          break;
        default:
          // console.log('webPage.onkeydown Error: Key not recognized: ' + e.key);
      }
    } catch (exception) {
      console.log(exception);
    }
  };

  // drawAnimal();
  // timer();
  // drawFloor();
  //  drawBlock();

  // Utility functions ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    //context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    //context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, img);
    ++activeTextures;
    if (activeTextures === TEX_MIN) {
      timer();
      drawWorld();
    }
  }

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

  function addColTriangle (v1, v2, v3, c1 = [1, 0, 0, 1], c2 = [1, 0, 0, 1], c3 = [1, 0, 0, 1]) {
    quadPos = quadPos.concat(v1, v2, v3);
    quadCol = quadCol.concat(c1, c2, c3);
    quadUV = quadUV.concat([-1, -1], [-1, -1], [-1, -1]);
  }

  // Add a new quad to the quad arrays
  function addColQuad (plane, upperLeft, lowerRight, cul = [1, 0, 0, 1], cur = [1, 0, 0, 1], cll = [1, 0, 0, 1], clr = [1, 0, 0, 1]) {
    // upperLeft is an array [x, y, z] of the corner coordinates
    let upperRight;
    let lowerLeft;

    if (plane === 'z') {
      upperRight = [upperLeft[0], upperLeft[1], lowerRight[2]];
      lowerLeft = [lowerRight[0], upperLeft[1], upperLeft[2]];
    } else {
      upperRight = [lowerRight[0], upperLeft[1], lowerRight[2]];
      lowerLeft = [upperLeft[0], lowerRight[1], upperLeft[2]];
    }
    addColTriangle(lowerLeft, upperLeft, upperRight, cll, cul, cur);
    addColTriangle(upperRight, lowerRight, lowerLeft, cur, clr, cll);
  }

  // Add a front-facing cuboid of quads to the quad arrays
  function addColCuboid (center, height, width, depth, cful, cfur, cfll, cflr, cbul, cbur, cbll, cblr) {
    // Height, width, and depth are positive numbers between 0 and 1
    const halfHeight = height / 2;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const frontLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const frontRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const leftLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] + halfDepth];
    const leftRight = [center[0] - halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const rightLeft = [center[0] + halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const rightRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] + halfDepth];

    const topLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const topRight = [center[0] + halfWidth, center[1] + halfHeight, center[2] + halfDepth];

    const bottomLeft = [center[0] - halfWidth, center[1] - halfHeight, center[2] + halfDepth];
    const bottomRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const backLeft = [center[0] + halfWidth, center[1] + halfHeight, center[2] + halfDepth];
    const backRight = [center[0] - halfWidth, center[1] - halfHeight, center[2] + halfDepth];

    addColQuad('x', frontLeft, frontRight, cful, cfur, cfll, cflr); // Front face
    addColQuad('y', leftLeft, leftRight, cbur, cful, cblr, cfll); // Left face
    addColQuad('y', rightLeft, rightRight, cfur, cbul, cflr, cbll); // Right face
    addColQuad('x', backLeft, backRight, cbul, cbur, cbll, cblr); // Back face
    addColQuad('z', topLeft, topRight, cful, cbur, cfur, cbul); // Top face
    addColQuad('z', bottomLeft, bottomRight, cblr, cfll, cbll, cflr); // Bottom face
  }

  // Add a front-facing cube
  function addColCube (center, length, cful, cfur, cfll, cflr, cbul, cbur, cbll, cblr) {
    addColCuboid(center, length, length, length, cful, cfur, cfll, cflr, cbul, cbur, cbll, cblr);
  }

  function addTexTriangle (v1, v2, v3, uv1 = [-1, -1], uv2 = [-1, -1], uv3 = [-1, -1]) {
    quadPos = quadPos.concat(v1, v2, v3);
    quadCol = quadCol.concat([1, 0, 0, 1], [1, 0, 0, 1], [1, 0, 0, 1]);
    quadUV = quadUV.concat(uv1, uv2, uv3);
  }

  // Add a new quad to the quad arrays
  function addTexQuad (plane, upperLeft, lowerRight, uvul, uvur, uvll, uvlr) {
    // upperLeft is an array [x, y, z] of the corner coordinates
    let upperRight;
    let lowerLeft;

    if (plane === 'z') {
      upperRight = [upperLeft[0], upperLeft[1], lowerRight[2]];
      lowerLeft = [lowerRight[0], upperLeft[1], upperLeft[2]];
    } else {
      upperRight = [lowerRight[0], upperLeft[1], lowerRight[2]];
      lowerLeft = [upperLeft[0], lowerRight[1], upperLeft[2]];
    }
    addTexTriangle(lowerLeft, upperLeft, upperRight, uvll, uvul, uvur);
    addTexTriangle(upperRight, lowerRight, lowerLeft, uvur, uvlr, uvll);
  }

  // Add a front-facing cuboid of quads to the quad arrays
  function addTexCuboid (center, height, width, depth, ul, ur, ll, lr) {
    // Height, width, and depth are positive numbers between 0 and 1
    const halfHeight = height / 2;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const frontLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const frontRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const leftLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] + halfDepth];
    const leftRight = [center[0] - halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const rightLeft = [center[0] + halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const rightRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] + halfDepth];

    const topLeft = [center[0] - halfWidth, center[1] + halfHeight, center[2] - halfDepth];
    const topRight = [center[0] + halfWidth, center[1] + halfHeight, center[2] + halfDepth];

    const bottomLeft = [center[0] - halfWidth, center[1] - halfHeight, center[2] + halfDepth];
    const bottomRight = [center[0] + halfWidth, center[1] - halfHeight, center[2] - halfDepth];

    const backLeft = [center[0] + halfWidth, center[1] + halfHeight, center[2] + halfDepth];
    const backRight = [center[0] - halfWidth, center[1] - halfHeight, center[2] + halfDepth];

    addTexQuad('x', frontLeft, frontRight, ul, ur, ll, lr); // Front face
    addTexQuad('y', leftLeft, leftRight, ul, ur, ll, lr); // Left face
    addTexQuad('y', rightLeft, rightRight, ul, ur, ll, lr); // Right face
    addTexQuad('x', backLeft, backRight, ul, ur, ll, lr); // Back face
    addTexQuad('z', topLeft, topRight, ul, ur, ll, lr); // Top face
    addTexQuad('z', bottomLeft, bottomRight, ul, ur, ll, lr); // Bottom face
  }

  // Add a front-facing cube
  function addTexCube (center, length, cful, cfur, cfll, cflr, cbul, cbur, cbll, cblr) {
    addTexCuboid(center, length, length, length, cful, cfur, cfll, cflr, cbul, cbur, cbll, cblr);
  }

  function drawQuads (mode) {
    loadBuffer(quadColBuffer, quadCol);
    loadBuffer(quadUVBuffer, quadUV);
    loadBuffer(quadPosBuffer, quadPos);
    loadBuffer(quadNormBuffer, quadNorm);
    context.uniform1i(context.getUniformLocation(context.program, 'mode'), mode);
    context.uniform4fv(context.getUniformLocation(context.program, 'eyePos'), eyePos.concat(1));
    context.uniform4fv(context.getUniformLocation(context.program, 'lightPos'), lightPos.concat(1));

    context.drawArrays(context.TRIANGLES, 0, quadPos.length / 3);
  }

  // Add a sphere of polygons centered at the origin to the quadPos array
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
      let firstCircle = [];
      let secondCircle = [];
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

          addColTriangle(firstVert, secondVert, thirdVert);
          addColTriangle(fourthVert, fifthVert, sixthVert);
          /* Flat shading
          const firstVec = vectorSub(thirdVert, secondVert);
          const secondVec = vectorSub(firstVert, secondVert);
          const firstNorm = vectorCross(firstVec, secondVec);
          vectorProd(-1, firstNorm);
          const secondNorm = firstNorm;
          vecNormal(firstNorm);
          vecNormal(secondNorm);
          quadNorm = quadNorm.concat(firstNorm, firstNorm, firstNorm, secondNorm, secondNorm, secondNorm);*/
          quadNorm = quadNorm.concat(firstVert, secondVert, thirdVert, fourthVert, fifthVert, sixthVert);
        }
      }
    }
  }

  function drawCircle(offset, divisions) {
    clearBuffers();

    rotMatrix = yMatrix(100);
    const angle = 2 * Math.PI / divisions;
    for (let i = 0; i < 2 * Math.PI; i += angle) {
      const vert = matrixProd(rotMatrix, [Math.cos(i), Math.sin(i), 0]);

      quadPos.push(vert[0], vert[1], vert[2]);
      quadCol = quadCol.concat(1, 0, 0, 1);
      quadUV = quadUV.concat([-1, -1], [-1, -1], [-1, -1]);
    }

    loadBuffer(quadColBuffer, quadCol);
    loadBuffer(quadUVBuffer, quadUV);
    loadBuffer(quadPosBuffer, quadPos);
    context.uniform1i(context.getUniformLocation(context.program, 'mode'), 1);
    context.drawArrays(context.TRIANGLE_FAN, 0, quadPos.length / 3);
  }

  function addLitCube() {
    //addColCube([-2, 0, 0] , 1);
    // Adding top polygon first
    // Bottom left, upper left, upper right, bottom left, bottom right, upper right
    // Front face
    addColTriangle([-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]);
    addColTriangle([-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5]);
    quadNorm = quadNorm.concat([-1, -1, 1], [-1, 1, 1], [1, 1, 1], [-1, -1, 1], [1, -1, 1], [1, 1, 1]);
    
    // Right face
    addColTriangle([0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]);
    addColTriangle([0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5]);
    quadNorm = quadNorm.concat([1, -1, 1], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [1, 1, -1]);

    // Left face
    addColTriangle([-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5]);
    addColTriangle([-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5]);
    quadNorm = quadNorm.concat([-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, -1], [-1, -1, 1], [-1, 1, 1]);

    // Back face
    addColTriangle([0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]);
    addColTriangle([0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5]);
    quadNorm = quadNorm.concat([1, -1, -1], [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1], [-1, 1, -1]);

    // Top face
    addColTriangle([-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]);
    addColTriangle([-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]);
    quadNorm = quadNorm.concat([-1, 1, 1], [-1, 1, -1], [1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]);
    

    // Bottom face
    addColTriangle([-0.5, -0.5, 0.5], [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5]);
    addColTriangle([-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, -0.5, -0.5]);
    quadNorm = quadNorm.concat([-1, -1, 1], [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]);
    
    /*
    quadNorm = quadNorm.concat([0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
    quadNorm = quadNorm.concat([-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0]);
    quadNorm = quadNorm.concat([1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0]);
    quadNorm = quadNorm.concat([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
    quadNorm = quadNorm.concat([0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]);
    quadNorm = quadNorm.concat([0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]);*/
  }

  function addStub() {
    addColTriangle([0, 0, -0.5], [0, 1, -0.5], [1, 0, -0.5]);
    quadNorm = quadNorm.concat([0, 0, 1], [0, 0, 1], [0, 0, 1]);
  }

  function drawSphere () {
    clearBuffers();
    addSphere(14, 1);
    drawLit();
    clearBuffers();
    addLitCube();
    drawLit([-2, 0, 2]);
    clearBuffers();
    addSphere(14, 1.5);
    drawLit([2, 1, -2]);
  }

  function drawLit (tran) {
    loadBuffer(quadColBuffer, quadCol);
    loadBuffer(quadUVBuffer, quadUV);
    loadBuffer(quadPosBuffer, quadPos);
    loadBuffer(quadNormBuffer, quadNorm);
    //lightPos = matrixProd(rotMatrixV(0.502), lightPos);
    context.uniform1i(context.getUniformLocation(context.program, 'mode'), colMode);
    context.uniform4fv(context.getUniformLocation(context.program, 'eyePos'), eyePos.concat(1));
    context.uniform4fv(context.getUniformLocation(context.program, 'lightPos'), lightPos.concat(1));
    if (tran !== undefined) {
      modelMatrix.setTranslate(tran[0], tran[1], tran[2]);
      context.uniformMatrix4fv(context.getUniformLocation(context.program, 'modelMatrix'), false, modelMatrix.elements);
    }

    context.drawArrays(context.TRIANGLES, 0, quadPos.length / 3);
  }

  function timer () {
    ++globalTime;
    if (globalTime % 20 == 0) {
      globalSign *= -1;
    }
    window.requestAnimationFrame(timer);
  }
}
