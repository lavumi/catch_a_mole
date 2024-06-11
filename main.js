//귀찮으니 이 둘은 전역으로...
let gl;
let canvas;

let Main = (function (){

    let directionalLight;
    let camera;
    let characters = [];
    let allObjects = [];
    let rayCheckObj = [];
    let renderer;


    let fontSystem ;
    let _drawMain = function(){
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

    let lastTouchEnd = 0;
    _drawMain.prototype.initInputEvent = function(){
        canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));

        canvas.addEventListener('touchend', function (event) {
            let now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    };


    let mouseDown = false;
    let prevPos = [0,0];
    let currentScore = 0;
    _drawMain.prototype.onMouseDown = function(){
        mouseDown = true;
        prevPos = getMousePosition(event, canvas);

        let rayObj = camera.getTouchPointRay(prevPos);

        for(let i = 0;i < rayCheckObj.length;i++ ){
            if( rayCheckObj[i].checkRayCollision( rayObj ) === true ){
                if( typeof rayCheckObj[i].bounce === 'function'){
                    currentScore ++;
                    fontSystem.setString(currentScore);
                    rayCheckObj[i].bounce();
                }
                break;
            }

        }
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





        let filename = 'Model/gopher_low';
        let holeFileName = 'Model/hole';

       // let filename = 'Model/hole';

        //모델 생성
        let tempModel;
        let rectangleArea;
        let i =0, j;
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


    let timeSpend = 0;

    let timeScale = 1;
    let _gameMainUpdate = function(dt){
        if(timeSpend <= 1){
            timeSpend += dt;
            return;
        }
        timeSpend = 0;


        for( let i = 0;i <= currentScore / 10  && i < 3; i++){
            let rnd = Math.floor(Math.random() * 9);
            characters[rnd].setUpMovement();
        }


    };

    let then = 0;
    _drawMain.prototype.update = function( now ){
        now *= 0.001;
        let deltaTime = now - then;
        then = now;

        deltaTime *= timeScale;

        timeScale = currentScore / 30 + 1;

        _gameMainUpdate(deltaTime);
        for( let i = 0; i < characters.length ; i++){
            characters[i].update( deltaTime );
        }

       // directionalLight.update( deltaTime );
        // camera.update( deltaTime, deltaTime );


        renderer.draw( allObjects );
        requestAnimationFrame(this.update.bind(this));
    };





    let gameTimeSpend = 0;
    _drawMain.prototype.gameMainUpdate = function( deltaTime ){

        gameTimeSpend += deltaTime;
        if( gameTimeSpend >= 1){

        }
    };

        return _drawMain;
})();








