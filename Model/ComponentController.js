var ModelBase = (function(){


    var GopherBufferData;
    var worldMatrix = null;
    var readyToDraw = false;

    var model = function(objPath){

        worldMatrix = mat4.create();
       readObj( objPath, function( result){
          // console.log( result );
           var objData = readVertex(result);
           GopherBufferData = makeBuffer(objData);
           readyToDraw = true;
       });

    };




    var readVertex = function( objStr ){

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


                // var vIndex0 = tempArr_t[1].split('/')[0] - 1;
                // var nIndex0 = tempArr_t[1].split('/')[2] - 1;

                // var vIndex1 = tempArr_t[2].split('/')[0] - 1;
                // var nIndex1 = tempArr_t[2].split('/')[2] - 1;
                //
                // var vIndex2 = tempArr_t[3].split('/')[0] - 1;
                // var nIndex2 = tempArr_t[3].split('/')[2] - 1;
                //
                //
                // var vIndex3 = tempArr_t[4].split('/')[0] - 1;
                // var nIndex3 = tempArr_t[4].split('/')[2] - 1;
                //
                //
                //
                // vertIndices.push(vIndex0);
                // vertIndices.push(vIndex1);
                // vertIndices.push(vIndex2);
                //
                // normalIndices.push(nIndex0);
                // normalIndices.push(nIndex1);
                // normalIndices.push(nIndex2);
                //
                //
                // if( tempArr_t.length > 4){
                //
                //     vertIndices.push(vIndex0);
                //     vertIndices.push(vIndex2);
                //     vertIndices.push(vIndex3);
                //
                //     normalIndices.push(nIndex0);
                //     normalIndices.push(nIndex2);
                //     normalIndices.push(nIndex3);
                // }
            }
        }


        console.log(vertex);
        console.log(normal);
        console.log(indicies);

        return {
            vertexs : vertex,
          //  texCoord : texCoord,
            normals : normal,
            indices : indicies,
        }

    };

    var makeBuffer = function(objData){


        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objData.vertexs), gl.STATIC_DRAW);


        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objData.normals), gl.STATIC_DRAW);


        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(objData.indices), gl.STATIC_DRAW);




        return {
            vertex : vertexBuffer,
            normal : normalBuffer,
            index : indexBuffer,
            indexCount : objData.indices.length
        }
    };

    model.prototype.draw = function( camera, light, shaderInfo ){

        if(readyToDraw === false)
            return;

        gl.bindBuffer(gl.ARRAY_BUFFER, GopherBufferData.vertex);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aVertexPosition'],
            3, // position x, y, z 3개
            gl.FLOAT,
            false,
            0,
            0);


        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aVertexPosition']);



        gl.bindBuffer(gl.ARRAY_BUFFER, GopherBufferData.normal);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aVertexNormal'],
            3,
            gl.FLOAT,
            true,
            0,
            0);
        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aVertexNormal']);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GopherBufferData.index);
       // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GopherBufferData.nIndex);

        gl.useProgram(shaderInfo.program);


        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uProjectionMatrix'],
            false,
            camera.GetProjectionMatrix());


        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uViewMatrix'],
            false,
            camera.GetViewMatrix());


        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uWorldMatrix'],
            false,
            worldMatrix);


        gl.uniform3fv(
            shaderInfo.uniformLocations['uDirectionalLight'],
            light.getDirection());


        {

            const type = gl.UNSIGNED_SHORT;
            const offset = 0;

            gl.drawElements(gl.TRIANGLES, GopherBufferData.indexCount, type, offset);
        }

      //  readyToDraw = false;
    };

    model.prototype.update = function( dt ){
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,     // amount to rotate in radians
        //     [0, 0, 1]);       // axis to rotate around (Z)
        mat4.rotate(worldMatrix,  // destination matrix
            worldMatrix,  // matrix to rotate
            0.01,// amount to rotate in radians
            [0, -1, 0]);       // axis to rotate around (X)

        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,// amount to rotate in radians
        //     [1, 0, 0]);       // axis to rotate around (X)

    };

    return model;
})();