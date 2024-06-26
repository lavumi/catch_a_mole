let Rectangle = (function(){

    let vertexCount = 0;

    function handleTextureLoaded(image, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._readyToDraw = true;
    }

    let  initTextures = function() {
        this.texture = gl.createTexture();
        this.image = new Image();
        let self = this;
        this.image.onload = function() {
            handleTextureLoaded.call(self,self.image, self.texture);
        };
        this.image.src = "Image/cubetexture.png";
    };

    let _rectangle = function( aabb){
       this.worldMatrix = mat4.create();

       this.buffer = null;
        this._shaderName = 'textureShader';
        if(!!aabb === true){
             this._aabbData = aabb;
        }
        else{
            this._aabbData = [0, 0.1,
                0, 0.1,
                0, 0.1];
        }

        this.makeBuffer();
        initTextures.call(this);

        this._readyToDraw = false;

    };

    _rectangle.prototype.makeBuffer = function() {

        if( this.buffer !== null )
            return;

        this.buffer =  {
            position: null,
            uv : null,
            indices : null,
        };

        let minX = this._aabbData[0];
        let minY = this._aabbData[2];
        let minZ = this._aabbData[4];
        let maxX = this._aabbData[1];
        let maxY = this._aabbData[3];
        const positions = [

            // // Back face
            minX, minY, minZ,
            minX, maxY, minZ,
            maxX, maxY, minZ,
            maxX, minY, minZ,

        ];

        vertexCount = 6;


        const uv = [
           0,0,
            0,1,
            1,1,
            1,0
        ];

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
        ];


        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);




        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);




        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);


        this.buffer.position = positionBuffer;
        this.buffer.uv = uvBuffer;
        this.buffer.indices = indexBuffer;



    };

    _rectangle.prototype.draw = function( camera, light , renderer){

        if( this._readyToDraw === false)
             return;

        let shaderInfo = renderer.getShaderInfo( this._shaderName );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aVertexPosition'],
            3, // position x, y, z 3개
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aVertexPosition']);



        if(shaderInfo.attribLocations.hasOwnProperty('uv')){

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.uv);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['uv'],
                2,
                gl.FLOAT,
                true,
                0,
                0);


            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['uv']);
        }


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);







        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);


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
            this.worldMatrix);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(shaderInfo.uniformLocations['texture'], 0);

        {

            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    };

    _rectangle.prototype.moveTo = function ( x, y, z){
        mat4.translate(this.worldMatrix,
            this.worldMatrix,
            [x, y, z]
        );
    };
    return _rectangle;
})();