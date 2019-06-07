var getMousePosition = function (event, element) {
    var boundingRect = element.getBoundingClientRect();

    return [
        event.clientX - boundingRect.left,
        event.clientY - boundingRect.top
    ];
};


var getTouchPosition = function (event, element) {
    var boundingRect = element.getBoundingClientRect();

    return [
        event.touches[0].clientX - boundingRect.left,
        event.touches[0].clientY - boundingRect.top
    ];
};