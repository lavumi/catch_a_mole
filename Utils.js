var ShaderUtil = {

    /**
     * 쉐이더 만들기
     * @param shaderData
     * @param cb
     */
    initShaders: function(shaderData, cb){

        /**
         *  parsed shader로 컴파일 하기
         * @param gl
         * @param type
         * @param source
         * @returns {WebGLShader}
         */
        var buildShader = function(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            //log any errors
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
            }
            return shader;
        };

        /**
         * 경로상의 쉐이더 파일 읽어서 반환
         * @param singleShaderData 쉐이더관련 오브젝트
         *   -------------- 형식 -----------------------
         *    쉐이더 이름: {
                            vertexShader: '버텍스 쉐이더 주소',
                            fragmentShader: '프레그먼트 쉐이더 주소',
                            attrInfo : 어트리뷰트 배열,
                            uniInfo : 유니폼 배열
              },
         * @param cb
         */
        var readShader = function (singleShaderData, cb) {
            var result = {};

            var paramCount = 0;

            for( var key in singleShaderData ){
                if(key.indexOf('Shader') !== -1){
                    paramCount++;
                    (function(shaderPath){
                        var request = new XMLHttpRequest();
                        request.onreadystatechange = function () {
                            if (request.readyState === 4) { //if this reqest is done
                                //add this file to the results object
                                result[shaderPath] = request.responseText;
                                paramCount--;
                                if(paramCount === 0)
                                    cb( result );
                            }
                        };
                        request.open('GET', singleShaderData[shaderPath], true);
                        request.send();
                    })(key);
                }

            }
        };

        /**
         * 버텍스, 프레그먼트 쉐이더를 연결, attribute, uniform 값들 주소 저장
         * @param shaderObj
         * @param cb
         */
        var createShader =  function( shaderObj,  cb){

            readShader( shaderObj ,
                function( shaderSource ){

                    var shaderProgram = gl.createProgram();
                    var vertexShader, fragShader;



                    if(shaderSource.hasOwnProperty('vertexShader')){
                        vertexShader = buildShader( gl,gl.VERTEX_SHADER, shaderSource['vertexShader'] );
                        gl.attachShader(shaderProgram, vertexShader);
                    }

                    if(shaderSource.hasOwnProperty('fragmentShader')){
                        fragShader = buildShader( gl,gl.FRAGMENT_SHADER, shaderSource['fragmentShader'] );
                        gl.attachShader(shaderProgram, fragShader);
                    }

                    gl.linkProgram(shaderProgram);

                    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                        cb( null );
                        return null;
                    }


                    var singleShaderInfo = {
                        program: shaderProgram,
                        attribLocations: { },
                        uniformLocations: {  },
                    };


                    var i ,locationName;
                    for( i = 0;i < shaderObj['attrInfo'].length; i++){
                        locationName = shaderObj['attrInfo'][i];
                        singleShaderInfo.attribLocations[ locationName ] = gl.getAttribLocation(shaderProgram, locationName);
                        if(singleShaderInfo.attribLocations[ locationName ] === -1 )
                            console.warn(locationName ,  " is not used in shader ");
                    }
                    for( i = 0;i < shaderObj['uniInfo'].length; i++){
                        locationName = shaderObj['uniInfo'][i];
                        singleShaderInfo.uniformLocations[ locationName ] = gl.getUniformLocation(shaderProgram, locationName);

                        if(singleShaderInfo.uniformLocations[ locationName ] === -1 )
                            console.warn(locationName ,  " is not used in shader ");
                    }

                    cb( singleShaderInfo );
                }
            );

        };




        var shaderInfo = {};
        var shaderCount = Object.keys(shaderData).length;
        for( var key in shaderData ){

            (function( shaderName){
                createShader(shaderData[shaderName],  function( result ){
                    shaderInfo[ shaderName ] = result;
                    shaderCount--;
                    if(shaderCount === 0)
                        cb(shaderInfo);
                });
            })( key);
        }

    },
};

var Utils = {


    /**
     * obj 파일 읽어서 버텍스, 노말, 인덱스 배열 오브젝트 반환
     * @param objPath
     * @param cb
     */
    readObj : function(objPath, cb) {
        var     readObjData = function( objStr ){


            //임시로 저장해둘 배열
            var vertex_temp = [];
            var texCoord_temp = [];
            var normal_temp = [];


            var resultObj = {};
            var targetMaterial = null;

            var hashData = {};
            var targetMaterialHashData = null;


            var aabbData = [0,0,0,0,0,0];


            var quadIndex = [0, 1, 2, 0, 2, 3];

           // var tempArr = objStr.split('\n');
            var tempArr = Utils.stringSplit( objStr,'\n' );
            var tempArr_t;
            for( var i = 0; i < tempArr.length ; i++){
               // tempArr_t = tempArr[i].split(' ');
                tempArr_t = Utils.stringSplit( tempArr[i],' ' );
            //    console.log(tempArr_t);
                if( tempArr_t[0] === 'v'){
                    vertex_temp.push(tempArr_t[1] / 100);
                    vertex_temp.push(tempArr_t[2] / 100);
                    vertex_temp.push(tempArr_t[3] / 100 );


                    if( tempArr_t[1] < aabbData[0] )
                        aabbData[0] = tempArr_t[1];
                    else if ( tempArr_t[1] > aabbData[1]){
                        aabbData[1] = tempArr_t[1];
                    }

                    if( tempArr_t[2] < aabbData[2] )
                        aabbData[2] = tempArr_t[2];
                    else if ( tempArr_t[2] > aabbData[3]){
                        aabbData[3] = tempArr_t[2];
                    }

                    if( tempArr_t[3] < aabbData[4] )
                        aabbData[4] = tempArr_t[3];
                    else if ( tempArr_t[3] > aabbData[5]){
                        aabbData[5] = tempArr_t[3];
                    }
                }
                else if( tempArr_t[0] === 'vt'){
                    texCoord_temp.push(tempArr_t[1]);
                    texCoord_temp.push(tempArr_t[2]);
                }
                else if( tempArr_t[0] === 'vn'){
                    normal_temp.push(tempArr_t[1]);
                    normal_temp.push(tempArr_t[2]);
                    normal_temp.push(    tempArr_t[3]);
                }
                else if( tempArr_t[0] === 'f'){

                    for(var j = 0;j < quadIndex.length;j++){

                        if(targetMaterial === null){
                            console.warn("targetMaterial is null");
                            continue;
                        }
                        var triangleIndex = quadIndex[j] + 1;

                        var vIndex0 = tempArr_t[triangleIndex].split('/')[0] - 1;
                        var nIndex0 = tempArr_t[triangleIndex].split('/')[2] - 1;

                        var hashKey = (vIndex0 << 16) + nIndex0;
                        var index_temp = -1;

                        if (targetMaterialHashData.hasOwnProperty( hashKey )){
                            targetMaterial.index.push( targetMaterialHashData[hashKey]);
                        }
                        else{
                            index_temp = targetMaterial.vertex.length / 3;
                            targetMaterialHashData[ hashKey ] = index_temp;
                            targetMaterial.index.push( index_temp );
                            targetMaterial.vertex.push(vertex_temp[vIndex0 * 3 ]);
                            targetMaterial.vertex.push(vertex_temp[vIndex0 * 3 + 1 ]);
                            targetMaterial.vertex.push(vertex_temp[vIndex0 * 3 + 2 ]);
                            targetMaterial.normal.push(normal_temp[nIndex0 * 3]);
                            targetMaterial.normal.push(normal_temp[nIndex0 * 3 + 1 ]);
                            targetMaterial.normal.push(normal_temp[nIndex0 * 3 + 2 ]);

                        }

                    }
                }
                else if( tempArr_t[0] === 'usemtl' ){
                    if( resultObj.hasOwnProperty(tempArr_t[1]) === false){
                        resultObj[ tempArr_t[1]] = {
                            vertex : [],
                            normal : [],
                            index : [],
                        };
                        hashData[ tempArr_t[1] ] = [];
                    }
                    targetMaterial = resultObj[ tempArr_t[1]];
                    targetMaterialHashData = hashData[ tempArr_t[1] ];
                }
            }

            resultObj.aabbData = aabbData;
            return resultObj;

        };


        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) { //if this reqest is done
                //add this file to the results object
                var result = readObjData(request.responseText);
                cb( result );
            }
        };
        request.open('GET', objPath, true);
        request.send();
    },

    readMtl : function( mtlPath, cb ){
        var readMtlData = function( mtlStr ){
            var result ={};
            var tempArr = Utils.stringSplit( mtlStr,'\n' );
            var tempArr_t;
            var materialName = 'null';
            for( var i = 0; i < tempArr.length ; i++) {
               // console.log(tempArr[i]);
                tempArr_t = Utils.stringSplit( tempArr[i],' ' );
                if( tempArr_t[0] === 'newmtl'){
                    materialName = tempArr_t[1];
                    result[materialName] = {};
                }
                else if (tempArr_t[0] !== '#' ){
                    result[materialName][ tempArr_t[0]] = [];
                    for(var j = 1;j < tempArr_t.length;j++){
                        result[materialName][ tempArr_t[0]].push( tempArr_t[j] );
                    }
                }
            }

            return result;

        };



        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) { //if this reqest is done
                //add this file to the results object
                var result = readMtlData(request.responseText);
                cb( result );
            }
        };
        request.open('GET', mtlPath, true);
        request.send();
    },

    /**
     * 백터 크기 반환
     * @param v
     * @returns {number}
     */
    magnitudeOfVector: function(v) {
        if(v.length === 3)
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        else if (v.length === 2 )
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] );
    },

    /**
     * 노말라이즈
     * @param pOut
     * @param v
     * @returns {*}
     */
    normalize: function(pOut, v){
        var out = [] || pOut;
        var inverseMagnitude = 1.0 / this.magnitudeOfVector(v);
        out[0] = v[0] * inverseMagnitude;
        out[1] = v[1] * inverseMagnitude;
        if(v.length >= 2)
            out[2] = v[2] * inverseMagnitude;
        return out;
    },


    /**
     * split 하고 빈칸 없에줌
     * @param string
     * @param splitKey
     * @returns {*}
     */
    stringSplit : function ( string, splitKey ){
        var result = string.split(splitKey);

        for(var i = 0;i < result.length;i++){
            result[i] = result[i].trim();
        }

        result = result.filter( function( value){
            return value.length !== 0;
        });


        return result;
    },



    cross : function(out, a, b) {
        var ax = a[0],
            ay = a[1],
            az = a[2];
        var bx = b[0],
            by = b[1],
            bz = b[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }
};

