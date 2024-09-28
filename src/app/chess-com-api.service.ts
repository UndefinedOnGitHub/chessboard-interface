import { Injectable } from "@angular/core";
// import {Observable} from "rxjs/Observable";
import { map, Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Chess } from "chess.js";

export interface GameResponse {
  gamePgn: string;
  history: string[];
  orientation: 'b' | 'w';
}

@Injectable({
  providedIn: "root",
})
export class ChessComApiService {
  constructor(private http: HttpClient) {}

  getGames(
    username: string,
    date: string = "2024/06",
    color: "white" | "black" | null = null,
  ) {
    return this.http
      .get(`https://api.chess.com/pub/player/${username}/games/${date}`)
      .pipe(
        map((response: any) => {
          let games = response.games.filter((g: any) => g.rules == "chess");
          if (color) {
            games = games.filter(
              (g: any) =>
                g[color].username.toLowerCase() == username.toLowerCase(),
            );
          }
          return games.map((g: any) => {
            const chess = new Chess();
            chess.loadPgn(g.pgn);
            return chess;
          });
        }),
      );
  }

  // Not working
  loadLichessGame(username: string,
    date: string = "2024/06",
    color: "white" | "black" | null = null,
  ) {
    const headers = new HttpHeaders({
      'Content-Type': 'Accept',
      Accept: 'application/json',
    });

    const requestOptions = {
      headers: headers,
      params: new HttpParams().set('max', 2), //.set("pgnInJson", false)
    };

    username = ""

    return this.http
      .get(`https://lichess.org/api/games/user/${username}`, requestOptions)
      .pipe(
        map((response: any) => {
          let games = response.games.filter((g: any) => g.rules == "chess");
          if (color) {
            games = games.filter(
              (g: any) =>
                g[color].username.toLowerCase() == username.toLowerCase(),
            );
          }
          return games.map((g: any) => {
            const chess = new Chess();
            chess.loadPgn(g.pgn);
            return chess;
          });
        }),
      );
  }

  // Expected Response
  // 1.e4 c6 2.d4 d5 ... 11.a3 Rc8 *
  // 1.e4 c6 2.d4 d5 ... 9.O-O Nh6 
  // 1.e4 c6 2.d4 d5 ... 7.Bd2 Qb6 *
  getOpenings() {
    return fetch("../assets/opening_lines.pgn")
      .then(function (response) {
        return response.text();
      })
      .then((pgnStr) =>
        pgnStr.split("\n").map((p) => {
          const chess = new Chess();
          chess.loadPgn(p);
          return chess;
        }),
      );
  }
}
