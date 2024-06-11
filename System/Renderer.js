

let Renderer = (function (){

    let shaderData;
    let light;
    let camera;


    //기본 배경 색상
    let clearColor = {
        r : 0,
        g : 0,
        b : 0,
        a : 1
    };

    /**
     * 렌더러 생성(쉐이더 데이터)
     * @param cb 생성후 실행할 콜백
     * @private
     */
    let _renderer = function(cb){


        //화면 리사이즈 할때 크기 조정
        window.addEventListener('resize', resizeCanvas, false);

        //화면 클리어 및 기본 클리어 색상 지정하기
        this.clearScreen( 1, 1, 1, 1);

        //쉐이더 데이터 obj 만들기
        let shaders = {
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
                uniInfo : ['uAmbient', 'uDiffuse', 'uSpecular','clipPlane', 'uWorldMatrix','uViewMatrix', 'uProjectionMatrix', 'uDirectionalLight']
            },
            textureShader: {
                vertexShader: 'shader/simpleTextureShader.vert',
                fragmentShader: 'shader/simpleTextureShader.frag',
                attrInfo : ['aVertexPosition', 'uv'],
                uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix', 'text' ]
            },
            fontShader: {
                vertexShader: 'shader/fontShader.vert',
                fragmentShader: 'shader/fontShader.frag',
                attrInfo : ['aPos', 'aUV'],
                uniInfo : ['uiWorld', 'projection', 'text', 'textColor']
            },
        };

        //쉐이더 비동기로 생성후 콜백 실행
        ShaderUtil.initShaders(shaders, function( result ){
                shaderData = result;
                cb();
            }.bind(this)
        );
    };

    //region [Private Functions]
    let resizeCanvas = function(){
        canvas.width = window.innerWidth - 40;
        canvas.height = window.innerHeight - 40;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        camera.resizeCanvas();
    };

    //endregion


    _renderer.prototype.getShaderInfo = function( shaderName ){
        if( shaderData.hasOwnProperty( shaderName ))
            return shaderData[shaderName];
        else
            return null;
    };


    /**
     * 화면 그리는 함수
     * @param objects
     */
    _renderer.prototype.draw = function(objects){
        this.clearScreen();
        let renderer = this;
        for( let i = 0; i < objects.length ; i++){

            (function(index){
                objects[index].draw( camera,light, renderer);
            })(i);
        }
    };

    /**
     * 화면 클리어 함수
     * @param r
     * @param g
     * @param b
     * @param a
     */
    _renderer.prototype.clearScreen = function( r, g, b, a ) {

        if( !!r && !!g && !!b && !!a){
            clearColor.r = r;
            clearColor.g = g;
            clearColor.b = b;
            clearColor.a = a;
        }

        //클리어 칼라 등록
        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);


        //깊이버퍼 삭제
        gl.clearDepth(1.0);
        //깊이 테스트 켜기
        gl.enable(gl.DEPTH_TEST);

        //깊이 버퍼 less equal 로 세팅
        gl.depthFunc(gl.LEQUAL);



        //캔버스 클리어
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    };

    _renderer.prototype.setLight = function( pLight ){
        light = pLight;
    };

    /**
     * 카메라 세팅후 화면 리사이즈 한번 해주자(필요 없을수도 있음) (여러대의 카메라 등록시 변경 필요)
     * @param pCamera
     */
    _renderer.prototype.setCamera= function( pCamera ){
        camera = pCamera;
        resizeCanvas();
    };

    return _renderer;
}());