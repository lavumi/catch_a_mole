let Ray = (function (){

    let _ray = function(){
        this._point = [0,0,0];
        this._direction = [1,0,0];

    };


    _ray.prototype.getRayData = function(){

        return {
            point : this._point,
            direction : this._direction
        }
    };

    _ray.prototype.setRayData = function( point, direction){

        this._point = point;
        this._direction = direction;
    };

    _ray.prototype.IntersectTriangle = function( triangleData ){



    };

    _ray.prototype.IntersectRectangle = function( rectangleData ){


    };

    return _ray;
})();