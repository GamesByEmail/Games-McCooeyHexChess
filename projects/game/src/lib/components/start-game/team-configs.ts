import { IStartTeamConfig, IStartPlayer } from '@gamesbyemail/base';

const players: IStartPlayer[] = [
  {
    user: undefined
  },
  {
    user: undefined
  }
];

export const teamConfigs: IStartTeamConfig[] = [
  {
    teams: [
      {
        title: "White",
        player: players[0]
      },
      {
        title: "Black",
        player: players[1]
      }
    ],
    optionNames:[
      "dark"
    ]
  }
];
