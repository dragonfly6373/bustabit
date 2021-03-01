/**
 * The script has access to an engine variable which is an Event Emitter. You attach listeners to the engine to respond to events.
 * Events:
 *  "GAME_STARTING": Emitted when the server starts accepting bets 5 seconds before the game actually starts
 *  "GAME_STARTED": Bets are no longer accepted  "GAME_ENDED"
 *  "BET_PLACED" bet: Whenever a player places a bet, your listener will receive the bet object. This event is not emitted for simulated bets
 *  "PLAYERS_CHANGED": Is emitted whenever a player makes a bet or cashes out. This means that engine.players and engine.cashOuts have been updated, respectively
 *  "CASHED_OUT" object: Whenever a player cashed out, this event broadcasts an object that looks like { uname: string, wager: int, cashedAt: float (multiplier) }.
 *
 */

 engine.on('GAME_STARTING', function () {
     log('a game is starting')
 });

/**
 * Engine Methods
 */
engine.bet(satoshis: Integer, payout: Float); // So, engine.bet(100, 2) means that you are betting 100 satoshis (1 bit) with an autocashout at 2x. If you don't want an autocashout, just set it really high: engine.bet(100, Number.MAX_VALUE).
engine.getState(); // Serializes the state of the engine into a javascript object. Can be useful for debugging.
engine.getCurrentBet(); // Returns falsey if you have no bet placed, else it returns { wager: number, payout: number }.
engine.isBetQueued(); // Returns boolean, true if you have a bet enqueued for next game.
engine.cancelQueuedBet(); // Cancels the bet that you have enqueued for next game.
engine.cashOut(); // Attempts to cash out the current game.

/**
* Properties:
*/
engine.history; // A circular buffer of games (not a Javascript array).
engine.history.first(); // the latest game. If game.crashedAt is not set, then it's the current game-in-progress.
engine.history.last(); // the oldest game in the buffer which only stores the latest 50 games.
engine.history.toArray(); // returns an Array<Game> so that you can use regular array methods to process the history.
engine.playing; // A Map() of usernames to their bet amount. Only includes players that have not yet cashed out.
engine.cashOuts; // An array of { wager: satoshis, uname: String, cashedAt: Float } of all cashed out players.

/**
 * A Game object = engine.history.game:
 */
game.id; // (integer)
game.hash; // (string)
game.bust; // (nullable float, ex: 1.32): The multiplier that the game crashed at. If it is not set, then the game is currently in progress.
game.cashedAt; // (nullable float, ex: 103.45): The multiplier that WE cashed-out at. If it is not set, then we either did not play that game or the game busted before you cashed out. You can check the existence of this value to determine if we won that game or not.
game.wager; // (satoshis, integer, ex: 100)

/**
 * The UserInfo Store:
 */
userInfo.balance; // User balance in satoshis
userInfo.bets; // Total amount of user's bets
userInfo.wagered; // Total amount of satoshis user has wagered
userInfo.invested; // Total amount user has invested in the bankroll
userInfo.profit;
userInfo.unpaidDeposits;

/**
 * The Chat Store
 */
chat.channels; // (Map): Map of joined channels which maps channel name to { unread: int, history: Array<{message, uname, created}> }
chat.friends; // (Map): Your current friends list. Maps username to { unread: int, history: Array<{message, uname, created}> }

/**
 * Displaying Output and Notification:
 */
log('hello', 'world')
notify(message)

/**
 * Stopping Script:
 */
if (userInfo.balance < config.wager.value) {
  stop('Insufficient balance to make the bet')
}
