var Cube = (function(){

    var vertexCount = 0;
    var worldMatrix = null;

    var buffer = {
        position: null,
        color : null,
        indices : null,
    };

    var _cube = function(){
        worldMatrix = mat4.create();


        this.makeBuffer();

    };

    _cube.prototype.makeBuffer = function() {

        const positions = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];


        vertexCount = 36;


        const faceColors = [
            [0.5,  0.5,  0.5,  1.0],
            [1.0,  0.0,  0.0,  1.0],
            [0.0,  1.0,  0.0,  1.0],
            [0.0,  0.0,  1.0,  1.0],
            [1.0,  1.0,  0.0,  1.0],
            [1.0,  0.0,  1.0,  1.0],
        ];

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
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


        buffer.position = positionBuffer;
        buffer.color = colorBuffer;
        buffer.indices = indexBuffer;



    };

    _cube.prototype.draw = function( camera, shaderInfo ){


        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
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

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
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


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);

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

        {

            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    };


    _cube.prototype.update = function( dt ){
        mat4.rotate(worldMatrix,  // destination matrix
            worldMatrix,  // matrix to rotate
            0.03,     // amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (Z)
        mat4.rotate(worldMatrix,  // destination matrix
            worldMatrix,  // matrix to rotate
            0.02,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        mat4.rotate(worldMatrix,  // destination matrix
            worldMatrix,  // matrix to rotate
            0.05,// amount to rotate in radians
            [1, 0, 0]);       // axis to rotate around (X)

    };
    return _cube;
})();