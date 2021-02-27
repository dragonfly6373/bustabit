/**
* UI Configuration Defination
*/
var config = {};

// INPUT TEXT
config.name = { value: '', type: 'text', label: 'What is your name?' };

// NOOP LABEL or SEPRATER
config.seperator = {type: 'noop', label: "I am a noop seperator"};

// INPUT RADIO BUTTON
config.colors = {
    value: 'red', type: 'radio', label: 'Pick a color',
    options: {
        red: { value: 'red', type: 'noop', label: 'Red' },
        blue: { value: 'blue', type: 'noop', label: 'Blue' },
    }
};

// INPUT CHECKBOX
var config = {
    red: { type: 'checkbox', label: 'Red', value: true },
    yellow: { type: 'checkbox', label: 'Yellow', value: false },
    blue: { type: 'checkbox', label: 'Blue', value: true }
};

// INPUT BALANCE BIT UNIT (1bit = 100santoshis; 1bitcoin = 1e6bits)
config.baseBet = { value: 1e8, type: 'balance', label: 'Max Bet' };

// INPUT MULTIPLIER DOUBLE VALUE
config.basePayout = {
    basePayout: { value: 2, type: 'multiplier', label: 'payout' }
};
