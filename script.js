const screens = {
  home: document.getElementById('homeScreen'),
  rules: document.getElementById('rulesScreen'),
  game: document.getElementById('gameScreen'),
};

const playSoloBtn = document.getElementById('playSoloBtn');
const playFriendBtn = document.getElementById('playFriendBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const aboutBtn = document.getElementById('aboutBtn');
const rulesBtn = document.getElementById('rulesBtn');
const backFromRules = document.getElementById('backFromRules');
const backFromGame = document.getElementById('backFromGame');
const backFromGameText = document.getElementById('backFromGameText');
const resetBtn = document.getElementById('resetBtn');
const languageBtn = document.getElementById('languageBtn');
const difficultyButtons = [...document.querySelectorAll('.difficulty-btn')];
const playSoloText = document.getElementById('playSoloText');
const playFriendText = document.getElementById('playFriendText');
const howToPlayText = document.getElementById('howToPlayText');
const aboutText = document.getElementById('aboutText');
const homeInfoText = document.getElementById('homeInfoText');
const difficultyLabel = document.getElementById('difficultyLabel');
const backFromRulesText = document.getElementById('backFromRulesText');
const rulesTitle = document.getElementById('rulesTitle');
const resetText = document.getElementById('resetText');
const gameRulesText = document.getElementById('gameRulesText');
const appTitle = document.getElementById('appTitle');
const appSubtitle = document.getElementById('appSubtitle');
const modeLabel = document.getElementById('modeLabel');
const gameModeTitle = document.getElementById('gameModeTitle');
const playerScoreEl = document.getElementById('playerScore');
const botScoreEl = document.getElementById('botScore');
const opponentLabel = document.querySelectorAll('.score-bar .score-item .score-label')[1];
const cells = [...document.querySelectorAll('.cell')];

let boardState = Array(9).fill('');
let active = true;
let currentPlayer = 'X';
let playerScore = 0;
let botScore = 0;
let versusBot = true;
let currentDifficulty = 'easy';
let currentLang = 'en';
let screenStack = ['home'];

const winningLines = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

const localeData = window.localeData || {};
const supportedLangs = ['en', 'ar'];

function translate(key) {
  const locale = localeData[currentLang] || localeData.en;
  return locale && locale[key] ? locale[key] : (localeData.en[key] || key);
}

function activateScreen(name) {
  Object.values(screens).forEach(screen => {
    screen.classList.toggle('active', screen === screens[name]);
  });
}

function showScreen(name) {
  if (!screens[name]) return;
  const current = screenStack[screenStack.length - 1];
  if (current === name) return;
  screenStack.push(name);
  activateScreen(name);
}

function goBack() {
  if (screenStack.length > 1) {
    screenStack.pop();
  }
  const previous = screenStack[screenStack.length - 1] || 'home';
  activateScreen(previous);
}

function updateBoard() {
  boardState.forEach((mark, index) => {
    const cell = cells[index];
    cell.textContent = mark;
    cell.classList.toggle('mark-x', mark === 'X');
    cell.classList.toggle('mark-o', mark === 'O');
  });
}

function checkWinner(player) {
  return winningLines.some(line => line.every(i => boardState[i] === player));
}

function isDraw() {
  return boardState.every(Boolean) && !checkWinner('X') && !checkWinner('O');
}

function finishGame(result) {
  active = false;
  if (result === 'X') {
    gameStatus.textContent = translate('youWin');
    playerScore += 1;
    playerScoreEl.textContent = playerScore;
  } else if (result === 'O' && versusBot) {
    gameStatus.textContent = translate('botWins');
    botScore += 1;
    botScoreEl.textContent = botScore;
  } else if (result === 'O' && !versusBot) {
    gameStatus.textContent = translate('opponentWins');
  } else {
    gameStatus.textContent = translate('drawGame');
  }
}

function pickRandom(emptyIndexes) {
  return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
}

function findWinningMove(mark) {
  for (const line of winningLines) {
    const values = line.map(i => boardState[i]);
    const emptyCount = values.filter(v => v === '').length;
    const markCount = values.filter(v => v === mark).length;
    if (emptyCount === 1 && markCount === 2) {
      return line[values.indexOf('')];
    }
  }
  return null;
}

function chooseBotMove() {
  const emptyIndexes = boardState
    .map((value, index) => value === '' ? index : null)
    .filter(index => index !== null);
  if (!emptyIndexes.length) return null;

  if (currentDifficulty !== 'easy') {
    const winMove = findWinningMove('O');
    if (winMove !== null) return winMove;

    const blockMove = findWinningMove('X');
    if (blockMove !== null) return blockMove;
  }

  if (currentDifficulty === 'hard') {
    if (boardState[4] === '') return 4;
    const corners = [0,2,6,8].filter(i => boardState[i] === '');
    if (corners.length) return pickRandom(corners);
  }

  return pickRandom(emptyIndexes);
}

function botMove() {
  const choice = chooseBotMove();
  if (choice === null || !active) return;
  boardState[choice] = 'O';
  updateBoard();
  if (checkWinner('O')) {
    finishGame('O');
    return;
  }
  if (isDraw()) {
    finishGame('draw');
    return;
  }
  currentPlayer = 'X';
  gameStatus.textContent = translate('yourTurn');
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (!active || boardState[index]) return;

  boardState[index] = currentPlayer;
  updateBoard();

  const cell = cells[index];
  cell.classList.remove('placed');
  void cell.offsetWidth;
  cell.classList.add('placed');
  setTimeout(() => cell.classList.remove('placed'), 220);

  if (checkWinner(currentPlayer)) {
    finishGame(currentPlayer);
    return;
  }

  if (isDraw()) {
    finishGame('draw');
    return;
  }

  if (versusBot) {
    if (currentPlayer === 'X') {
      currentPlayer = 'O';
      gameStatus.textContent = translate('botTurn');
      setTimeout(botMove, 520);
    }
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.textContent = currentPlayer === 'X' ? translate('xTurn') : translate('oTurn');
  }
}

function resetGame() {
  boardState = Array(9).fill('');
  active = true;
  currentPlayer = 'X';
  updateBoard();
  gameStatus.textContent = versusBot ? translate('yourTurn') : translate('xTurn');
  updateModeTitle();
}

function updateModeTitle() {
  if (versusBot) {
    gameModeTitle.textContent = translate('difficultyNames')[currentDifficulty];
    opponentLabel.textContent = translate('botLabel');
  } else {
    gameModeTitle.textContent = translate('friendMode');
    opponentLabel.textContent = translate('friendLabel');
  }
}

function updateDifficultyButtons() {
  difficultyButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.difficulty === currentDifficulty);
  });
  const current = translate('difficultyNames')[currentDifficulty];
  if (current) gameModeTitle.textContent = versusBot ? current : translate('friendMode');
}

function setLanguage(lang) {
  if (!supportedLangs.includes(lang)) return;
  currentLang = lang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  const locale = localeData[currentLang] || localeData.en;
  languageBtn.textContent = locale.flag || '🌐';
  appTitle.textContent = translate('appTitle');
  appSubtitle.textContent = translate('appSubtitle');
  playSoloText.textContent = translate('playSolo');
  playFriendText.textContent = translate('playFriend');
  howToPlayText.textContent = translate('howToPlay');
  aboutText.textContent = translate('about');
  homeInfoText.textContent = translate('homeInfo');
  difficultyLabel.textContent = translate('difficultyLabel');
  backFromRulesText.textContent = translate('backButton');
  backFromGameText.textContent = translate('backButton');
  rulesTitle.textContent = translate('rulesTitle');
  resetText.textContent = translate('reset');
  gameRulesText.textContent = translate('rules');
  modeLabel.textContent = translate('mode');
  updateModeTitle();
  gameStatus.textContent = active ? (versusBot ? translate('yourTurn') : translate('xTurn')) : gameStatus.textContent;
}

function cycleLanguage() {
  const nextIndex = (supportedLangs.indexOf(currentLang) + 1) % supportedLangs.length;
  setLanguage(supportedLangs[nextIndex]);
}

playSoloBtn.addEventListener('click', () => {
  versusBot = true;
  resetGame();
  updateModeTitle();
  showScreen('game');
});

playFriendBtn.addEventListener('click', () => {
  versusBot = false;
  resetGame();
  updateModeTitle();
  showScreen('game');
});

rulesBtn.addEventListener('click', () => showScreen('rules'));
backFromRules.addEventListener('click', goBack);
backFromGame.addEventListener('click', goBack);
resetBtn.addEventListener('click', resetGame);
howToPlayBtn.addEventListener('click', () => showScreen('rules'));
aboutBtn.addEventListener('click', () => {
  alert(translate('aboutMessage'));
});
languageBtn.addEventListener('click', cycleLanguage);

difficultyButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentDifficulty = button.dataset.difficulty;
    updateDifficultyButtons();
    updateModeTitle();
  });
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

setLanguage(currentLang);
updateModeTitle();
playerScoreEl.textContent = playerScore;
botScoreEl.textContent = botScore;
updateBoard();
