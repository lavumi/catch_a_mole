var Sphere = (function(){

    var vertexCount = 0;
    var indexCount = 0;
    var positions = [];
    var normals = [];
    var indices = [];
    var recursionLevel = 0;

    var radius = 1;

    var worldMatrix = null;


    var buffer = {
        position: null,
        normal : null,
        indices : null,
    };

    var Sphere = function( detail ){
        worldMatrix = mat4.create();
        if(isNaN(detail) === false)
            recursionLevel = 2;

        this.makeBuffer();

    };

    /**
     * 인덱스 2개를 받아 해당 버텍스 둘의 중간 버텍스를 잡고, 그것을 positions에 추가한뒤 해당 인덱스 반환
     * @param p1  vertexIndex
     * @param p2
     */

    var middlePointCash = {};

    var getMiddlePoint = function(p1, p2){
        var p1x, p1y, p1z;
        var p2x, p2y, p2z;


        p1x = positions[p1 * 3];
        p1y = positions[p1 * 3+1];
        p1z = positions[p1 * 3+2];

        p2x = positions[p2 * 3];
        p2y = positions[p2 * 3+1];
        p2z = positions[p2 * 3+2];

        var isSmall = p1 < p2;

        var smallerIndex = isSmall ? p1 : p2;
        var greaterIndex = isSmall ? p2 : p1;

        var hashKey = (smallerIndex << 16) + greaterIndex;
        if( middlePointCash.hasOwnProperty(hashKey) ){
           // console.log('MiddlePoint return : ' , middlePointCash[hashKey]);
            return middlePointCash[hashKey];
        }
        else{
            var pos = [
                (p1x + p2x) / 2,
                (p1y + p2y) / 2,
                (p1z + p2z) / 2];

            normalize(pos, pos);
            normals = normals.concat(pos);


            pos[0] *= radius;
            pos[1] *= radius;
            pos[2] *= radius;

            middlePointCash[hashKey] = positions.length / 3;
            positions = positions.concat(pos);

           // console.log('MiddlePoint made : ' , middlePointCash[hashKey]);
            return middlePointCash[hashKey];

        }
    };


    var addVertexData = function( data){
        var pos = [];
        normalize(pos, data);
        normals = normals.concat(pos);


        pos[0] *= radius;
        pos[1] *= radius;
        pos[2] *= radius;
        positions = positions.concat(pos);
    };

    Sphere.prototype.makeBuffer = function(){

        var t = (1.0 + Math.sqrt(5.0)) / 2.0;



        addVertexData([-1,  t,  0]);
        addVertexData([ 1,  t,  0]);
        addVertexData([-1, -t,  0]);
        addVertexData([ 1, -t,  0]);
        addVertexData([ 0, -1,  t]);
        addVertexData([ 0,  1,  t]);
        addVertexData([ 0, -1, -t]);
        addVertexData([ 0,  1, -t]);
        addVertexData([ t,  0, -1]);
        addVertexData([ t,  0,  1]);
        addVertexData([-t,  0, -1]);
        addVertexData([-t,  0,  1]);


        // 5 faces around point 0
        indices = indices.concat([0, 11, 5]);
        indices = indices.concat([0, 5, 1]);
        indices = indices.concat([0, 1, 7]);
        indices = indices.concat([0, 7, 10]);
        indices = indices.concat([0, 10, 11]);


        // // 5 adjacent faces
        indices = indices.concat([1, 5, 9]);
        indices = indices.concat([5, 11, 4]);
        indices = indices.concat([11, 10, 2]);
        indices = indices.concat([10, 7, 6]);
        indices = indices.concat([7, 1, 8]);

        // 5 faces around point 3
        indices = indices.concat([3, 9, 4]);
        indices = indices.concat([3, 4, 2]);
        indices = indices.concat([3, 2, 6]);
        indices = indices.concat([3, 6, 8]);
        indices = indices.concat([3, 8, 9]);

        // 5 adjacent faces
        indices = indices.concat([4, 9, 5]);
        indices = indices.concat([2, 4, 11]);
        indices = indices.concat([6, 2, 10]);
        indices = indices.concat([8, 6, 7]);
        indices = indices.concat([9, 8, 1]);


        for( var i = 0;i < recursionLevel;i++ ){
            var newIndices = [];
            for( var j = 0;j < indices.length; j += 3){
                var a = getMiddlePoint(indices[j], indices[j+1]);
                var b = getMiddlePoint(indices[j+2], indices[j+1]);
                var c = getMiddlePoint(indices[j], indices[j+2]);

              //  console.log(indices[j], indices[j+1],indices[j+2], a, b, c );

                newIndices = newIndices.concat([ indices[j], a, c]);
                newIndices = newIndices.concat([ indices[j+1], b, a]);
                newIndices = newIndices.concat([ indices[j+2], c, b]);
                newIndices = newIndices.concat([ a, b,c]);
            }
            indices = newIndices;
        }




        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);



        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);



        vertexCount = positions.length;
        indexCount = indices.length ;

        console.log(indexCount);
        buffer.position = positionBuffer;
        buffer.normal = normalBuffer;
        buffer.indices = indexBuffer;
    };





    Sphere.prototype.draw = function( camera, light, shaderInfo ){


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






        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations['aVertexNormal'],
            3,
            gl.FLOAT,
            true,
            0,
            0);
        gl.enableVertexAttribArray(
            shaderInfo.attribLocations['aVertexNormal']);




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


        gl.uniform3fv(
            shaderInfo.uniformLocations['uDirectionalLight'],
            light.getDirection());


        {

            const type = gl.UNSIGNED_SHORT;
            const offset = 0;

            gl.drawElements(gl.TRIANGLE_STRIP, indexCount, type, offset);
        }

    };

    Sphere.prototype.update = function( dt ){
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,     // amount to rotate in radians
        //     [0, 0, 1]);       // axis to rotate around (Z)
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,// amount to rotate in radians
        //     [0, -1, 0]);       // axis to rotate around (X)
        //
        // mat4.rotate(worldMatrix,  // destination matrix
        //     worldMatrix,  // matrix to rotate
        //     0.01,// amount to rotate in radians
        //     [1, 0, 0]);       // axis to rotate around (X)

    };

    return Sphere;
})();