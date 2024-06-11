let Cube = (function(){

    let vertexCount = 0;


    let buffer = null;

    let _cube = function( aabb){
       this.worldMatrix = mat4.create();


        if(!!aabb === true){
            this.aabb = aabb;
        }
        else{
            this.aabb = [0,0.1,0,0.1,0,0.1];
        }

    //    console.log( aabb );
        

        this.makeBuffer();

    };

    _cube.prototype.makeBuffer = function() {

        if( buffer !== null )
            return;

        buffer =  {
            position: null,
            color : null,
            indices : null,
        };

        let minX = this.aabb[0];
        let minY = this.aabb[2];
        let minZ = this.aabb[4];
        let maxX = this.aabb[1];
        let maxY = this.aabb[3];
        let maxZ = this.aabb[5];

        const positions = [

            // // Back face
            minX, minY, minZ,
            minX, maxY, minZ,
            maxX, maxY, minZ,
            maxX, minY, minZ,


          //  Front face
            minX, minY, maxZ,
            maxX, minY, maxZ,
            maxX, maxY, maxZ,
            minX, maxY, maxZ,


            
            // Top face
            minX, maxY, minZ,
            minX, maxY, maxZ,
            maxX, maxY, maxZ,
            maxX, maxY, minZ,
            
            // Bottom face
            minX, minY, minZ,
            maxX, minY, minZ,
            maxX, minY, maxZ,
            minX, minY, maxZ,
            
            // Right face
            maxX, minY, minZ,
            maxX, maxY, minZ,
            maxX, maxY, maxZ,
            maxX, minY, maxZ,
            
            // Left face
            minX, minY, minZ,
            minX, minY, maxZ,
            minX, maxY, maxZ,
            minX, maxY, minZ,
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



        let colors = [];
        for (let j = 0; j < faceColors.length; ++j) {
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

    _cube.prototype.draw = function( camera, light, shaderInfo ){

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
            this.worldMatrix);

        {

            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    };

    _cube.prototype.moveTo = function ( x, y, z){
        mat4.translate(this.worldMatrix,
            this.worldMatrix,
            [x, y, z]
        );
    };


    _cube.prototype.update = function( dt ){
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.03,     // amount to rotate in radians
        //     [0, 0, 1]);       // axis to rotate around (Z)
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.02,// amount to rotate in radians
        //     [0, 1, 0]);       // axis to rotate around (X)
        //
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.05,// amount to rotate in radians
        //     [1, 0, 0]);       // axis to rotate around (X)

    };
    return _cube;
})();