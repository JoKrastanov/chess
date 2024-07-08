export function addPieceEventListeners(boardDOM: Element, pieceDOM: HTMLSpanElement) {
    const boardDOMBounds = boardDOM.getBoundingClientRect()
    pieceDOM.addEventListener('mousedown', (e: MouseEvent) => {
        const shiftX = e.clientX - pieceDOM.getBoundingClientRect().left + boardDOMBounds.left;
        const shiftY = e.clientY - pieceDOM.getBoundingClientRect().top + boardDOMBounds.top;

        const moveAt = (pageX: number, pageY: number) => {
            pieceDOM.style.left = pageX - shiftX + 'px';
            pieceDOM.style.top = pageY - shiftY + 'px';
        };

        const onMouseMove = (e: MouseEvent) => {
            moveAt(e.pageX, e.pageY);
        };

        document.addEventListener('mousemove', onMouseMove);

        pieceDOM.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
            pieceDOM.onmouseup = null;
        });

        pieceDOM.ondragstart = () => {
            return false;
        };
    });
}
