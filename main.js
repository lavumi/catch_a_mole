//귀찮으니 이 둘은 전역으로...
var gl;
var canvas;

var Main = (function (){

    var directionalLight;
    var camera;
    var tempModel;
    var renderer;


    var _drawMain = function(){
        canvas = document.querySelector("#glCanvas");
        gl = canvas.getContext("webgl");

       // canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        //렌더러 생성 후 콜백으로  start 진입
        renderer = new Renderer(function(){
                this.start();
            }.bind(this)
        );
    };

    var prevPos = [0,0];
    _drawMain.prototype.onMouseMove = function(event){
        var curMousePos = getMousePosition(event, canvas);
        var moveDelta = [
            (curMousePos[0] - prevPos[0]) / 10,
                (curMousePos[1] - prevPos[1]) / 10
        ];

        camera.addOrbitalMove(moveDelta[0], moveDelta[1] );
        prevPos = curMousePos;
    };


    _drawMain.prototype.start = function(){

        //라이트 세팅

        directionalLight = new Light();
        directionalLight.setDirection( 1.0, 0.0, 0.0);
        renderer.setLight( directionalLight );

        //카메라 세팅
        camera = new Camera();
        renderer.setCamera( camera );


        //모델 생성
        tempModel = new ModelBase('Model/gopher.obj');


        //업데이트 루프 시작
        requestAnimationFrame(this.update.bind(this));
    };


    var then = 0;
    _drawMain.prototype.update = function( now ){
        now *= 0.001;
        var deltaTime = now - then;
        then = now;


        tempModel.update( deltaTime );
        directionalLight.update( deltaTime );
        camera.update( deltaTime, deltaTime );



        renderer.draw( tempModel );
        requestAnimationFrame(this.update.bind(this));
    };


        return _drawMain;
})();