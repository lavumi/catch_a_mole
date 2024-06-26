let ModelBase = (function(){


    let model = function(fileName){

        this._bufferData = null;
        this._materialData = null;
        this._worldMatrix = null;



        this._finishMaterialLoad = false;
        this._finishModelLoad = false;
        this._readyToDraw = false;
        this._worldData = null;
        this._worldMatChanged = true;

        this._shaderName = 'normalShader';
        this._shaderInfo = null;


        /**
         * 0 : minX,
         * 1 : maxX,
         * 2 : minY,
         * 3 : maxY,
         * 4 : minZ,
         * 5 : maxZ
         */
        this._aabbData = [0,0,0,0,0,0];
        this._baseAABB = [0,0,0,0,0,0];


        // [0] : 클립 할것인가 y : 1, n = 0
        // [1] : 클리핑할 면 y 값
        this.clipPlaneData = [0,0];

        let self = this;

        let objPath = fileName + '.obj';
        let mtlPath = fileName + '.mtl';


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

        Utils.readObj( objPath, function( result){


            self._baseAABB = result.aabbData;
        
            self._bufferData = _makeBuffer(result);
            self.initialFinishCallback(0);
        });

        Utils.readMtl( mtlPath, function(result){
            self._materialData = result;
            self.initialFinishCallback(1);
        });
    };

    let _makeBuffer = function(dataObj){

        let resultObj = {};

        for(let key in dataObj){

            if(key === 'aabbData')
                continue;

            let singleData = dataObj[key];
            let vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(singleData.vertex), gl.STATIC_DRAW);


            let normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(singleData.normal), gl.STATIC_DRAW);


            let indexBuffer = gl.createBuffer();
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

    // let _bounceUpdate = function(){
    //     if(this._bounceScale >= 0){
    //         this._worldData.scale = [ 1 + this._bounceScale, 1 - this._bounceScale, 1 + this._bounceScale];
    //         this._worldMatChanged = true;
    //         this._bounceScale -= 0.03;
    //     }
    //     if( this._movementY >= 0.1){
    //         this._worldData.position[1] += this._speed;
    //         this._worldMatChanged = true;
    //         this._movementY -= this._speed;
    //     }
    //     else if (this._movementY <= -0.1 ){
    //         this._worldData.position[1] -= this._speed;
    //         this._worldMatChanged = true;
    //         this._movementY += this._speed;
    //     }
    // };



    model.prototype.initialFinishCallback = function( loadtype ){
        if(loadtype === 0)
            this._finishModelLoad = true;
        else if( loadtype === 1)
            this._finishMaterialLoad = true;

        if( this._finishModelLoad === true &&
            this._finishMaterialLoad === true)
            this._readyToDraw = true;

    };

    model.prototype.draw = function( camera, light , renderer){



        if(this._readyToDraw === false){
            return;
        }
        let shaderInfo = renderer.getShaderInfo( this._shaderName );
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



            this._aabbData[0] = this._baseAABB[0] + this._worldData.position[0];
            this._aabbData[1] = this._baseAABB[1] + this._worldData.position[0];
            this._aabbData[2] = this._baseAABB[2] + this._worldData.position[1];
            this._aabbData[3] = this._baseAABB[3] + this._worldData.position[1];
            this._aabbData[4] = this._baseAABB[4] + this._worldData.position[2];
            this._aabbData[5] = this._baseAABB[5] + this._worldData.position[2];


            this._worldMatChanged = false;
        }

        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uWorldMatrix'],
            false,
            this._worldMatrix);


        gl.uniform3fv(
            shaderInfo.uniformLocations['uDirectionalLight'],
            light.getDirection());


        gl.uniform2fv(
            shaderInfo.uniformLocations['clipPlane'],
            this.clipPlaneData);



        for(let key in this._bufferData){


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

    // model.prototype.update = function( dt ){
    //
    //         _bounceUpdate.call(this);
    // };

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

    model.prototype.getAABB = function(){
        return this._aabbData
    };

    model.prototype.setClipPlane = function( y ){
        this.clipPlaneData = [1,y];
    };

    model.prototype.setShader = function( shaderName ){
        this._shaderName = shaderName;
    };

    return model;
})();

let setGameObject = function( obj ){
    obj.onMove = false;
    obj.startMoveUp = false;
    obj.baseY_Pos = 0;
    obj._speed = 5;

    let _bounceUpdate = function(dt){
        if(this._bounceScale >= 0){
            this._worldData.scale = [ 1 + this._bounceScale, 1 - this._bounceScale, 1 + this._bounceScale];
            this._worldMatChanged = true;
            this._bounceScale -= 0.03;
            return;
        }
        if( this.onMove === true ){
            this._movementY += this._speed * dt;
            let moveY = this._movementY;
            let addValue = 2 - Math.abs( 2 - moveY );
            this._worldData.position[1] = this.baseY_Pos + addValue;
            this._worldMatChanged = true;
            if( this._movementY >= 4 ){
                this._worldData.position[1] = this.baseY_Pos;
                this.onMove = false;
            }
        }

    };

    // obj.initialFinishCallback = function(){
    //     this.__proto__.initialFinishCallback.call(this);
    // };

    obj.update = function( dt ){
        _bounceUpdate.call(obj, dt);
    };


    obj.bounce = function ( ){
        this._bounceScale = 0.3;
    };

    obj.setUpMovement = function( ){
        if( this.onMove === true )
            return;
        this.baseY_Pos = this._worldData.position[1];
        this._movementY = 0;
        this.onMove = true;
        this._clicked = false;
    };


};


let addRayCheck = function(obj){

    obj._rayCheckArea = [];
    obj.setRayCheckArea = function( squareData ){
        this._rayCheckArea = squareData;
    };

    obj._clicked = false;
    obj.checkRayCollision = function ( rayData ){

        if(this._clicked === true )
            return;
            
        this._clicked = true;
        let RayCheckArea ;
        if(this._rayCheckArea.length !== 0){
            RayCheckArea = this._rayCheckArea;
        }
        else{
            let minX = this._aabbData[0];
            let minY = this._aabbData[2];
            let minZ = this._aabbData[4];
            let maxX = this._aabbData[1];
            let maxY = this._aabbData[3];
            let maxZ = this._aabbData[5];
    
            RayCheckArea = [
                [minX, minY, minZ],
                [minX, maxY, minZ],
                [maxX, maxY, maxZ],
                [maxX, minY, maxZ]
            ];
        }



        return Utils.intersectRayTriangle(rayData, RayCheckArea);
    };
}