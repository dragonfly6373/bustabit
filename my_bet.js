var config = {
    baseBet: { value: 100, type: "balance", label: "Base Bet:"},
    basePayout: { value: 1.6, type: "multiplier", label: "Base Payout"},
    skippedValue: { value: 1.06, type: "multiplier", label: "Min Payout Skipped"}
};

/**
 * My Custom engine
 * @Param baseBet: fixex bet bits
 * @Param basePayout: fixed safe payout value
 * @Param imutePayout: minimun payout when reach will bet with payout = 1
 */
var init = {
    baseBet: config.baseBet.value,
    basePayout: config.basePayout.value,
    skippedValue: config.skippedValue.value
}
var arr = [];

// Try to bet immediately when script starts
if (engine.gameState === "GAME_STARTING") {
  makeBet();
}

engine.on("GAME_STARTING", onGameStarted);
engine.once("GAME_STARTING", () => engine.on("GAME_ENDED", onGameEnded));

function onGameStarted() {
    makeBet();
}

function makeBet() {
    var wager = init.baseBet;
    var payout = init.basePayout;
    var imute = init.skippedValue;
    var lastGame = engine.history.first();
    if (lastGame.wager && lastGame.bust < imute) payout = 1;
    engine.bet(wager, payout);
    log("(" + arr.length + ") betting", roundBit(wager), "on", payout,"x");
}

function onGameEnded() {
    var lastGame = engine.history.first();
    // If we wagered, it means we played
    if (!lastGame.wager) {
        return;
    }
    if (lastGame.cashedAt) {
        var profit = (config.basePayout.value * lastGame.cashedAt - config.basePayout.value) / 100;
        log("we won", profit.toFixed(2), "bits");
    } else {
        log("we lost", roundBit(config.baseBet.value), "bits");
    }
    arr.push(lastGame.bust);
    if (arr.length > 5) {
        log("last 5 game:", arr);
        arr = [];
    }
}

function roundBit(bet) {
  return Math.round(bet / 1000) * 1000;
}
