//귀찮으니 이 둘은 전역으로...
var gl;
var canvas;

var Main = (function (){

    var directionalLight;
    var camera;
    var characters = [];
    var allObjects = [];
    var renderer;

    var isMobile = true;


    var checkMobile = function(){
        var filter = "win16|win32|win64|mac";
        if (navigator.platform ) {        
            return filter.indexOf(navigator.platform.toLowerCase()) >= 0;
        }   
    };

    var _drawMain = function(){

        isMobile = checkMobile();


        canvas = document.querySelector("#glCanvas");
        gl = canvas.getContext("webgl");
       

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

        if( isMobile === true ){
            console.log( 'mobile ');
            canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        }
        else{
            console.log( 'not mobile ');
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        }
        
       // canvas.addEventListener('touchstart', this.onMouseDown.bind(this));


      //  canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
     //   canvas.addEventListener('mouseup', this.onMouseDUp.bind(this));

        // canvas.addEventListener('touchmove', this.onMouseMove.bind(this));
        // canvas.addEventListener('touchend', this.onMouseDUp.bind(this));
    };


    var mouseDown = false;
    var prevPos = [0,0];
    var tempObj;
    _drawMain.prototype.onMouseDown = function(){

        console.log("mouseDown");
        mouseDown = true;
        prevPos = getMousePosition(event, canvas);

        var rayObj = camera.getTouchPointRay(prevPos);

        for(var i = 0;i < characters.length;i++ ){
            characters[i].checkRayCollision( rayObj );
        }
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
        var holeFileName = 'Model/hole';

       // var filename = 'Model/hole';

        //모델 생성
        var tempModel;
        for( var i = -1 ; i < 2 ; i ++){
            for( var j = 0 ; j< 3 ; j ++){
                tempModel = new ModelBase(filename);
                tempModel.moveTo( i * 2, j - 2, j * 1.5  );
                tempModel.setClipPlane(j - 1.2 );
                characters.push(tempModel);
                allObjects.push(tempModel);




                tempModel = new ModelBase(holeFileName);
                tempModel.moveTo( i * 2, j - 1.2, j * 1.5  );
                tempModel.scale(2, 1, 2);
                allObjects.push(tempModel);

            }
        }


        //업데이트 루프 시작
        requestAnimationFrame(this.update.bind(this));
    };

    var then = 0;
    _drawMain.prototype.update = function( now ){
        now *= 0.001;
        var deltaTime = now - then;
        then = now;


        for( var i = 0; i < characters.length ; i++){
            characters[i].update( deltaTime );
        }

        directionalLight.update( deltaTime );
        camera.update( deltaTime, deltaTime );




        renderer.draw( allObjects );
        requestAnimationFrame(this.update.bind(this));
    };


        return _drawMain;
})();








