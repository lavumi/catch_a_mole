var ModelBase = (function(){


    var GopherBufferData;
    var worldMatrix = null;
    var readyToDraw = false;

    var model = function(objPath){

        worldMatrix = mat4.create();
       readObj( objPath, function( result){

           GopherBufferData = makeBuffer(result);
           readyToDraw = true;
       });

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