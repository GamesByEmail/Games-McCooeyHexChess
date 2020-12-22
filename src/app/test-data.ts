import {
  IStartGame,
  testMes
} from '@gamesbyemail/base';


export const testData:{[key:string]:IStartGame} = {
  mccooeyhexchess: {
    title: "McCooey Hex Chess game",
    teams: [
      {
        title: "White",
        player: {
          title: testMes.basic.friends[0].handle,
          user: testMes.basic.friends[0]
        }
      },
      {
        title: "Black",
        player: {
          user: undefined
        }
      }
    ],
    options: {}
  },
  darkChess: {
    title: "Dark McCooey Hex Chess game",
    teams: [
      {
        title: "White",
        player: {
          title: testMes.basic.friends[0].handle,
          user: testMes.basic.friends[0]
        }
      },
      {
        title: "Black",
        player: {
          user: undefined
        }
      }
    ],
    options: {
      dark: "true"
    }
  }
};
