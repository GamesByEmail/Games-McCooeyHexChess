import { Pawn } from './pieces/pawn';
import { Knight } from './pieces/knight';
import { Bishop } from './pieces/bishop';
import { Rook } from './pieces/rook';
import { Queen } from './pieces/queen';
import { King } from './pieces/king';
import { Piece, PieceChar } from './piece';
import { Game } from './game';
import { TeamId } from './team-id';

const types=[Pawn,Knight,Bishop,Rook,Queen,King];

export function createPiece(game: Game, pieceChar: PieceChar): Piece {
  for (let i = 0; i < types.length; i++)
    if (types[i].pieceChar===pieceChar.toLowerCase())
      return new types[i](game, pieceChar);
  throw("Bad piece type char: '"+pieceChar+"'");
}

export function pieceNameFromChar(pieceChar: PieceChar): string {
  const lPieceChar=<PieceChar>pieceChar.toLowerCase();
  for (let i = 0; i < types.length; i++)
    if (types[i].pieceChar===lPieceChar)
      return types[i].name;
  throw("Bad piece type char: '"+pieceChar+"'");
}

export function teamIdFromChar(pieceChar: PieceChar): TeamId {
  return pieceChar===pieceChar.toLowerCase() ? TeamId.White : TeamId.Black;
}