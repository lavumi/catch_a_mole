let ShaderUtil = {

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
        let buildShader = function(gl, type, source) {
            let shader = gl.createShader(type);
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
        let readShader = function (singleShaderData, cb) {
            let result = {};

            let paramCount = 0;

            for( let key in singleShaderData ){
                if(key.indexOf('Shader') !== -1){
                    paramCount++;
                    (function(shaderPath){
                        let request = new XMLHttpRequest();
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
        let createShader =  function( shaderObj,  cb){

            readShader( shaderObj ,
                function( shaderSource ){

                    let shaderProgram = gl.createProgram();
                    let vertexShader, fragShader;



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


                    let singleShaderInfo = {
                        program: shaderProgram,
                        attribLocations: { },
                        uniformLocations: {  },
                    };


                    let i ,locationName;
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




        let shaderInfo = {};
        let shaderCount = Object.keys(shaderData).length;
        for( let key in shaderData ){

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

let Utils = {



    objHash : {},

    /**
     * obj 파일 읽어서 버텍스, 노말, 인덱스 배열 오브젝트 반환
     * @param objPath
     * @param cb
     */
    readObj : function(objPath, cb) {


        if( this.objHash.hasOwnProperty( objPath )){
            cb( this.objHash[objPath] );
        }
        else{
            let     readObjData = function( objStr ){


                //임시로 저장해둘 배열
                let vertex_temp = [];
                // let texCoord_temp = [];
                let normal_temp = [];


                let resultObj = {};
                let targetMaterial = null;

                let hashData = {};
                let targetMaterialHashData = null;


                let aabbData = [999,-999,999,-999,999,-999];


                let quadIndex = [0, 1, 2, 0, 2, 3];

                // let tempArr = objStr.split('\n');
                let tempArr = Utils.stringSplit( objStr,'\n' );
                let tempArr_t;
                for( let i = 0; i < tempArr.length ; i++){
                    // tempArr_t = tempArr[i].split(' ');
                    tempArr_t = Utils.stringSplit( tempArr[i],' ' );
                    //    console.log(tempArr_t);
                    if( tempArr_t[0] === 'v'){

                        tempArr_t[1] /=100;
                        tempArr_t[2] /=100;
                        tempArr_t[3] /=100;

                        vertex_temp.push(tempArr_t[1] );
                        vertex_temp.push(tempArr_t[2] );
                        vertex_temp.push(tempArr_t[3] );


                        if( tempArr_t[1] - aabbData[0] < 0){
                            aabbData[0] = tempArr_t[1];
                        }
                        else if ( tempArr_t[1] - aabbData[1] > 0){
                            aabbData[1] = tempArr_t[1];
                        }

                        if( tempArr_t[2] - aabbData[2] < 0){
                            aabbData[2] = tempArr_t[2];

                        }
                        else if ( tempArr_t[2] - aabbData[3] > 0){
                            aabbData[3] = tempArr_t[2];

                        }

                        if( tempArr_t[3] - aabbData[4] < 0){
                            aabbData[4] = tempArr_t[3];

                        }
                        else if ( tempArr_t[3] - aabbData[5] > 0){
                            aabbData[5] = tempArr_t[3];

                        }
                    }
                    else if( tempArr_t[0] === 'vt'){
                        // texCoord_temp.push(tempArr_t[1]);
                        // texCoord_temp.push(tempArr_t[2]);
                    }
                    else if( tempArr_t[0] === 'vn'){
                        normal_temp.push(tempArr_t[1]);
                        normal_temp.push(tempArr_t[2]);
                        normal_temp.push(    tempArr_t[3]);
                    }
                    else if( tempArr_t[0] === 'f'){

                        for(let j = 0;j < quadIndex.length;j++){

                            if(targetMaterial === null){
                                console.warn("targetMaterial is null");
                                continue;
                            }
                            let triangleIndex = quadIndex[j] + 1;

                            let vIndex0 = tempArr_t[triangleIndex].split('/')[0] - 1;
                            let nIndex0 = tempArr_t[triangleIndex].split('/')[2] - 1;

                            let hashKey = (vIndex0 << 16) + nIndex0;
                            let index_temp = -1;

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
            let request = new XMLHttpRequest();
            let self = this;
            request.onreadystatechange = function () {
                if (request.readyState === 4) { //if this reqest is done
                    //add this file to the results object
                    let result = readObjData(request.responseText);

                    self.objHash[objPath] = result;
                    cb( result );
                }
            };
            request.open('GET', objPath, true);
            request.send();
        }


    },

    readMtl : function( mtlPath, cb ){
        let readMtlData = function( mtlStr ){
            let result ={};
            let tempArr = Utils.stringSplit( mtlStr,'\n' );
            let tempArr_t;
            let materialName = 'null';
            for( let i = 0; i < tempArr.length ; i++) {
               // console.log(tempArr[i]);
                tempArr_t = Utils.stringSplit( tempArr[i],' ' );
                if( tempArr_t[0] === 'newmtl'){
                    materialName = tempArr_t[1];
                    result[materialName] = {};
                }
                else if (tempArr_t[0] !== '#' ){
                    result[materialName][ tempArr_t[0]] = [];
                    for(let j = 1;j < tempArr_t.length;j++){
                        result[materialName][ tempArr_t[0]].push( tempArr_t[j] );
                    }
                }
            }

            return result;

        };



        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) { //if this reqest is done
                //add this file to the results object
                let result = readMtlData(request.responseText);
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
        let out = [] || pOut;
        let inverseMagnitude = 1.0 / this.magnitudeOfVector(v);
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
        let result = string.split(splitKey);

        for(let i = 0;i < result.length;i++){
            result[i] = result[i].trim();
        }

        result = result.filter( function( value){
            return value.length !== 0;
        });


        return result;
    },



    cross : function(out, a, b) {
        let ax = a[0],
            ay = a[1],
            az = a[2];
        let bx = b[0],
            by = b[1],
            bz = b[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    },

    dot : function( a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    vectorAdd : function(a, b){
        return [a[0] + b[0] , a[1] + b[1] , a[2] + b[2]];
    },


    transformMatrix : function(out, a, m) {
        let x = a[0],
        y = a[1],
        z = a[2];
        let w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return out;
    },




    /* Plucker coordinate 를 사용한 ray, plane 충돌 체크*/
    // 참고 : https://en.wikipedia.org/wiki/Pl%C3%BCcker_coordinates

    getPluckerCoord : function( a, b ){
        let cross = [];

        this.normalize( a, a);
        this.normalize( b, b);
        this.cross(cross, a, b);
        return {
            d : [a[0] - b[0],a[1] - b[1],a[2] - b[2]],
            m : cross
        }
    },

    getPluckerSide : function( a, b ){

        return this.dot(a.m, b.d) + this.dot(a.d , b.m);
    },

    intersectRayTriangle : function( rayData, triangle ){
        let origin = rayData.origin ;
        let dir = rayData.direction;

        let rayPluckerData = this.getPluckerCoord(origin, this.vectorAdd(origin , dir) );


        let trianglePluckerData = null;
        let pluckerSide = null;
        let prevSideData = null;
        for(let i = 0;i < triangle.length;i++){
            if( i !== triangle.length -1 ){
                trianglePluckerData = this.getPluckerCoord(triangle[i], triangle[i+1] ); 
            }
            else{
                trianglePluckerData = this.getPluckerCoord(triangle[i], triangle[0] ); 
            }
            pluckerSide = this.getPluckerSide(rayPluckerData, trianglePluckerData) > 0 ;

            if(prevSideData === pluckerSide || prevSideData === null){
                prevSideData = pluckerSide
            }
            else {
                return false;
            }
  

        }

        return true;

    },

};

