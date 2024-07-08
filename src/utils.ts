export function addPieceEventListeners(boardDOM: Element, pieceDOM: HTMLSpanElement) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = drag;
}

function drag(e: any) {
    e.dataTransfer.setData("text", e.target.id);
}

export function drop(ev: any) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (document.getElementById(data) == ev.target) {
        return
    }
    if (ev.target.innerHTML !== "") {
        ev.target.innerHTML = ""
        new Audio('./assets/audio/capture.mp3').play();
    }
    else {
        new Audio('./assets/audio/move-self.mp3').play();
    }
    ev.target.appendChild(document.getElementById(data));
}

export function allowDrop(ev: any) {
    ev.preventDefault();
}