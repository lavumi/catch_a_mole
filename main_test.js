
var testObject = (function(){
    var _data;

    var _object = function(){

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


return _object;
})();


var MainTest = (function(){

    var _testMain = function(){

        var obj1 = new testObject();

        var obj2 = new testObject();


        obj2.setData();


        console.log( obj1.getData());


        console.log( obj1, obj2);

    };

    return _testMain;
})();
