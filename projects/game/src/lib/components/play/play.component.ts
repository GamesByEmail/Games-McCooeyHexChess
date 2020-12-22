import { Component, OnInit } from '@angular/core';
import { IGameData } from '@gamesbyemail/base';
import { Game, IGameOptions, IGameState } from '../../game/game';
import { TeamId } from '../../game/team-id';

@Component({
  selector: 'gamesbyemail-games-mccooeyhexchess-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {

  game: Game = new Game();
  constructor() {
  }

  ngOnInit() {
    const gameData: IGameData<IGameOptions, IGameState, TeamId> = {
      over: false,
      players: [
        { title: "David", id: "ASDFASDF" },
        { title: "Jennifer", id: "ASDFASDF" }
      ],
      options: {
        dark: false
      },
      perspective: TeamId.White,
      states: [
        {
          moveNumber: 0,
          //board: "  prqb   pnbk    pbnr     pppp                      p        PPPP     RNBP    QBNP   BKRP  ",
          board: "  prqb   pnbk    pbnr     pppp                               PPPP     RNBP    QBNP   BKRP  ",
          teams: [
            '@',
            ''
          ],
          moves: []
        }
      ]
    };
    this.game.setGameData(gameData);
  }

}
