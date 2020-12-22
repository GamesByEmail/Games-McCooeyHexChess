export interface IPieceKey {
  type: 'Pawn' | 'Knight' | 'Bishop' | 'Rook' | 'Queen' | 'King';
  team: 'White' | 'Black';
  small?: boolean;
  resigned?: boolean;
}
