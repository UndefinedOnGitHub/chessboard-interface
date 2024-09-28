import { Chess } from "chess.js";
import { isEmpty } from "lodash";

export const OpeningEndValue = "base";
export interface openingHash {
	[key: string]: openingHash | "base";
}

enum Status {
	Initial = "Initial",
	Success = "Success",
	Failure = "Failure",
	Different = "Different",
}

export class OpeningEvaluation {
	status: string = Status.Initial;
	lastMove: string | undefined;
	expectedMoves: string[] = [];
	gameMoves: string[] = [];
	#history: string[] = [];
	#game: Chess;
	orientation: "white" | "black" | undefined;
	constructor(game: Chess, opening: OpeningCourse) {
		this.#game = game;
		this.#history = game.history();
		this.lastMove = this.#history[0];
		this.assignOrientation();
		this.evaluate(opening)
	}

	assignOrientation() {
		const username = localStorage.getItem("chesscom_username");
		if (username) {
			this.orientation =
				this.#game.header()["White"].toLowerCase() == username.toLowerCase()
					? "white"
					: "black";
		}
	}

	evaluate(opening: OpeningCourse): OpeningEvaluation {
		let current : any = opening.hash;
		if (!opening.hash[this.#history[0]]) {
			return this;
		}
		for (const h of this.#history) {
			this.lastMove = h;
			if (current[h] && current[h] != OpeningEndValue) {
				current = current[h];
			} else if (current[h] && current[h] == OpeningEndValue) {
				this.status = Status.Success;
				break;
			} else {
				this.status = this.counter % 2 == 1 ? Status.Failure : Status.Different;
				this.expectedMoves = Object.keys(current);
				break;
			}
			this.gameMoves.push(h);
		}
		return this;
	}

	get counter(): number {
		return this.gameMoves.length;
	}

	get history(): string[] {
		return this.#history;
	}

	get fen(): string {
		const chess = new Chess();
		this.gameMoves.forEach((gm) => chess.move(gm));
		return chess.fen();
	}

	get gameLink(): string {
		const { Link } = this.#game.header();
		return Link || "";
	}

	get title(): string {
		const { White, WhiteElo, Black, BlackElo } = this.#game.header();
		return `${White}(${WhiteElo}) vs ${Black}(${BlackElo})`;
	}

	get date(): string {
		const { UTCDate, UTCTime } = this.#game.header();
		const dateStr = UTCDate.replaceAll(".", "-");
		const date = new Date(`${dateStr}T${UTCTime}`);
		return date.toDateString();
	}

	constructMoves(additionalMove: string): Chess {
		const chessClone = new Chess();
		this.gameMoves.forEach((gm) => chessClone.move(gm));
		const m = chessClone.move(additionalMove);
		return chessClone;
	}

	gameMovesGame(): Chess {
		return this.constructMoves(this.lastMove || "");
	}
	expectedMoveGame(): Chess {
		return this.constructMoves(this.expectedMoves[0]);
	}
}

export class OpeningCourse {
	#games: Chess[] = [];
	#fens: Set<string> = new Set();
	_: openingHash = {};

	constructor(games: Chess[]) {
		this.#games = games;
		this.#fens = new Set(
			this.#games.flatMap((g) => {
				const chess = new Chess();
				return g.history().map((h) => {
					chess.move(h);
					return chess.fen();
				});
			}),
		);
		this._ = this.chessToCourse();
	}

	mergeDeep(target: any, ...sources: any): any {
		const isObject = (item: any) => {
			return item && typeof item === "object" && !Array.isArray(item);
		};
		if (!sources.length) return target;
		const source = sources.shift();

		if (isObject(target) && isObject(source)) {
			for (const key in source) {
				if (isObject(source[key])) {
					if (!target[key]) Object.assign(target, { [key]: {} });
					this.mergeDeep(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}

		return this.mergeDeep(target, ...sources);
	}

	gamesToHash(game: Chess): openingHash {
		return [...game.history()]
			.reverse()
			.reduce(
				(memo, h) => ({ [h]: isEmpty(memo) ? OpeningEndValue : memo }),
				{},
			);
	}

	chessToCourse(): openingHash {
		return this.#games
			.map(this.gamesToHash)
			.reduce((memo, hl) => this.mergeDeep(memo, hl), {});
	}

	get hash(): openingHash {
		return this._;
	}

	get fens(): string[] {
		return new Array(...this.#fens);
	}

	get pgns() {
		return this.#games.map((g) => g.pgn());
	}

	get games() {
		return this.#games;
	}
}