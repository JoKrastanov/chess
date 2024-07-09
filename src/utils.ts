import { PieceCode, PieceIcon } from "./types/piece";

const moveSound = new Audio('../../assets/audio/move-self.mp3');
const captureSound = new Audio('../../assets/audio/capture.mp3');

export function addPieceEventListeners(pieceDOM: HTMLSpanElement) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = drag
}

export function createBoardPiece(piece: PieceCode, squareIdx: number) {
    const pieceDOM = document.createElement("span")
    const pieceImg = document.createElement("img")

    pieceDOM.className = "piece"
    pieceDOM.id = `${piece}_${squareIdx}`
    pieceImg.src = PieceIcon[piece]
    pieceImg.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });
    pieceDOM.appendChild(pieceImg)
    addPieceEventListeners(pieceDOM)
    return pieceDOM
}

function drag(e: DragEvent) {
    if (!e.dataTransfer || !e.target) return
    const target = (<HTMLSpanElement>e.target)
    e.dataTransfer.setData("text", target.id);
    const [piece, square] = target.id.split("_") as unknown as [number, number]
    console.log(e.target)
    console.log(PieceCode[piece], square)
}

export function drop(ev: any) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log(document.getElementById(data))
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