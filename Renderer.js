var gl;


var Renderer = (function (){

    var shaderData;
    var camera;
    var light;
    var canvas;

    var clearColor = {
        r : 0,
        g : 0,
        b : 0,
        a : 1
    };

    var _renderer = function(cb){

        canvas = document.querySelector("#glCanvas");
        gl = this.gl = canvas.getContext("webgl");
        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        window.addEventListener('resize', resizeCanvas, false);
        resizeCanvas();

        this.clearScreen( 0.2, 0.2, 1, 1);

        var shaders = {
            simpleShader: {
                vertexShader: 'shader/simple.vert',
                fragmentShader: 'shader/simple.frag',
                attrInfo : ['aVertexPosition'],
                uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix']
            },
            colorShader: {
                vertexShader: 'shader/color.vert',
                fragmentShader: 'shader/color.frag',
                attrInfo : ['aVertexPosition', 'aVertexColor'],
                uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix']
            },
            normalShader: {
                vertexShader: 'shader/normalShader.vert',
                fragmentShader: 'shader/normalShader.frag',
                attrInfo : ['aVertexPosition', 'aVertexNormal'],
                uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix', 'uDirectionalLight']
            },
        };

        initShaders(shaders, function( result ){
                shaderData = result;
                cb();
            }.bind(this)
        );



        camera = new Camera( gl );

    };


    var resizeCanvas = function(){
        canvas.width = window.innerWidth - 40;
        canvas.height = window.innerHeight - 40;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };


    _renderer.prototype.draw = function(model){
        this.clearScreen();
        model.draw( camera,light, shaderData.normalShader );
    };

    _renderer.prototype.clearScreen = function( r, g, b, a ) {

        if( !!r && !!g && !!b && !!a){
            clearColor.r = r;
            clearColor.g = g;
            clearColor.b = b;
            clearColor.a = a;
        }

        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);

        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    };

    _renderer.prototype.setLight = function( pLight ){
        light = pLight;
    };


    return _renderer;
}());