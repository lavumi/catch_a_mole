var ModelBase = (function(){


    var GopherBufferData;
    var MaterialData;
    var worldMatrix = null;
    var baseWorldMatrix = null;
    var readyToDraw = false;


    var model = function(objPath){

       worldMatrix = mat4.create();



       baseWorldMatrix = mat4.clone( worldMatrix );


        mat4.rotate(baseWorldMatrix,  // destination matrix
            baseWorldMatrix,  // matrix to rotate
            3.141592 ,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

       this.bounce();
       Utils.readObj( objPath, function( result){

           GopherBufferData = makeBuffer(result);
           readyToDraw = true;
       });

       Utils.readMtl( 'Model/gopher.mtl', function(result){
           MaterialData = result;
       });
    };


    var makeBuffer = function(dataObj){

        var resultObj = {};

        for(var key in dataObj){

            var singleData = dataObj[key];
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(singleData.vertex), gl.STATIC_DRAW);


            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(singleData.normal), gl.STATIC_DRAW);


            var indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(singleData.index), gl.STATIC_DRAW);




            resultObj[key] = {
                vertex : vertexBuffer,
                normal : normalBuffer,
                index : indexBuffer,
                indexCount : singleData.index.length
            }

        }

        return resultObj;
    };

    model.prototype.draw = function( camera, light, shaderInfo ){

        if(readyToDraw === false)
            return;



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







        for(var key in GopherBufferData){


            gl.bindBuffer(gl.ARRAY_BUFFER, GopherBufferData[key].vertex);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['aVertexPosition'],
                3, // position x, y, z 3개
                gl.FLOAT,
                false,
                0,
                0);


            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexPosition']);



            gl.bindBuffer(gl.ARRAY_BUFFER, GopherBufferData[key].normal);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['aVertexNormal'],
                3,
                gl.FLOAT,
                true,
                0,
                0);
            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexNormal']);


            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GopherBufferData[key].index);


            gl.uniform3fv(
                shaderInfo.uniformLocations['uAmbient'],
                MaterialData[key]['Ka']);

            {

                const type = gl.UNSIGNED_SHORT;
                const offset = 0;

                gl.drawElements(gl.TRIANGLES, GopherBufferData[key].indexCount, type, offset);
            }
        }


        //  readyToDraw = false;
    };

    model.prototype.update = function( dt ){

        if( onBounce === true ){
             mat4.scale(worldMatrix,
                 baseWorldMatrix,
                 [1 + bounceScale  , 1 - bounceScale , 1 +bounceScale]);

             bounceScale -= 0.03;

             console.log(' update boundScale ', 1 - bounceScale);
        }

        if(bounceScale <= 0){
            onBounce = false;
        }


    };

    model.prototype.rotate = function ( y, x){

        mat4.rotate(baseWorldMatrix,  // destination matrix
            baseWorldMatrix,  // matrix to rotate
            0.1 * y,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        worldMatrix = mat4.clone(baseWorldMatrix);
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,// amount to rotate in radians
        //     [1, 0, 0]);       // axis to rotate around (X)
    };




    var onBounce = false;
    var bounceScale = 0;
    model.prototype.bounce = function ( force ){

        onBounce = true;
        bounceScale = 0.3;

       // bounceScale += 0.01 * dt;
       //  mat4.scale(worldMatrix,
       //      worldMatrix,
       //      [1 , 2, 1 ]);
    };



    return model;
})();