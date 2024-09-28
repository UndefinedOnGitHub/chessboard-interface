import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Chessground } from "chessground";
import * as chess from "chess";
import { AlgebraicGameClient } from "chess";
import { Chess } from "chess.js";

@Component({
  selector: "app-chessboard",
  templateUrl: "./chessboard.component.html",
  styleUrls: ["./chessboard.component.scss"],
})
export class ChessboardComponent implements OnChanges {
  groundboard: any | undefined;
  groundboardId: string = `chessboard_${Math.floor(Math.random() * 1000)}`;
  gameClient: AlgebraicGameClient = chess.create();
  @Input() fen: string | undefined;
  @Input() game: Chess | undefined;
  @Input() orientation: "white" | "black" | undefined;
  @Input() lastMove: [string, string] | undefined;
  @Input() disabled: boolean | undefined;
  @Input() size: number = 500;
  @Input() highlightColor: string | undefined;
  @Input() hideBoard: boolean = false;

  boardClasses: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.boardClasses = [`board-size-${this.size}`];
    if (this.highlightColor) {
      this.boardClasses.push(`highlight-color-${this.highlightColor}`);
    }
    if (this.hideBoard) {
      this.boardClasses.push(`hide-board`);
    }
    setTimeout(() => {
      this.initializeBoard();
    });
  }

  initializeBoard() {
    const config = this.generateConfig();
    const element = document.getElementById(this.groundboardId);
    if (element) {
      this.groundboard = Chessground(element, config);
    }
  }

  generateConfig(): any {
    const translateLastMove = () => {
      const movePosition = this.gameClient.game.moveHistory.length - 1;
      const lastMove = this.gameClient.game.moveHistory[movePosition];
      const { prevFile, prevRank, postFile, postRank } = lastMove;
      return [`${prevFile}${prevRank}`, `${postFile}${postRank}`];
    };
    const resetBoard = () => {
      const lastMove = translateLastMove();
      return this.groundboard?.set({ fen: this.gameClient.getFen(), lastMove });
    };

    const compareSquare = (
      square: { file: string; rank: number },
      comparitor: string,
    ) => {
      return `${square.file}${square.rank}` == comparitor;
    };

    const orientation = this.orientation || "white";
    const viewOnly = !!this.disabled;
    let fen, lastMove;
    if (this.game) {
      const historyMove = this.game.history({ verbose: true }).slice(-1)[0];
      lastMove = [historyMove?.from, historyMove?.to];
      fen = this.game.fen();
    } else {
      fen = this.fen || undefined;
      lastMove = this.lastMove || null;
    }

    return {
      lastMove,
      coordinates: this.size >= 500,
      fen,
      viewOnly,
      orientation,
      draggable: {
        showGhost: true,
      },
      events: {
        move: (orig: string, dest: string, capt: any) => {
          if (!this.gameClient) return;
          const source = this.gameClient.validMoves.find((i) => {
            return compareSquare(i.src, orig);
          });

          if (!source) {
            return resetBoard();
          }

          const destination = source.squares.find((sq) => {
            return compareSquare(sq, dest);
          });

          if (!destination) {
            return resetBoard();
          } else {
            const move = Object.keys(this.gameClient.notatedMoves).find(
              (key) => {
                const move = this?.gameClient?.notatedMoves[key];
                return move?.src == source.src && move?.dest == destination;
              },
            );
            if (move) this.gameClient.move(move);
          }
        },
        select: (key: any) => {
          // debugger;
          console.log(key);
        },
      },
    };
  }
}
