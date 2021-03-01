var config = {
    baseBet: { value: 100, type: "balance", label: "Base Bet:"},
    skippedPayout: { value: 1.6, type: "multiplier", label: "Min Payout Skipped"}
};

function getBit(satoshis) {
    return roundBit(satoshis * 1.00 / 100);
}

function roundBit(bet) {
    return Math.round(bet * 100) / 100;
}

// Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144
function Fibonacci(baseBet, skippedPayout) {
    this.baseBet = baseBet;
    this.skippedPayout = skippedPayout;

    this.wager = 1;
    this.payout = 55;
    this.nextPayout = 34;
    this.lost = 0;
    this.nextLost = 1;

    this.bustLogs = [];
}

Fibonacci.prototype.reset = function() {
    this.wager = 1;
    this.payout = 55;
    this.nextPayout = 34;
    this.lost = 0;
    this.nextLost = 1;
}

Fibonacci.prototype.saveLog = function(value) {
    this.bustLogs.push(value);
    if (this.bustLogs.length >= 10) { // reset logs
        log(this.bustLogs);
        this.bustLogs = [];
    }
}

Fibonacci.prototype.makeBet = function(engine) {
    if (this.skipped) {
        return;
    }
    var betAmount = this.wager * this.baseBet;
    engine.bet(betAmount, this.payout);
    var message = "(" + this.bustLogs.length + ") makeBet(" + getBit(betAmount) + ", " + this.payout + ")";
    log(message);
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
    this.nextLost += (this.lost > 0 ? this.lost : 1);
    this.lost += this.wager;
    this.wager = this.nextLost - this.lost;
    log("[LOST]", getBit(amount), "bits", this.nextLost, this.lost, this.wager);
    var p = this.payout;
    this.payout = Math.max(2, this.nextPayout);
    this.nextPayout = p - this.payout;
}

var fibo = new Fibonacci(config.baseBet.value, config.skippedPayout.value);

// Try to bet immediately when script starts
if (engine.gameState === "GAME_STARTING") {
    if (!fibo) fibo = new Fibonacci(config.baseBet.value, config.skippedPayout.value);
    fibo.makeBet(engine);
}

engine.on("GAME_STARTING", onGameStarted);
engine.once("GAME_STARTING", () => engine.on("GAME_ENDED", onGameEnded));

function onGameStarted() {
    if (!fibo) fibo = new Fibonacci(config.baseBet.value, config.skippedPayout.value);
    fibo.makeBet(engine);
}

function onGameEnded() {
    if (!fibo) return;
    var lastGame = engine.history.first();
    fibo.gameEnded(lastGame);
}
