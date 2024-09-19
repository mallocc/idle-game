console.log('Game script loaded');

let unlockables = [
    {
        type: 'dice',
        name: 'D4',
        dieValue: 4,
        cost: 4000,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 2000,
        count: 0,
        max: 1,
        htmlId: 'd4',
        funcOnBuy: function () {
        }
    },
    {
        type: 'dice',
        name: 'D6',
        dieValue: 6,
        doubleChance: 0.0,
        cost: 0,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 0,
        count: 1,
        max: 1,
        htmlId: 'd6',
        funcOnBuy: function () {
        }
    },
    {
        type: 'dice-upgrade',
        name: 'D6+',
        cost: 1000,
        costMultiplier: 2,
        unlocked: false,
        unlockedAt: 500,
        count: 0,
        max: 10,
        htmlId: 'd6-upgrade',
        funcOnBuy: function () {
            unlockables.find(u => u.name === 'D6').doubleChance += 0.1;
        }
    },
    {
        type: 'column',
        name: 'Column',
        cost: 1000,
        costMultiplier: 4,
        unlocked: false,
        unlockedAt: 500,
        count: 1,
        max: 5,
        htmlId: 'column',
        funcOnBuy: function () {
            addColumn();
        }
    },
    {
        type: 'row',
        name: 'Row',
        cost: 1000,
        costMultiplier: 4,
        unlocked: false,
        unlockedAt: 500,
        count: 1,
        max: 5,
        htmlId: 'row',
        funcOnBuy: function () {
            addRow();
        }
    },
    {
        type: 'multipler',
        name: 'Roll x1.1',
        cost: 1000,
        costMultiplier: 1.25,
        unlocked: false,
        unlockedAt: 750,
        count: 0,
        max: 100,
        htmlId: 'roll-x1-1',
        funcOnBuy: function () {
            currentMultiplier += 0.1;
        }
    },
    {
        type: 'dice',
        name: 'D8',
        dieValue: 8,
        cost: 2000,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 1000,
        count: 0,
        max: 1,
        htmlId: 'd8',
        funcOnBuy: function () {
        }
    },
    {
        type: 'multipler',
        name: 'Crit x1.001',
        cost: 5000,
        costMultiplier: 1.5,
        unlocked: false,
        unlockedAt: 2500,
        count: 0,
        max: 100,
        htmlId: 'Crit-x1-1',
        funcOnBuy: function () {
            currentCriticalMultiplier += 0.001;
        }
    },
    {
        type: 'dice',
        name: 'D10',
        dieValue: 10,
        cost: 6000,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 3000,
        count: 0,
        max: 1,
        htmlId: 'd10',
        funcOnBuy: function () {
        }
    },
    {
        type: 'multiplier',
        name: 'Bonus + x2',
        cost: 7500,
        costMultiplier: 2,
        unlocked: false,
        unlockedAt: 2000,
        count: 0,
        max: 100,
        htmlId: 'bonus-x2',
        funcOnBuy: function () {
            currentBonusMultiplier += 2;
        }
    },
    {
        type: 'auto-roller',
        name: 'Auto Roller',
        cost: 10000,
        costMultiplier: 2,
        unlocked: false,
        unlockedAt: 5000,
        count: 0,
        max: 100,
        htmlId: 'auto-roller-1',
        funcOnBuy: function () {
            incAutoRollerSlot(Math.floor(Math.random() * autoRollerPeriod));
        }
    },
    {
        type: 'auto-roller',
        name: 'Auto Roller+',
        cost: 20000,
        costMultiplier: 2,
        unlocked: false,
        unlockedAt: 10000,
        count: 0,
        max: 100,
        htmlId: 'auto-roller-plus-1',
        funcOnBuy: function () {
            autoRollerPeriod *= 0.9;
            autoRollerPeriod = Math.round(autoRollerPeriod);
            // get sum of all auto rollers currnetly active
            let sum = autoRollers.reduce((acc, val) => acc + val, 0);
            // remove all auto rollers
            autoRollers.fill(0);
            // distribute the sum to the new period
            for (let i = 0; i < sum; i++) {
                incAutoRollerSlot(Math.floor(Math.random() * autoRollerPeriod));
            }
        }
    },
    {
        type: 'offset',
        name: 'Min +1',
        cost: 10000,
        costMultiplier: 4,
        unlocked: false,
        unlockedAt: 5000,
        count: 0,
        max: 100,
        htmlId: 'min-plus-1',
        funcOnBuy: function () {
            currentMinRollValueOffset += 1;
        }
    },
    {
        type: 'dice',
        name: 'D16',
        dieValue: 16,
        cost: 16000,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 8000,
        count: 0,
        max: 1,
        htmlId: 'd16',
        funcOnBuy: function () {
        }
    },
    {
        type: 'dice',
        name: 'D20',
        dieValue: 20,
        cost: 26000,
        costMultiplier: 1,
        unlocked: false,
        unlockedAt: 13000,
        count: 0,
        max: 1,
        htmlId: 'd20',
        funcOnBuy: function () {
        }
    }
]

let currentScore = 0;
let currentMultiplier = 1;
let currentMinRollValueOffset = 0;
let currentCriticalMultiplier = 0;
let currentBonusMultiplier = 2;
let editMode = false;

let bonusMultiplierRandomChance = 1 / 3600; // 1 in 3600 frames chance or 1 in 60 seconds (avg 30 seconds)
let bonusMultiplierActive = false;
let bonusMultiplierDuration = 500;
let bonusMultiplierDurationCounter = 0;

let autoRollerPeriod = 60;
const autoRollers = [];
for (let i = 0; i < autoRollerPeriod; i++) {
    autoRollers.push(0);
}
function incAutoRollerSlot(slot) {
    // increment the autoroller count at the slot
    autoRollers[slot]++;
}

let htmlScore = document.getElementById('score');
let htmlDiceBoardTable = document.getElementById('diceBoardTable');
let htmlShopTable = document.getElementById('shopTable');
let htmlEditButton = document.getElementById('edit-button');
let htmlShop = document.getElementById('shop');
let htmlMultiplier = document.getElementById('multiplier');
let htmlCriticalMultiplier = document.getElementById('critical-multiplier');
let htmlBonusMultiplier = document.getElementById('bonus-multiplier');

function buyUnlockable(unlockable) {
    if (unlockable.count >= unlockable.max) {
        alert('Max ' + unlockable.name + ' reached');
        return;
    }

    if (currentScore >= unlockable.cost) {
        let cost = unlockable.cost;
        unlockable.count++;
        unlockable.cost *= unlockable.costMultiplier;
        unlockable.funcOnBuy();
        updateScore(currentScore - cost);
        displayDiceBoardTable();
        updateUI();
    } else {
        alert('Not enough score to buy ' + unlockable.name);
        return;
    }

}


// this is a 2d board that represents what type of die is in each cell
// initially, all cells are empty expect top left with a D6
// the board may be expanded to include more dice
let board = [
    [6],
];

let boardLastRollValues = [
    [{
        value: 0,
        isCrit: false
    }]
];

let columnSums = [0];
let rowSums = [0];

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateScore(newScore) {
    currentScore = newScore;
    // update the score in the UI
    htmlScore.innerText = formatNumber(Math.round(currentScore));
}

function updateUI() {
    // check if we can unlock edit button
    if (currentScore >= 50)
        htmlEditButton.style.display = 'block';

    // check we can unlock the table
    if (currentScore >= 100) {
        htmlShop.style.display = 'block';
    }

    if (currentMultiplier > 1) {
        htmlMultiplier.innerText = 'Roll ' + currentMultiplier.toFixed(1) + 'x';
        htmlMultiplier.style.display = 'block';
    }

    if (currentCriticalMultiplier > 0) {
        htmlCriticalMultiplier.innerText = 'Crit ' + (1 + currentCriticalMultiplier).toFixed(3) + 'x';
        htmlCriticalMultiplier.style.display = 'block';
    }

    // update the shop table
    diplayShopTable();
}

// a loop that runs every 16ms and checks if the current frame is a multiple of the autoroller
function gameLoop() {
    let frame = 0;
    setInterval(() => {
        frame = (frame + 1) % 60;

        if (bonusMultiplierActive) {
            htmlBonusMultiplier.innerText = 'Bonus x' + currentBonusMultiplier;
            bonusMultiplierDurationCounter--;
            if (bonusMultiplierDurationCounter <= 0) {
                bonusMultiplierActive = false;
                htmlBonusMultiplier.style.display = 'none';
            }
        } else {
            if (Math.random() < bonusMultiplierRandomChance) {
                bonusMultiplierActive = true;
                bonusMultiplierDurationCounter = bonusMultiplierDuration;
                htmlBonusMultiplier.style.display = 'block';
            }
        }


        let autoRollerSlot = frame % autoRollerPeriod;
        if (autoRollers[autoRollerSlot] > 0) {
            for (let i = 0; i < autoRollers[autoRollerSlot]; i++) {
                rollDice();
            }
            updateScore(currentScore);
        }


        if (frame === 0) {
            updateUI();
        }
    }, 16);
}

function displayDiceBoardTable() {
    let table = htmlDiceBoardTable;
    table.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        let row = table.insertRow();
        for (let j = 0; j < board[i].length; j++) {
            let cell = row.insertCell();
            if (editMode) {
                let select = document.createElement('select');
                for (let key of unlockables) {
                    if (key.type === 'dice' && (key.count > 0 && key.unlocked)) {
                        let option = document.createElement('option');
                        option.value = key.dieValue;
                        option.text = key.name;
                        if (board[i][j] === key.dieValue) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    }
                }
                select.onchange = function () {
                    board[i][j] = parseInt(select.value);
                };
                cell.appendChild(select);
            } else {
                if (board[i][j] === "") {
                    cell.innerText = '?';
                }
                else {
                    let dieValue = boardLastRollValues[i][j].value || '?';
                    let dieType = board[i][j];
                    let dieName = unlockables.find(u => u.dieValue === dieType)?.name || '';
                    let cellStyle = boardLastRollValues[i][j].isCrit ? 'border: 2px solid green;' : '';
                    cell.innerHTML = `<div style="position: relative; height: 100%; width: 100%; padding-bottom: 10px; ${cellStyle}">
                                        <div style="position: absolute; top: 0; left: 0; font-size: small; margin-bottom: 5px;">${dieName}</div>
                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold;">${dieValue}</div>
                                      </div>`;
                }
            }
        }
        // // add row sum if not in edit mode
        // if (!editMode && board[i].length > 1) {
        //     let cell = row.insertCell();
        //     cell.innerText = rowSums[i];
        // }
    }
    // // add column sums if not in edit mode
    // if (!editMode && board.length > 1) {
    //     let row = table.insertRow();
    //     for (let j = 0; j < board[0].length; j++) {
    //         let cell = row.insertCell();
    //         cell.innerText = columnSums[j];
    //     }
    // }

    // add total sum if not in edit mode
    if (!editMode && board.length > 1 && board[0].length > 1) {
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerText = processBoardRoll().total;
    }
}

function diplayShopTable() {
    let table = htmlShopTable;
    table.innerHTML = '';
    for (let unlockable of unlockables) {
        if (unlockable.unlocked || currentScore >= unlockable.unlockedAt) {
            unlockable.unlocked = true;
            let row = table.insertRow();
            let cell = row.insertCell();
            cell.innerText = unlockable.name;
            cell = row.insertCell();
            cell.innerText = formatNumber(Math.round(unlockable.cost));
            cell = row.insertCell();
            cell.innerText = unlockable.count + '/' + unlockable.max;
            cell = row.insertCell();
            let button = document.createElement('button');
            button.innerText = 'Buy';
            button.onclick = function () {
                buyUnlockable(unlockable);
            };
            cell.appendChild(button);
            if (unlockable.count >= unlockable.max) {
                row.style.backgroundColor = 'lightgray';
                row.style.color = 'gray';
                button.disabled = true;
            }
        }
    }
}

function processBoardRoll() {

    let total = 0;

    // sum up all the dice values for rows and columns separately
    for (let i = 0; i < board.length; i++) {
        rowSums[i] = 0;
        for (let j = 0; j < board[i].length; j++) {
            let dieValue = boardLastRollValues[i][j].value;
            rowSums[i] += dieValue;
        }
    }

    for (let j = 0; j < board[0].length; j++) {
        columnSums[j] = 0;
        for (let i = 0; i < board.length; i++) {
            let dieValue = boardLastRollValues[i][j].value;
            columnSums[j] += dieValue;
        }
    }

    // sum up all the dice values
    total = rowSums.reduce((acc, val) => acc + val, 0);

    // reset crits
    boardLastRollValues.flat().forEach(cell => cell.isCrit = false);

    let criticals = 0;
    // check if if a row has all the same roll value
    for (let i = 0; i < board.length; i++) {
        let row = boardLastRollValues[i];
        let nonEmptyCount = row.filter(value => value.value !== 0).length;
        if (nonEmptyCount > 1 && row.every(value => value.value === row[0].value || value.value === 0)) {
            criticals++;
            row.forEach(cell => cell.isCrit = true);
        }
    }


    // check if if a column has all the same roll value
    for (let j = 0; j < board[0].length; j++) {
        let column = boardLastRollValues.map(row => row[j]);
        let nonEmptyCount = column.filter(value => value.value !== 0).length;
        if (nonEmptyCount > 1 && column.every(value => value.value === column[0].value || value.value === 0)) {
            criticals++;
            column.forEach(cell => cell.isCrit = true);
        }
    }


    if (board.length > 1 && board[0].length > 1) {
        // check if if a diagonal has all the same roll value
        let diagonal1 = [];
        let diagonal2 = [];
        for (let i = 0; i < board.length; i++) {
            diagonal1.push(boardLastRollValues[i][i]);
            diagonal2.push(boardLastRollValues[i][board.length - i - 1]);
        }

        let nonEmptyCount = diagonal1.filter(value => value.value !== 0).length;
        if (nonEmptyCount > 1 && diagonal1.every(value => value.value === diagonal1[0].value || value.value === 0)) {
            criticals++;
            diagonal1.forEach(cell => cell.isCrit = true);
        }

        nonEmptyCount = diagonal2.filter(value => value.value !== 0).length;
        if (nonEmptyCount > 1 && diagonal2.every(value => value.value === diagonal2[0].value || value.value === 0)) {
            criticals++;
            diagonal2.forEach(cell => cell.isCrit = true);
        }

        // if all the dice are the same, double the total
        nonEmptyCount = boardLastRollValues.flat().filter(value => value.value !== 0).length;
        if (nonEmptyCount > 1 && boardLastRollValues.flat().every(value => value.value === boardLastRollValues[0][0].value || value.value === 0)) {
            total *= 10;
            boardLastRollValues.flat().forEach(cell => cell.isCrit = true);
        }
    }

    return {
        total: total,
        criticals: criticals
    }
}

function rollDice100() {
    for (let i = 0; i < 100; i++) {
        rollDice();
    }
    updateScore(currentScore);

    // update ui
    updateUI();
}

function rollDice10() {
    for (let i = 0; i < 10; i++) {
        rollDice();
    }
    updateScore(currentScore);

    // update ui
    updateUI();
}

function rollDiceButton() {
    updateScore(rollDice());
    // update the dice board table
    displayDiceBoardTable();

    // update the UI
    updateUI();
}

function rollDice() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let dieType = board[i][j];
            let dieValue = dieType === "" ? 0 : Math.floor(Math.random() * dieType) + 1 + currentMinRollValueOffset;
            // find die unlockable
            let dieUnlockable = unlockables.find(u => u.dieValue === dieType);
            // double chance
            if (dieUnlockable && Math.random() < dieUnlockable.doubleChance) {
                dieValue *= 2;
            }
            boardLastRollValues[i][j].value = dieValue;
        }
    }

    let result = processBoardRoll();
    let fullRoll = result.total * currentMultiplier
    if (bonusMultiplierActive)
        fullRoll *= currentBonusMultiplier;
    let newScore = currentScore + fullRoll;
    if (result.criticals > 0)
        newScore *= 1 + currentCriticalMultiplier * result.criticals;
    currentScore = newScore;
    return currentScore;
}

function editModeToggle() {
    editMode = !editMode;
    updateScore(currentScore);
    displayDiceBoardTable();
}

function addRow() {
    board.push(new Array(board[0].length).fill(6));
    boardLastRollValues.push(new Array(board[0].length).fill({ value: 0, isCrit: false }));
    rowSums.push(0);
    updateScore(currentScore);
    displayDiceBoardTable();
}

function addColumn() {
    for (let i = 0; i < board.length; i++) {
        board[i].push(6);
        boardLastRollValues[i].push({ value: 0, isCrit: false });
    }
    columnSums.push(0);
    updateScore(currentScore);
    displayDiceBoardTable();
}

// initial setup
updateScore(0);
displayDiceBoardTable();

gameLoop();
