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
    var result = {};


    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) { //if this reqest is done
            //add this file to the results object
            result = request.responseText;
            onLoaded( result );
        }
    };
    request.open('GET', objPath, true);
    request.send();

}



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