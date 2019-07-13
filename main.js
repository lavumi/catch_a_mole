//귀찮으니 이 둘은 전역으로...
var gl;
var canvas;

var Main = (function (){

    var directionalLight;
    var camera;
    var characters = [];
    var allObjects = [];
    var rayCheckObj = [];
    var renderer;


    var fontSystem ;
    var isMobile = true;


    var checkMobile = function(){
        var filter = "win16|win32|win64|mac";
        if (navigator.platform ) {   
            console.log(navigator.platform ); 
            console.log(filter.indexOf(navigator.platform.toLowerCase()) );      
            return filter.indexOf(navigator.platform.toLowerCase()) < 0;
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

    var timeSpend = 0;
    var testValue = 0;
    var _gameMainUpdate = function(dt){
        if(timeSpend <=1){
            timeSpend += dt;
            return;
        }

        timeSpend = 0;
        var rnd = Math.floor(Math.random() * 9);

        characters[rnd].setUpMovement();

    };

    //region [Mouse Event]

    var lastTouchEnd = 0;
    _drawMain.prototype.initInputEvent = function(){

        if( isMobile === true ){
            console.log( 'mobile ');
            canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        }
        else{
            console.log( 'not mobile ');
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        }

        canvas.addEventListener('touchend', function (event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        //
        // canvas.addEventListener('touchmove', function (event) {
        //     if (event.scale !== 1) { event.preventDefault(); }
        // }, { passive: false });
    };


    var mouseDown = false;
    var prevPos = [0,0];
    _drawMain.prototype.onMouseDown = function(){
        mouseDown = true;
        prevPos = getMousePosition(event, canvas);

        var rayObj = camera.getTouchPointRay(prevPos);

        for(var i = 0;i < rayCheckObj.length;i++ ){
            if( rayCheckObj[i].checkRayCollision( rayObj ) === true ){
                if( typeof rayCheckObj[i].bounce === 'function'){
                    fontSystem.setString(testValue);
                    testValue ++;
                    rayCheckObj[i].bounce();
                }
                break;
            }

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
        var rectangleArea;
        var i =0, j = 0;
        for(j = 0 ; j< 3 ; j ++){
        //세로 칸막이 배경 생성
            rectangleArea = [
                -3,         3,
                -3+j,       -2+j,
                -1 + j * 2,   -1 + j * 2
            ];
            tempModel = new Rectangle(rectangleArea);

            addRayCheck( tempModel );
            rayCheckObj.push(tempModel);
            allObjects.push(tempModel);

            for( i = -1 ; i < 2 ; i ++){

                //두더지 모델 생성
                tempModel = new ModelBase(filename);
                tempModel.moveTo( i * 2, j - 4, j * 2  );
                tempModel.setClipPlane(j - 2 );

                setGameObject(tempModel );
                addRayCheck( tempModel );

                characters.push(tempModel);
                rayCheckObj.push(tempModel);
                allObjects.push(tempModel);                

                //가로 구멍 배경 생성
                tempModel = new ModelBase(holeFileName);
                tempModel.moveTo( i * 2, j - 2, j * 2 );
                tempModel.scale(2, 1, 2);
                allObjects.push(tempModel);

            }
        }


        fontSystem = new FontSystem();
        fontSystem.setPosition(0,0.2);
        fontSystem.setSize( 2);
        allObjects.push(fontSystem);

        //업데이트 루프 시작
        requestAnimationFrame(this.update.bind(this));
    };


    var then = 0;
    _drawMain.prototype.update = function( now ){
        now *= 0.001;
        var deltaTime = now - then;
        then = now;

        _gameMainUpdate(deltaTime);
        for( var i = 0; i < characters.length ; i++){
            characters[i].update( deltaTime );
        }

        // directionalLight.update( deltaTime );
        // camera.update( deltaTime, deltaTime );


        renderer.draw( allObjects );
        requestAnimationFrame(this.update.bind(this));
    };





    var gameTimeSpend = 0;
    _drawMain.prototype.gameMainUpdate = function( deltaTime ){

        gameTimeSpend += deltaTime;
        if( gameTimeSpend >= 1){

        }
    };

        return _drawMain;
})();








