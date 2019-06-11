//귀찮으니 이 둘은 전역으로...
var gl;
var canvas;

var Main = (function (){

    var directionalLight;
    var camera;
    var objects = [];
    var renderer;


    var _drawMain = function(){
        canvas = document.querySelector("#glCanvas");
        gl = canvas.getContext("webgl");
        if ( typeof canvas.requestFullscreen === 'function')
            canvas.requestFullscreen();

        // canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        // canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        // canvas.addEventListener('mouseup', this.onMouseDUp.bind(this));
        //
        // canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        // canvas.addEventListener('touchmove', this.onMouseMove.bind(this));
        // canvas.addEventListener('touchend', this.onMouseDUp.bind(this));


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


    var mouseDown = false;
    var prevPos = [0,0];
    _drawMain.prototype.onMouseDown = function(){
        mouseDown = true;
        prevPos = getMousePosition(event, canvas);


    };

    _drawMain.prototype.onMouseMove = function(event){
        if(mouseDown === false )
            return;
        var curMousePos = getMousePosition(event, canvas);
        var moveDelta = [
            (curMousePos[0] - prevPos[0]) / 50,
                (curMousePos[1] - prevPos[1]) / 50
        ];
        prevPos = curMousePos;

        tempModel.rotate(moveDelta[0], moveDelta[1]);
    };

    _drawMain.prototype.onMouseDUp = function(){
        mouseDown = false;
        tempModel.bounce();
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
        var tempModel = new ModelBase('Model/hole');
        tempModel.moveTo( 0,-2,0);

        objects.push(tempModel);


        var tempModel2 = new ModelBase('Model/hole');
        tempModel2.moveTo( 0,-2,1);

        objects.push(tempModel2);


        console.log(objects[0].getWorldData().position);
        console.log(objects[1].getWorldData().position);
        //업데이트 루프 시작
        requestAnimationFrame(this.update.bind(this));
    };


    var then = 0;
    _drawMain.prototype.update = function( now ){
        now *= 0.001;
        var deltaTime = now - then;
        then = now;


        for( var i = 0; i < objects.length ; i++){
            objects[i].update( deltaTime );
        }

        directionalLight.update( deltaTime );
        camera.update( deltaTime, deltaTime );



        renderer.draw( objects );
        requestAnimationFrame(this.update.bind(this));
    };


        return _drawMain;
})();








