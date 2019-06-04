var Square = (function(){


    var buffer = {
        position: null,
        color : null,
    };

    var _square = function(){

        this.makeBuffer();

    };

    _square.prototype.makeBuffer = function() {

        var positions = [
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];

        var positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        buffer['position'] = positionBuffer;


        var colors = [
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
        ];

        var colorBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(colors),
            gl.STATIC_DRAW);

        buffer['color'] = colorBuffer;

    };


    _square.prototype.draw = function( camera, shaderInfo ){


        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aVertexPosition'],
            2, // position x, y 2개
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
                4, // position r, g, b, a 4개
                gl.FLOAT,
                false,
                0,
                0);


            gl.enableVertexAttribArray(
                shaderInfo.attribLocations['aVertexColor']);
        }


        gl.useProgram(shaderInfo.program);
        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uProjectionMatrix'],
            false,
            camera.GetProjectionMatrix());


        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations['uModelViewMatrix'],
            false,
            camera.GetViewMatrix());

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }

    };

    return _square;
})();