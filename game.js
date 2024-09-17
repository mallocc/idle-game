console.log('Game script loaded');

let totalScore = 0;
let currentScore = 0;
let diceCount = 0;
let diePrice = 0;
let autoRollPrice = 0;
let autoDieBuyerPrice = 0;
let rolls = 0;

const averageDieValue = 3.5;

// a autoroller consists of a 16ms slot within the max 60fps frame rate
// so initialising an array of 60 elements to store the autorollers counts at each frame
const autoRollers = [];
for (let i = 0; i < 60; i++) {
    autoRollers.push(0);
}

function incAutoRollerSlot(slot) {
    // increment the autoroller count at the slot
    autoRollers[slot]++;
}

// same again for auto die buyers
const autoDieBuyers = [];
for (let i = 0; i < 60; i++) {
    autoDieBuyers.push(0);
}

function incAutoDieBuyerSlot(slot) {
    // increment the autoroller count at the slot
    autoDieBuyers[slot]++;
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateScore(newScore) {
    // update the score in the UI
    currentScore = newScore;
    // update the score in the UI
    document.getElementById('score').innerText = formatNumber(Math.round(currentScore));

}

function addScore(newScore) {
    // add the new score to the current score
    totalScore += newScore;
    // update the total score in the UI
    document.getElementById('total-score').innerText = formatNumber(Math.round(totalScore));
}

function addRolls(newRolls) {
    // increment the rolls count
    rolls += newRolls;
    // update the rolls count in the UI
    document.getElementById('rolls').innerText = formatNumber(rolls);
}

function updateDiceCount(newCount) {
    // update the count of dice in the UI
    diceCount = newCount;
    // update the count of dice in the UI
    document.getElementById('die-count').innerText = formatNumber(diceCount);
}

function rollDice() {
    if (diceCount === 0) {
        return;
    }

    // optimise if die is above 10 then we just average the dice rolls
    if (diceCount > 10) {
        // average die value
        const diceValue = diceCount * averageDieValue;
        // update the score with the dice value
        updateScore(currentScore + diceValue);
        // update the total score with the dice value
        addScore(diceValue);
        // increment the rolls count
        addRolls(diceCount);
    }
    else {
        // roll the dice as many times as the dice count
        for (let i = 0; i < diceCount; i++) {
            // roll a single dice
            rollSingleDice();
        }
    }
}

function rollSingleDice() {
    // generate a random number between 1 and 6
    const diceValue = Math.floor(Math.random() * 6) + 1;
    // update the score with the dice value
    updateScore(currentScore + diceValue);
    // update the total score with the dice value
    addScore(diceValue);
    // increment the rolls count
    addRolls(1);
}

function buyDie() {
    // check if the player has enough score to buy the die
    if (currentScore >= diePrice) {
        // deduct the price from the
        updateScore(currentScore - diePrice);
        // increase the count of dice
        updateDiceCount(diceCount + 1);
        // update the price of the die
        updateDiePrice();
    }
}

function updateDiePrice() {
    // random price between 100 and 600
    diePrice = Math.floor(Math.random() * 6 + 1) * 100;
    // update the price in the UI
    document.getElementById('die-price-x1').innerText = formatNumber(diePrice);
}

function updateAutoRollCount() {
    // update the count of autorolls in the UI
    // the count is the sum of all autorollers
    document.getElementById('auto-roll-count').innerText = formatNumber(autoRollers.reduce((acc, val) => acc + val, 0));
}

function buyAutoRoll() {
    // check if the player has enough score to buy the autoroll
    if (currentScore >= autoRollPrice) {
        // deduct the price from the
        updateScore(currentScore - autoRollPrice);
        // update the price of the autoroll
        updateAutoRollPrice();
        // push a random number between 0 and 59
        incAutoRollerSlot(Math.floor(Math.random() * 60));
        // update the count of autorolls
        updateAutoRollCount();
    }
}

function updateAutoRollPrice() {
    // random price between 1000 and 6000
    autoRollPrice = Math.floor(Math.random() * 6 + 1) * 1000;
    // update the price in the UI
    document.getElementById('auto-roll-price-x1').innerText = formatNumber(autoRollPrice);
}

function buyAutoDieBuyer() {
    // check if the player has enough score to buy the autodiebuyer
    if (currentScore >= autoDieBuyerPrice) {
        // deduct the price from the
        updateScore(currentScore - autoDieBuyerPrice);
        // push a random number between 0 and 59
        incAutoDieBuyerSlot(Math.floor(Math.random() * 60));
        // update the count of autodiebuyers
        updateAutoDieBuyerCount();
        // update the price of the autodiebuyer
        updateAutoDieBuyerPrice();
    }
}

function updateAutoDieBuyerCount() {
    // update the count of autorolls in the UI
    // the count is the sum of all autorollers
    document.getElementById('auto-die-buyer-count').innerText = formatNumber(autoDieBuyers.reduce((acc, val) => acc + val, 0));
}

function updateAutoDieBuyerPrice() {
    // random price between 1000 and 6000
    autoDieBuyerPrice = Math.floor(Math.random() * 6 + 1) * 10000;
    // update the price in the UI
    document.getElementById('auto-die-buyer-price-x1').innerText = formatNumber(autoDieBuyerPrice);
}

// a loop that runs every 16ms and checks if the current frame is a multiple of the autoroller
function gameLoop() {
    let frame = 0;
    setInterval(() => {
        frame = (frame + 1) % 60;
        // if the autoroller count at the frame is greater than 0
        if (autoRollers[frame] > 0) {
            // roll the dice
            rollDice();
        }

        // if the autoroller count at the frame is greater than 0
        if (autoDieBuyers[frame] > 0) {
            // buy a die for each auto buyer at the frame
            for (let i = 0; i < autoDieBuyers[frame]; i++) {
                buyDie();
            }
        }

        // we can unlock mechanics according to the total score or the rolls count
        if (rolls >= 10000) {
            document.getElementById('auto-die-buyer-row').style.display = 'table-row';
        }
        if (rolls >= 1000) {
            document.getElementById('auto-roller-row').style.display = 'table-row';
        }
        if (rolls >= 100) {
            document.getElementById('shop').style.display = 'block';
        }

    }, 16);
}

// initial setup
updateScore(0);
updateDiceCount(1);
updateDiePrice();
updateAutoRollPrice();
updateAutoRollCount();
updateAutoDieBuyerCount();
updateAutoDieBuyerPrice();

gameLoop();
