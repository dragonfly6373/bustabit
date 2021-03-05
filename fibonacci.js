var config = {
    baseBet: { value: 100, type: "balance", label: "Base Bet:"},
    skippedPayout: { value: 2, type: "multiplier", label: "Min Payout Skipped"}
};

function getBit(satoshis) {
    return roundBit(satoshis * 1.00 / 100);
}

function roundBit(bet) {
    return Math.round(bet * 100) / 100;
}

// Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144
function Fibonacci(config) {
    this.baseBet = config.baseBet;
    this.skippedPayout = config.skippedPayout;

    this.wager = 1;
    this.prevWager = 0;
    this.payout = 55;
    this.nextPayout = 34;
    this.lost = 0;

    this.bustLogs = [];
}

Fibonacci.prototype.reset = function() {
    this.wager = 1;
    this.prevWager = 0;
    this.payout = 55;
    this.nextPayout = 34;
    this.lost = 0;
}

Fibonacci.prototype.saveLog = function(value) {
    this.bustLogs.push(value);
    if (this.bustLogs.length >= 10) { // reset logs
        log(this.bustLogs);
        this.bustLogs = [];
    }
}

Fibonacci.prototype.showLogs = function() {
    if (!this.bustLogs.length) return;
    log(this.bustLogs);
    this.bustLogs = [];
}

Fibonacci.prototype.makeBet = function(engine) {
    if (this.skipped) {
        return;
    }
    var betAmount = this.wager * this.baseBet;
    var message = "(" + this.bustLogs.length + ") makeBet(" + getBit(betAmount) + ", " + this.payout + ")";
    log(message);
    engine.bet(betAmount, this.payout);
}

// data: {id: int, hash: string, bust: float, cashedAt: float, wager: double}
Fibonacci.prototype.gameEnded = function(data) {
    this.skipped = data.bust < this.skippedPayout;
    if (this.skipped) {
        log("bust", data.bust, "skip next...");
    }
    // If we wagered, it means we played
    if (!data.wager) {
        return;
    }
    if (data.cashedAt) {
        this.onWin(data);
    } else {
        this.onLose(data);
    }
    fibo.saveLog(data.bust);
}

Fibonacci.prototype.onWin = function(data) {
    var bet = this.baseBet * this.wager;
    var amount = bet * data.cashedAt - bet;
    log("[WON]", getBit(amount), "bits");
    this.reset();
}

Fibonacci.prototype.onLose = function(data) {
    var amount = this.baseBet * this.wager;
    log("[LOST]", getBit(amount), "bits");
    var p = this.payout;
    this.payout = Math.max(2, this.nextPayout);
    this.nextPayout = p - this.payout;
    this.lost += this.wager;
    if (this.payout > 2) {
        var nextWager = this.wager + this.prevWager;
        this.prevWager = this.wager;
        this.wager = nextWager;
    } else {
        this.wager = this.lost;
    }
}

var fibo = new Fibonacci({baseBet: config.baseBet.value, skippedPayout: config.skippedPayout.value});

// Try to bet immediately when script starts
if (engine.gameState === "GAME_STARTING") {
    if (!fibo) fibo = new Fibonacci(config.baseBet.value, config.skippedPayout.value);
    fibo.makeBet(engine);
}

engine.on("GAME_STARTING", onGameStarted);
engine.once("GAME_STARTING", () => engine.on("GAME_ENDED", onGameEnded));

function onGameStarted() {
    if (!fibo) fibo = new Fibonacci({baseBet: config.baseBet.value, skippedPayout: config.skippedPayout.value});
    fibo.makeBet(engine);
}

function onGameEnded() {
    if (!fibo) return;
    var lastGame = engine.history.first();
    fibo.gameEnded(lastGame);
}
