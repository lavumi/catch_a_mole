let getMousePosition = function (event, element) {
    let boundingRect = element.getBoundingClientRect();

    let result;
    if( !!event.touches === true ){
        result = [
            event.touches[0].clientX - boundingRect.left,
            event.touches[0].clientY - boundingRect.top
        ];
    }
    else{
        result = [
            event.clientX - boundingRect.left,
            event.clientY - boundingRect.top
        ];
    }
    return result;
};

