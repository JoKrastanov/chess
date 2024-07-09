import { PieceCode, PieceType } from "./types/piece";

const moveSound = new Audio('../../assets/audio/move-self.mp3');
const captureSound = new Audio('../../assets/audio/capture.mp3');

export function addPieceEventListeners(boardDOM: Element, pieceDOM: HTMLSpanElement) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = drag
}

function drag(e: DragEvent) {
    if(!e.dataTransfer || !e.target) return
    const target = (<HTMLSpanElement>e.target)
    e.dataTransfer.setData("text", target.id);
    const [piece, square] = target.id.split("_") as unknown as [number, number]
    console.log(PieceCode[piece], square)
}

export function drop(ev: any) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (document.getElementById(data) == ev.target) {
        return
    }
    if (ev.target.innerHTML !== "") {
        ev.target.innerHTML = ""
        captureSound.play();
    }
    else {
        moveSound.play();
    }
    ev.target.appendChild(document.getElementById(data));
}

export function allowDrop(ev: any) {
    ev.preventDefault();
}