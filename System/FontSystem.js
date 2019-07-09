var FontSystem = (function(){

    var FontAtlas ='image/digitalFont.png';
    var vertexCount = 0;

    function handleTextureLoaded(image, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._readyToDraw = true;
    }

    var  initTextures = function() {
        this.texture = gl.createTexture();
        this.image = new Image();
        var self = this;
        this.image.onload = function() {
            handleTextureLoaded.call(self,self.image, self.texture);
        };
        this.image.src = FontAtlas;
    };


    var fontBufferData = [
    ];


    var initFontBufferData = function(x, y){

        var width = 16, height = 25;
        var uvx1, uvx2, uvy1, uvy2;



        uvx1 = x / 128;
        uvx2 = uvx1 + width / 128;

        uvy2 = y / 128;
        uvy1 = uvy2 + height / 128;



        fontBufferData.push([
            uvx1, uvy1,
            uvx1, uvy2,
            uvx2, uvy2,
            uvx2, uvy1
        ]);



    };

    var _fontSystem = function(){

        this.buffer = null;
        this._shaderName = 'fontShader';

        this.position = [0,0];
        this.size = 1;

        initFontBufferData(18,0);
        initFontBufferData(36,0);
        initFontBufferData(54,0);
        initFontBufferData(72,0);
        initFontBufferData(90,0);
        initFontBufferData(108,0);
        initFontBufferData(0,26);
        initFontBufferData(18,26);
        initFontBufferData(36,26);
        initFontBufferData(54,26);



        this.makeBuffer();
        initTextures.call(this);

        this._readyToDraw = false;
    };


    _fontSystem.prototype.setPosition = function(x, y){
        this.position = [x, y];
    };

    _fontSystem.prototype.setSize = function(x){
        this.size = x;
    };

    _fontSystem.prototype.makeBuffer = function() {

        var pos = [
           0, 0.017,
           0, 0.025 ];
        if( this.buffer !== null )
            return;

        this.buffer =  {
            position: null,
            uv : null,
            indices : null,
        };

        const positions = [

            pos[0], pos[2],
            pos[0], pos[3],
            pos[1], pos[3],
            pos[1], pos[2],
        ];


        vertexCount = 6;

        const uv = fontBufferData[0];

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

    _fontSystem.prototype.draw = function( camera, light , renderer){

        if( this._readyToDraw === false)
            return;
        var shaderInfo = renderer.getShaderInfo( this._shaderName );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aPos'],
            2,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aPos']);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.uv);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aUV'],
            2,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aUV']);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);




        gl.useProgram(shaderInfo.program);

        gl.uniform3f(
            shaderInfo.uniformLocations['uiWorld'],
            this.position[0], this.position[1], this.size);

        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['projection'],
            false,
            camera.GetProjectionMatrix());



        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(shaderInfo.uniformLocations['texture'], 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


        {
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    };

    return _fontSystem;
})();