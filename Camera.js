
var Camera = (function(){

    var fov = 0;
    var aspect = 0;
    var near = 0;
    var far = 0;
    var projectionMatrix = null;
    var viewMatrix = null;


    var _camera = function( gl ){

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

    _camera.prototype.GetProjectionMatrix = function(){
        return projectionMatrix;
    };


    _camera.prototype.GetViewMatrix = function(){
        return viewMatrix;
    };


    return _camera;
})();