import { Component, OnInit, HostListener } from "@angular/core";
import { ChessComApiService } from "../chess-com-api.service";
import { OpeningEvaluation, OpeningCourse } from "./opening-evaluation";
import { Chess } from "chess.js";
import { groupBy } from "lodash";
import * as moment from "moment";

@Component({
  selector: "app-opening-evaluation",
  templateUrl: "./opening-evaluation.component.html",
  styleUrls: ["./opening-evaluation.component.scss"],
})
export class OpeningEvaluationComponent implements OnInit {
  constructor(private api: ChessComApiService) {}
  gameViewer: OpeningEvaluation | undefined;
  gameViewerGame: Chess | undefined;
  expectedGameViewerGame: Chess | undefined;
  gameViewerIdx: number = 0;
  gameResultsHash: {
    success: OpeningEvaluation[];
    different: OpeningEvaluation[];
    failure: OpeningEvaluation[];
    initial: OpeningEvaluation[];
  } = { success: [], different: [], failure: [], initial: [] };
  hideBoard: boolean = true;
  activeKey: "failure" | "different" = "failure";
  username: string = "";

  async getOpening(): Promise<OpeningCourse> {
    return this.api
      .getOpenings()
      .then((pgns: Chess[]) => new OpeningCourse(pgns));
  }

  activeGames(): OpeningEvaluation[] {
    return this.gameResultsHash[this.activeKey];
  }

  setGameViewer(): void {
    if (this.activeGames()) {
      this.gameViewer = this.activeGames()[this.gameViewerIdx];
      this.gameViewerGame = this.gameViewer.gameMovesGame();
      this.expectedGameViewerGame = this.gameViewer.expectedMoveGame();
    }
  }

  nextGame(): void {
    if (this.gameViewerIdx >= this.activeGames().length - 1) {
      return;
    }
    this.gameViewerIdx += 1;
    this.setGameViewer();
  }

  previousGame(): void {
    if (this.gameViewerIdx < 1) {
      return;
    }
    this.gameViewerIdx -= 1;
    this.setGameViewer();
  }

  @HostListener("window:keydown.arrowLeft", ["$event"])
  handleKeyLeft(event: KeyboardEvent) {
    this.hideBoard = true;
    this.previousGame();
  }

  @HostListener("window:keydown.arrowRight", ["$event"])
  handleKeyRight(event: KeyboardEvent) {
    this.hideBoard = true;
    this.nextGame();
  }

  @HostListener("window:keydown.enter", ["$event"])
  handleKeyEnter(event: KeyboardEvent) {
    this.hideBoard = !this.hideBoard;
  }

  async ngOnInit(): Promise<void> {
    this.username = localStorage.getItem("chesscom_username") || "";

    const opening = await this.getOpening();
    const now = moment();
    this.api
      .getGames(this.username, now.format("YYYY/MM"))
      .subscribe((games: Chess[]) => {
        const results = games
          .map((game: Chess) => new OpeningEvaluation(game, opening))
          .sort((a, b) => (a.counter < b.counter ? 1 : -1));

        const { different, failure, initial, success } = groupBy(
          results,
          (r: any) => r.status.toLowerCase(),
        );
        this.gameResultsHash = {
          different,
          failure,
          initial,
          success,
        };
        console.log(this.gameResultsHash);
        this.setGameViewer();
      });
  }
}
