
let testObject = (function(){
    let _data;

    let _object = function(){

        this._data = 0;
        _data = 0;
    };


    _object.prototype.setData = function(){
        _data = 1;
        this._data  = 1;
    };

    _object.prototype.getData = function(){
        return this._data;
    };

    _object.prototype.getClosureData = function(){
        return _data;
    };

return _object;
})();


let MainTest = (function(){

    return function () {

        let obj1 = new testObject();

        let obj2 = new testObject();

        obj2.setData();

        console.log(obj1.getData());

        console.log(obj1, obj2);
    };
})();
