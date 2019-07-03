var Rectangle = (function(){

    var vertexCount = 0;



    var _rectangle = function( aabb){
       this.worldMatrix = mat4.create();

       this.buffer = null;

        if(!!aabb === true){
             this._aabbData = aabb;
        }
        else{
            this._aabbData = [0, 0.1,
                0, 0.1,
                0, 0.1];
        }

        this.makeBuffer();

    };

    _rectangle.prototype.makeBuffer = function() {

        if( this.buffer !== null )
            return;

        this.buffer =  {
            position: null,
            color : null,
            indices : null,
        };

        var minX = this._aabbData[0];
        var minY = this._aabbData[2];
        var minZ = this._aabbData[4];
        var maxX = this._aabbData[1];
        var maxY = this._aabbData[3];
        var maxZ = this._aabbData[5];

        const positions = [

            // // Back face
            minX, minY, minZ,
            minX, maxY, minZ,
            maxX, maxY, maxZ,
            maxX, minY, maxZ,

        ];

        vertexCount = 6;


        const faceColors = [
            [0.5,  0.5,  0.5,  1.0]
        ];

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
        ];


        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);



        var colors = [];
        for (var j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c, c);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);


        this.buffer.position = positionBuffer;
        this.buffer.color = colorBuffer;
        this.buffer.indices = indexBuffer;



    };

    _rectangle.prototype.draw = function( camera, light, shaderInfo ){

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



        if(shaderInfo.attribLocations.hasOwnProperty('aVertexColor')){

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.color);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations['aVertexColor'],
                4, // position r, g, b, a
                gl.FLOAT,
                true,
                0,
                0);


            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexColor']);
        }


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

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