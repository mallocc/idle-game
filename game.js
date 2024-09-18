console.log('Game script loaded');

let currentScore = 0;
let editMode = false;
let columnPrice = 1000;
let columnPriceMultiplier = 2;
let rowPrice = 50000;
let rowPriceMultiplier = 4;

const averageDieValue = 3.5;

const DiceType = {
    // the different types of dice that can be rolled
    empty: 0,
    D4: 4,
    D6: 6,
    D8: 8,
    D10: 10,
    D12: 12,
    D20: 20,
    D100: 100
}

const DiceTypeNames = {
    // the names of the dice types
    [DiceType.empty]: '?',
    [DiceType.D4]: 'D4',
    [DiceType.D6]: 'D6',
    [DiceType.D8]: 'D8',
    [DiceType.D10]: 'D10',
    [DiceType.D12]: 'D12',
    [DiceType.D20]: 'D20',
    [DiceType.D100]: 'D100'
}

const DiceTypeCosts = {
    // the cost of each die type
    [DiceType.D4]: 0,
    [DiceType.D6]: 500,
    [DiceType.D8]: 2000,
    [DiceType.D10]: 6000,
    [DiceType.D12]: 16000,
    [DiceType.D20]: 26000,
    [DiceType.D100]: 100000000
}

let unlockedDiceTypes = [
    DiceType.empty,
    DiceType.D4,
];

function buyD(diceType) {
    if (currentScore < DiceTypeCosts[diceType]) {
        alert('Not enough money to buy this die. You need ' + formatNumber(DiceTypeCosts[diceType] - currentScore) + ' more.');
        return;
    }

    unlockedDiceTypes.push(diceType);
    updateScore(currentScore - DiceTypeCosts[diceType]);
    displayDiceBoardTable();

    // disable the button now that we have bought it
    document.getElementById(`buy-${DiceTypeNames[diceType].toLowerCase()}`).disabled = true;
}


// this is a 2d board that represents what type of die is in each cell
// initially, all cells are empty expect top left with a D6
// the board may be expanded to include more dice
let board = [
    [DiceType.D4],
];

let boardLastRollValues = [
    [0]
];

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateScore(newScore) {
    // update the score in the UI
    currentScore = newScore;
    // update the score in the UI
    document.getElementById('score').innerText = formatNumber(Math.round(currentScore));
}

// a loop that runs every 16ms and checks if the current frame is a multiple of the autoroller
function gameLoop() {
    let frame = 0;
    setInterval(() => {
        frame = (frame + 1) % 60;

        if (currentScore > 50)
            document.getElementById('edit-button').style.display = 'inline';

        if (currentScore > 100)
            document.getElementById('buy-d6').style.display = 'inline';

        if (currentScore > 500)
            document.getElementById('buy-column-button').style.display = 'inline';

        if (currentScore > 1000)
            document.getElementById('buy-d8').style.display = 'inline';

        if (currentScore > 3000)
            document.getElementById('buy-d10').style.display = 'inline';

        if (currentScore > 8000)
            document.getElementById('buy-d12').style.display = 'inline';

        if (currentScore > 13000)
            document.getElementById('buy-d20').style.display = 'inline';

        if (currentScore > 25000)
            document.getElementById('buy-row-button').style.display = 'inline';

    }, 16);
}

function displayDiceBoardTable() {
    let table = document.getElementById('diceBoardTable');
    table.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        let row = table.insertRow();
        for (let j = 0; j < board[i].length; j++) {
            let cell = row.insertCell();
            if (editMode) {
                let select = document.createElement('select');
                for (let key of unlockedDiceTypes) {
                    let option = document.createElement('option');
                    option.value = key;
                    option.text = DiceTypeNames[key];
                    if (board[i][j] === key) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
                select.onchange = function () {
                    board[i][j] = parseInt(select.value);
                };
                cell.appendChild(select);
            } else {
                if (board[i][j] === DiceType.empty) {
                    cell.innerText = '?';
                }
                else {
                    cell.innerText = boardLastRollValues[i][j] || '?';
                }
            }
        }
    }
}

function processBoardRoll() {
    let total = 0;
    // sum up all the dice values
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let dieValue = boardLastRollValues[i][j];
            total += dieValue;
        }
    }


    // check if if a row has all the same roll value
    for (let i = 0; i < board.length; i++) {
        let row = boardLastRollValues[i];
        let nonEmptyCount = row.filter(value => value !== 0).length;
        if (nonEmptyCount > 1 && row.every(value => value === row[0] || value === 0)) {
            // sum the row value twice
            sum = row.reduce((a, b) => a + b, 0);
            total += sum + sum;
        }
    }


    // check if if a column has all the same roll value
    for (let j = 0; j < board[0].length; j++) {
        let column = boardLastRollValues.map(row => row[j]);
        let nonEmptyCount = column.filter(value => value !== 0).length;
        if (nonEmptyCount > 1 && column.every(value => value === column[0] || value === 0)) {
            // sum the column value twice
            sum = column.reduce((a, b) => a + b, 0);
            total += sum + sum;
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

        let nonEmptyCount = diagonal1.filter(value => value !== 0).length;
        if (nonEmptyCount > 1 && diagonal1.every(value => value === diagonal1[0] || value === 0)) {
            sum = diagonal1.reduce((a, b) => a + b, 0);
            total += sum + sum;
        }

        nonEmptyCount = diagonal2.filter(value => value !== 0).length;
        if (nonEmptyCount > 1 && diagonal2.every(value => value === diagonal2[0] || value === 0)) {
            sum = diagonal2.reduce((a, b) => a + b, 0);
            total += sum + sum;
        }

    }

    return total;
}

function rollDice100() {
    for (let i = 0; i < 100; i++) {
        rollDice();
    }
}

function rollDice10() {
    for (let i = 0; i < 10; i++) {
        rollDice();
    }
}

function rollDice() {
    if (editMode) {
        editMode = false;
        displayDiceBoardTable();
    }

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let dieType = board[i][j];
            let dieValue = dieType === DiceType.empty ? 0 : Math.floor(Math.random() * dieType) + 1;
            boardLastRollValues[i][j] = dieValue;
        }
    }

    updateScore(currentScore + processBoardRoll());
    displayDiceBoardTable();
}

function editModeToggle() {
    editMode = !editMode;
    displayDiceBoardTable();
}

function addRow() {
    board.push(new Array(board[0].length).fill(DiceType.empty));
    boardLastRollValues.push(new Array(board[0].length).fill(0));
    displayDiceBoardTable();
}

function addColumn() {
    for (let i = 0; i < board.length; i++) {
        board[i].push(DiceType.empty);
        boardLastRollValues[i].push(0);
    }
    displayDiceBoardTable();
}

function buyColumn() {
    if (currentScore < columnPrice) {
        alert('Not enough money to buy a column. You need ' + formatNumber(columnPrice - currentScore) + ' more.');
        return;
    }

    updateScore(currentScore - columnPrice);
    addColumn();
    columnPrice *= columnPriceMultiplier;
}

function buyRow() {
    if (currentScore < rowPrice) {
        alert('Not enough money to buy a row. You need ' + formatNumber(rowPrice - currentScore) + ' more.');
        return;
    }

    updateScore(currentScore - rowPrice);
    addRow();
    rowPrice *= rowPriceMultiplier;
}

// initial setup
updateScore(0);
displayDiceBoardTable();

gameLoop();
