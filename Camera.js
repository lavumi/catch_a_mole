
var Camera = (function(){

    var projectionData = {
        fov: 0,
        aspect : 0,
        near : 0,
        far : 0
    };

    var projectionMatrix = null;
    var viewMatrix = null;



    var orbitalMoveData = {
          theta: 3.141592/2,
          pie : 0,
        radius : 6,
    };


    var _camera = function(){

        projectionData.fov = 45 * Math.PI / 180;
        projectionData.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        projectionData.near = 1.0;
        projectionData.far = 100.0;

        projectionMatrix = mat4.create();
        viewMatrix = mat4.create();


        mat4.perspective(projectionMatrix,
            projectionData.fov,
            projectionData.aspect,
            projectionData.near,
            projectionData.far);


        mat4.lookAt( viewMatrix, [ 0,0,-6], [ 0, 0, 0  ], [0,1,0] );

        // mat4.translate(viewMatrix,     // destination matrix
        //     viewMatrix,     // matrix to translate
        //     [-0.0, 0.0, -orbitalMoveData.radius]);  // amount to translate


    };


    //캔버스 크기가 변경되면 카메라의 세팅도 변경되어야함
    _camera.prototype.resizeCanvas = function(){
        projectionData.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        mat4.perspective(projectionMatrix,
            projectionData.fov,
            projectionData.aspect,
            projectionData.near,
            projectionData.far);
    };

    _camera.prototype.GetProjectionMatrix = function(){
        return projectionMatrix;
    };


    _camera.prototype.GetViewMatrix = function(){
        return viewMatrix;
    };

    _camera.prototype.update = function( dt ){

        this.addOrbitalMove( dt, dt, 0);
    };


    _camera.prototype.addOrbitalMove = function( dTheta, dPie , dRadius){
        var x, y, z;

        dRadius = 0;
        //orbitalMoveData.theta += dTheta;
        orbitalMoveData.pie += dPie ;
        orbitalMoveData.radius += dRadius;




        x = Math.sin(orbitalMoveData.theta) * Math.cos(orbitalMoveData.pie) * orbitalMoveData.radius;
        y = Math.sin(orbitalMoveData.theta) * Math.sin(orbitalMoveData.pie) * orbitalMoveData.radius;
        z = Math.cos(orbitalMoveData.theta) * orbitalMoveData.radius;


        // var out = [0,0,0];
        // Utils.cross(out, , [x, y, z]);
        // Utils.cross( out, out, [x, y, z]);
        // Utils.normalize( out, out);

var upVector = [0,Math.cos( orbitalMoveData.pie ),0];
        Utils.normalize( upVector, upVector);


        mat4.lookAt( viewMatrix, [ x, y, z], [ 0, 0, 0  ], upVector );
        //
        // mat4.translate(viewMatrix,     // destination matrix
        //     viewMatrix,     // matrix to translate
        //     [x, y, z]);  // amount to translate

    };

    return _camera;
})();