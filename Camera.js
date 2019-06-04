
var Camera = (function(){

    var fov = 0;
    var aspect = 0;
    var near = 0;
    var far = 0;
    var projectionMatrix = null;
    var viewMatrix = null;


    var _camera = function(){

        fov = 45 * Math.PI / 180;
        aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        near = 1.0;
        far = 100.0;

        projectionMatrix = mat4.create();
        viewMatrix = mat4.create();


        mat4.perspective(projectionMatrix,
            fov,
            aspect,
            near,
            far);

        mat4.translate(viewMatrix,     // destination matrix
            viewMatrix,     // matrix to translate
            [-0.0, 0.0, -6.0]);  // amount to translate


    };


    //캔버스 크기가 변경되면 카메라의 세팅도 변경되어야함
    _camera.prototype.resizeCanvas = function(){
        aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        mat4.perspective(projectionMatrix,
            fov,
            aspect,
            near,
            far);
    };

    _camera.prototype.GetProjectionMatrix = function(){
        return projectionMatrix;
    };


    _camera.prototype.GetViewMatrix = function(){
        return viewMatrix;
    };

    _camera.prototype.update = function( dt ){

    };


    return _camera;
})();