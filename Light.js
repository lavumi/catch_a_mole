var Light = (function(){

    var direction = [];

    var canvas;

    var _light = function(){
        canvas = document.querySelector("#glCanvas");
        direction = [0,0,0];
       // canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    };

    _light.prototype.setDirection = function(x, y, z){
        direction = [x,y,z];

      normalize(direction, direction);
    };

    _light.prototype.getDirection = function(){

        return direction;
    };


    var angle = 0;
    _light.prototype.update = function(dt ){

        var rotPos ;
        rotPos = [
            direction[0] * Math.cos(-Math.PI / 180 ) - direction[1] * Math.sin(-Math.PI / 180 ),
            direction[0] * Math.sin(-Math.PI / 180) + direction[1] * Math.cos(-Math.PI / 180 ),
            direction[2]
        ];
        direction = rotPos;
        rotPos = [
            direction[0],
            direction[1] * Math.cos(-Math.PI / 180) - direction[2] * Math.sin(-Math.PI / 180 ),
            direction[1] * Math.sin(-Math.PI / 180) + direction[2] * Math.cos(-Math.PI / 180 ),

        ];
        direction = rotPos;

            normalize(direction, direction);
       //
    };


    _light.prototype.onMouseMove = function( event){
        var position = getMousePosition(event, canvas);
        console.log(position);
        var pos = [position.x, position.y];
        normalize(pos, pos);
        direction = [pos[0], pos[1],1];
        normalize(direction, direction);
    };


    return _light;
})();