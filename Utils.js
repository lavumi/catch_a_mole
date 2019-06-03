function buildShader (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    //log any errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}

/**
 * 경로상의 파일 읽어서 반환
 * @param singleShaderData
 * @param onLoaded
 */
function readShader (singleShaderData, onLoaded) {
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
                            onLoaded( result );
                    }
                };
                request.open('GET', singleShaderData[shaderPath], true);
                request.send();
            })(key);
        }

    }
}

function readObj (objPath, onLoaded) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) { //if this reqest is done
            //add this file to the results object
            var result = readObjData(request.responseText);
            onLoaded( result );
        }
    };
    request.open('GET', objPath, true);
    request.send();
}

var readObjData = function( objStr ){

    var vertex_temp = [];
    var texCoord_temp = [];
    var normal_temp = [];
    var vertex = [];
    var normal = [];
    var indicies = [];

    var hashData = {};


    var quadIndex = [0, 1, 2, 0, 2, 3];





    var tempArr = objStr.split('\n');
    var tempArr_t;
    for( var i = 0; i < tempArr.length ; i++){
        tempArr_t = tempArr[i].split(' ');
        if( tempArr_t[0] === 'v'){
            vertex_temp.push(tempArr_t[2] / 100);
            vertex_temp.push(tempArr_t[3] / 100);
            vertex_temp.push(tempArr_t[4] / 100 );
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

                var triangleIndex = quadIndex[j] + 1;

                var vIndex0 = tempArr_t[triangleIndex].split('/')[0] - 1;
                var nIndex0 = tempArr_t[triangleIndex].split('/')[2] - 1;

                var hashKey = (vIndex0 << 16) + nIndex0;
                var index_temp = -1;

                if (hashData.hasOwnProperty( hashKey )){
                    indicies.push( hashData[hashKey]);
                }
                else{
                    index_temp = vertex.length / 3;
                    hashData[ hashKey ] = index_temp;
                    indicies.push( index_temp );
                    vertex.push(vertex_temp[vIndex0 * 3 ]);
                    vertex.push(vertex_temp[vIndex0 * 3 + 1 ]);
                    vertex.push(vertex_temp[vIndex0 * 3 + 2 ]);
                    normal.push(normal_temp[nIndex0 * 3]);
                    normal.push(normal_temp[nIndex0 * 3 + 1 ]);
                    normal.push(normal_temp[nIndex0 * 3 + 2 ]);

                }

            }
        }
    }

    return {
        vertexs : vertex,
        normals : normal,
        indices : indicies,
    }

};

function createShader( shaderObj,  cb){


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


}

function initShaders(shaderData, cb){

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

}


function magnitudeOfVector(v) {
    if(v.length === 3)
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    else if (v.length === 2 )
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] );
}

function normalize(out, v){
    var inverseMagnitude = 1.0 / magnitudeOfVector(v);
    out[0] = v[0] * inverseMagnitude;
    out[1] = v[1] * inverseMagnitude;
    if(v.length >= 2)
        out[2] = v[2] * inverseMagnitude;
    return out;
}