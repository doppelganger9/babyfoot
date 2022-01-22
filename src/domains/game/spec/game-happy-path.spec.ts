import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent } from '../../..';
import { AddedGoalFromPlayerToGame, GameCreated, GameEnded, GameStarted, PlayerAddedToGameWithTeam } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';
import { PlayerId } from '../../player';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');

  describe('happy path', () => {
    it('should work from event history', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('cédric'), 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('david'), 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('franck'), 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('gaëlle'), 'red', gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('franck'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('franck'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('franck'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('gaëlle'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('david'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('franck'), gameId));
      history.push(new AddedGoalFromPlayerToGame(new PlayerId('cédric'), gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(t.projection.winner).to.equal('blue');
      expect(t.projection.pointsTeamBlue).to.equal(10);
      expect(t.projection.pointsTeamRed).to.equal(5);
    });
  });
});
