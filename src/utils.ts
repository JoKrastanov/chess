export function addPieceEventListeners(boardDOM: Element, pieceDOM: HTMLSpanElement) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = drag;
    const boardDOMBounds = boardDOM.getBoundingClientRect()
}

function drag(e: any) {
    e.dataTransfer.setData("text", e.target.id);
}