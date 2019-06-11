var ModelBase = (function(){





    var model = function(fileName){

        this._bufferData = null;
        this._materialData = null;
        this._worldMatrix = null;
        this._readyToDraw = false;


        this._worldData = null;
        this._worldMatChanged = true;


        var self = this;




        var objPath = fileName + '.obj';
        var mtlPath = fileName + '.mtl';

        this._worldMatrix = mat4.create();

        this._worldData = {
            position : [0,0,0],
                scale : [1,1,1],
            rotation : [0,3.141592,0]
        };

        mat4.rotate(this._worldMatrix,  // destination matrix
            this._worldMatrix,  // matrix to rotate
            3.141592 ,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        this.bounce();
        Utils.readObj( objPath, function( result){

            self._bufferData = makeBuffer(result);
            self._readyToDraw = true;
        });

        Utils.readMtl( mtlPath, function(result){
            self._materialData = result;
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

        if(this._readyToDraw === false)
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


        if(this._worldMatChanged === true ){


            this._worldMatrix = mat4.create();

            mat4.translate(this._worldMatrix,
                this._worldMatrix,
                this._worldData.position
            );


            if(this._worldData.rotation[0] !== 0)
                mat4.rotate(this._worldMatrix,
                    this._worldMatrix,
                    this._worldData.rotation[0],
                    [1, 0, 0]);

            if(this._worldData.rotation[1] !== 0)
                mat4.rotate(this._worldMatrix,
                    this._worldMatrix,
                    this._worldData.rotation[1],
                    [0, 1, 0]);

            if(this._worldData.rotation[2] !== 0)
                mat4.rotate(this._worldMatrix,
                    this._worldMatrix,
                    this._worldData.rotation[2],
                    [0, 0, 1]);

            mat4.scale( this._worldMatrix,
                this._worldMatrix,
                this._worldData.scale
            );


          //  console.log( this._worldMatrix );
            this._worldMatChanged = false;
        }

        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uWorldMatrix'],
            false,
            this._worldMatrix);


        gl.uniform3fv(
            shaderInfo.uniformLocations['uDirectionalLight'],
            light.getDirection());


        for(var key in this._bufferData){


            gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferData[key].vertex);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['aVertexPosition'],
                3, // position x, y, z 3개
                gl.FLOAT,
                false,
                0,
                0);


            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexPosition']);



            gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferData[key].normal);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['aVertexNormal'],
                3,
                gl.FLOAT,
                true,
                0,
                0);
            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexNormal']);


            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._bufferData[key].index);


            gl.uniform3fv(
                shaderInfo.uniformLocations['uAmbient'],
                this._materialData[key]['Ka']);

            {
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;

                gl.drawElements(gl.TRIANGLES, this._bufferData[key].indexCount, type, offset);
            }
        }


        //  readyToDraw = false;
    };

    model.prototype.update = function( dt ){

            _bounceUpdate.call(this);
    };


    model.prototype.moveTo = function ( x, y, z){
        this._worldData.position = [x, y, z];
        this._worldMatChanged = true;
    };

    model.prototype.getWorldData = function(){
        return this._worldData;
    };

    model.prototype.rotate = function ( x, y, z){

        this._worldData.rotation[0] += 0.1 * x;
        this._worldData.rotation[1] += 0.1 * y;
        this._worldData.rotation[2] += 0.1 * z;
        this._worldMatChanged = true;

        // mat4.rotate(baseWorldMatrix,  // destination matrix
        //     baseWorldMatrix,  // matrix to rotate
        //     0.1 * x,// amount to rotate in radians
        //     [0, 1, 0]);       // axis to rotate around (X)
        //
        // worldMatrix = mat4.clone(baseWorldMatrix);
        // // mat4.rotate(worldMatrix,  // destination matrix
        // //     worldMatrix,  // matrix to rotate
        // //     0.01,// amount to rotate in radians
        // //     [1, 0, 0]);       // axis to rotate around (X)
    };

    model.prototype.scale = function( x, y, z ){
        this._worldData.scale=[ x, y, z];
        this._worldMatChanged = true;
    };


    model.prototype.bounce = function ( force ){
        this._bounceScale = 0.3;



    };

    var _bounceUpdate = function(){
        if(this._bounceScale >= 0){
            this._worldData.scale = [ 1 + this._bounceScale, 1 - this._bounceScale, 1 + this._bounceScale];
            this._worldMatChanged = true;
            this._bounceScale -= 0.03;
        }

    };



    return model;
})();