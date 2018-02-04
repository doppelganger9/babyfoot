import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher } from '../../..';
import { AddedGoalFromPlayerToGame, GameCreated, GameEnded, GameStarted, PlayerAddedToGameWithTeam } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');

  describe('happy path', () => {
    it('should work from event history', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('david', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('franck', 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam('gaëlle', 'red', gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('gaëlle', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('david', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(t.projection.winner).to.equal('blue');
      expect(t.projection.pointsTeamBlue).to.equal(10);
      expect(t.projection.pointsTeamRed).to.equal(5);
    });
  });
});
