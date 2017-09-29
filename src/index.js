import IndexCss from '#/index.css';
import nmo_v from '#/shaders/nmo_v.glsl'

var cvs = document.createElement('canvas');
var gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');
var light = {
    x: 0.5,
    y: 0.5,
    z: 0.03
}
var isRendered = false;
var image = new Image();
var program = null;

cvs.id = "lighterWall";
document.body.appendChild(cvs);
document.addEventListener('mousemove', hover)
image.addEventListener('load', loadAndRenderRepeatShaders);
image.src = require('#/img/bg1.png');


function hover(e) {
    if (isRendered) {
        light.x = e.clientX / document.body.offsetWidth;
        light.y = e.clientY / document.body.offsetHeight;
        bindRendererUniform(gl, cvs.width, cvs.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function loadAndRenderRepeatShaders() {
    var w = document.body.offsetWidth;
    var h = document.body.offsetHeight;
    var iW = this.width;
    var iH = this.height;
    cvs.width = w;
    cvs.height = h;
    gl.viewport(0, 0, w, h);
    var repeatX = 1.0;
    var repeatY = (w / iW) * (iH / h);
    var v = [];

    program = createProgram(gl, require('#/shaders/rp_v.glsl'), require('#/shaders/rp_f.glsl'));
    v.push(-1.0, 1.0, repeatX, repeatY);
    v.push(-1.0, -1.0, 0.0, repeatY);
    v.push(1.0, 1.0, repeatX, 0.0);
    v.push(1.0, -1.0, 0.0, 0.0);

    var vF32A = new Float32Array(v);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vF32A, gl.STATIC_DRAW);

    var vec4Position = gl.getAttribLocation(program, 'a_Position');
    var vec2TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    var Fsize = vF32A.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(vec4Position, 2, gl.FLOAT, false, 4 * Fsize, 0);
    gl.enableVertexAttribArray(vec4Position);

    gl.vertexAttribPointer(vec2TexCoord, 2, gl.FLOAT, false, 4 * Fsize, 2 * Fsize);
    gl.enableVertexAttribArray(vec2TexCoord);

    gl.activeTexture(gl.TEXTURE0);
    createTexByImage(gl, image);

    gl.uniform1i(gl.getUniformLocation(program, 'u_Sampler'), 0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    loadNormalMapShaders();

}

/**加载法线贴图渲染着色器*/
function loadNormalMapShaders() {
    program = createProgram(gl, nmo_v, require('#/shaders/nmo_f.glsl'));
    renderNormalMap(gl);
}

/**渲染成法线贴图 */
function renderNormalMap(gl) {
    createVerticesBuffer(gl);
    gl.activeTexture(gl.TEXTURE0);
    createTexByImage(gl, cvs);

    gl.uniform1i(gl.getUniformLocation(program, 'u_Sampler'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_step'), 1.0 / cvs.width, 1.0 / cvs.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    loadLightShaders(gl)
}

function loadLightShaders(gl) {
    program = createProgram(gl, nmo_v, require('#/shaders/light_f.glsl'));
    renderLight(gl)
}

function renderLight(gl) {
    createVerticesBuffer(gl);

    gl.activeTexture(gl.TEXTURE1);
    createTexByImage(gl, cvs);

    bindRendererUniform(gl, cvs.width, cvs.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    isRendered = true;
}

/**创建顶点数据缓存并传入webgl */
function createVerticesBuffer(webgl) {
    var vertices = [1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0];
    var verticesBuffer = new Float32Array(vertices);

    var buffer = webgl.createBuffer();

    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, verticesBuffer, webgl.STATIC_DRAW);

    var vec4Position = null;
    webgl.bindAttribLocation(program, vec4Position, 'a_Position');
    webgl.enableVertexAttribArray(vec4Position);
    webgl.vertexAttribPointer(vec4Position, 2, webgl.FLOAT, false, 0, 0);
    return buffer;
}

/**创建纹理贴图 */
function createTexByImage(webgl, image) {
    var texture = webgl.createTexture();
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        return texture
    }
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
    return texture
}

function isPowerOf2(value) {
    return !(value & (value - 1));
}

function bindRendererUniform(gl, w, h) {
    gl.uniform1i(gl.getUniformLocation(program, 'u_Sampler_0'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_Sampler_1'), 1);
    gl.uniform2f(gl.getUniformLocation(program, 'u_step'), 1.0 / w, 1.0 / h);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h)
    gl.uniform3f(gl.getUniformLocation(program, 'u_light'), light.x, 1.0 - light.y, light.z);
}

/**创建着色器程序 */
function createProgram(gl, vss, fss) {
    var program = gl.createProgram();
    var vShader = createShader(gl, vss, gl.VERTEX_SHADER);
    var fShader = createShader(gl, fss, gl.FRAGMENT_SHADER);
    gl.linkProgram(program);
    gl.useProgram(program);

    return program;

    /**创建着色器 */
    function createShader(webgl, source, type) {
        var shader = webgl.createShader(type);
        webgl.shaderSource(shader, source);
        webgl.compileShader(shader);
        webgl.attachShader(program, shader);
        return shader;
    }

}