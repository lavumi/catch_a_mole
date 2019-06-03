

var TestDraw = (function (){


    var model;
    var directionalLight;
    var canvas;


    var tempModel;

    var DrawMain = function(){
        canvas = document.querySelector("#glCanvas");

        this.renderer = new Renderer(function(){
                this.start();
            }.bind(this)
        );
    };



    DrawMain.prototype.start = function(){


       // console.log(canvas);



      //  model = new Sphere(3);
        directionalLight = new Light();
        directionalLight.setDirection( 1.0, 0.0, 0.0);
        this.renderer.setLight( directionalLight );

        tempModel = new ModelBase('Model/go_gopher_high.obj');

        requestAnimationFrame(this.update.bind(this));
    };


    var then = 0;
    DrawMain.prototype.update = function( now ){



        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        tempModel.update(deltaTime);
        directionalLight.update(deltaTime);

        this.renderer.draw(tempModel);
        requestAnimationFrame(this.update.bind(this));
    };


        return DrawMain;
})();