var Light = (function(){

    var direction = [];


    var _light = function(){
       direction = [0,0,0];
    };


    _light.prototype.setDirection = function(x, y, z){
        direction = [x,y,z];
        Utils.normalize(direction, direction);
    };

    _light.prototype.getDirection = function(){

        return direction;
    };


    _light.prototype.update = function( deltaTime ){

        var dt = deltaTime * 1000;
        var rotPos ;
        // rotPos = [
        //     direction[0] * Math.cos(-Math.PI / 180 ) - direction[1] * Math.sin(-Math.PI / 180 ),
        //     direction[0] * Math.sin(-Math.PI / 180) + direction[1] * Math.cos(-Math.PI / 180 ),
        //     direction[2]
        // ];
        // direction = rotPos;
        rotPos = [
            direction[0],
            direction[1] * Math.cos(-Math.PI / 180 * dt) - direction[2] * Math.sin(-Math.PI / 180 * dt),
            direction[1] * Math.sin(-Math.PI / 180 * dt) + direction[2] * Math.cos(-Math.PI / 180 * dt),
        
        ];
        direction = rotPos;
        
        Utils.normalize(direction, direction);
       //
    };


    _light.prototype.onMouseMove = function( event){
        var position = getMousePosition(event, canvas);
        console.log(position);
        var pos = [position.x, position.y];
        Utils.normalize(pos, pos);
        direction = [pos[0], pos[1],1];
        Utils.normalize(direction , direction);
    };


    return _light;
})();