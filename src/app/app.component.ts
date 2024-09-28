import { Component } from "@angular/core";
import { ChessComApiService } from "./chess-com-api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "chessboard-interface";
  constructor() {}
}
