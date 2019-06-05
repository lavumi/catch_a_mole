var getMousePosition = function (event, element) {
    var boundingRect = element.getBoundingClientRect();
    return [
        event.clientX - boundingRect.left,
        event.clientY - boundingRect.top
    ];
};