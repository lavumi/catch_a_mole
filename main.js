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
        console.log(gl);

        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        if ( typeof canvas.requestFullscreen === 'function')
            canvas.requestFullscreen();

        this.initInputEvent();





        //렌더러 생성 후 콜백으로  start 진입
        renderer = new Renderer(function(){
                this.start();
            }.bind(this)
        );
    };






    //region [Mouse Event]
    _drawMain.prototype.initInputEvent = function(){
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseDUp.bind(this));

        // canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        // canvas.addEventListener('touchmove', this.onMouseMove.bind(this));
        // canvas.addEventListener('touchend', this.onMouseDUp.bind(this));
    };


    var mouseDown = false;
    var prevPos = [0,0];
    _drawMain.prototype.onMouseDown = function(){
        console.log('mouseDown called');
        mouseDown = true;
        prevPos = getMousePosition(event, canvas);
        for( var i = 0; i < objects.length;i++)
            objects[i].bounce();

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


        for( var i = 0; i < objects.length;i++)
            objects[i].rotate(0, moveDelta[0],0);

        //camera.addOrbitalMove(moveDelta[0], moveDelta[1], 5 );
    };

    _drawMain.prototype.onMouseDUp = function(){
        mouseDown = false;
        console.log('onMouseDUp called');

    };


    //endregion

    _drawMain.prototype.start = function(){

        //라이트 세팅

        directionalLight = new Light();
        directionalLight.setDirection( 1.0, 1.0, 0.0);
        renderer.setLight( directionalLight );

        //카메라 세팅
        camera = new Camera();
        renderer.setCamera( camera );



        var filename = 'Model/gopher_low';

       // var filename = 'Model/hole';

        //모델 생성
        var tempModel;
        for( var i = -1 ; i < 2 ; i ++){
            for( var j = 0 ; j< 3 ; j ++){
                tempModel = new ModelBase(filename);
                tempModel.moveTo( i * 1.5,-1,j * 1.5);

                objects.push(tempModel);


            }
        }



        //
        // var tempModel2 = new ModelBase(filename);
        // tempModel2.moveTo( 0,-1,-2);
        //
        // objects.push(tempModel2);
        //
        // var tempModel3 = new ModelBase(filename);
        // tempModel3.moveTo( 2,-1,0);
        //
        // objects.push(tempModel3);
        //
        // var tempModel4 = new ModelBase(filename);
        // tempModel4.moveTo( -2,-1,0);
        //
        // objects.push(tempModel4);


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








