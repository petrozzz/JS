const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NATURAL_NOTES = ["A", "B", "C", "D", "E", "F", "G"];
const OPEN_STRING_NOTES = {
  6: "E",
  5: "A",
  4: "D",
  3: "G",
  2: "B",
  1: "E"
};
const ROMAN_FRETS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const STORAGE_KEY = "guitar-fret-cards-stats-v1";

const modeSelect = document.getElementById("modeSelect");
const newRoundBtn = document.getElementById("newRoundBtn");
const resetStatsBtn = document.getElementById("resetStatsBtn");
const knowBtn = document.getElementById("knowBtn");
const dontKnowBtn = document.getElementById("dontKnowBtn");
const cardEl = document.getElementById("card");
const frontTextEl = document.getElementById("frontText");
const backTextEl = document.getElementById("backText");
const modeStatsNoteEl = document.getElementById("modeStatsNote");

const totalStatEl = document.getElementById("totalStat");
const knowStatEl = document.getElementById("knowStat");
const dontKnowStatEl = document.getElementById("dontKnowStat");
const accuracyStatEl = document.getElementById("accuracyStat");
const roundProgressNoteEl = document.getElementById("roundProgressNote");
const roundTimeNoteEl = document.getElementById("roundTimeNote");

let deck = [];
let roundDeck = [];
let roundIndex = 0;
let roundStartMs = 0;
let roundDurationSec = 0;
let isRoundFinished = false;
let currentCard = null;
let isAnswerVisible = false;

const stats = loadStats();

function noteAtFret(openNote, fret) {
  const startIndex = NOTES.indexOf(openNote);
  const targetIndex = (startIndex + fret) % NOTES.length;
  return NOTES[targetIndex];
}

function findNaturalFret(stringNum, targetNote) {
  for (let fret = 1; fret <= 12; fret += 1) {
    if (noteAtFret(OPEN_STRING_NOTES[stringNum], fret) === targetNote) {
      return fret;
    }
  }
  return null;
}

function buildDeck() {
  const cards = [];
  for (let stringNum = 6; stringNum >= 1; stringNum -= 1) {
    for (const note of NATURAL_NOTES) {
      const fret = findNaturalFret(stringNum, note);
      if (fret === null) {
        continue;
      }
      cards.push({
        stringNum,
        fret,
        fretRoman: ROMAN_FRETS[fret - 1],
        note
      });
    }
  }
  return cards;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderCard() {
  if (!currentCard || isRoundFinished) {
    frontTextEl.textContent = "Раунд завершен";
    backTextEl.textContent = "Новый раунд";
    cardEl.classList.remove("show-answer");
    isAnswerVisible = false;
    knowBtn.disabled = true;
    dontKnowBtn.disabled = true;
    return;
  }

  const mode = modeSelect.value;
  if (mode === "noteToFret") {
    frontTextEl.textContent = `${currentCard.stringNum}-${currentCard.note}`;
    backTextEl.textContent = `${currentCard.stringNum} ${currentCard.fretRoman}`;
  } else {
    frontTextEl.textContent = `${currentCard.stringNum} ${currentCard.fretRoman}`;
    backTextEl.textContent = `${currentCard.stringNum}-${currentCard.note}`;
  }

  cardEl.classList.remove("show-answer");
  isAnswerVisible = false;
  knowBtn.disabled = true;
  dontKnowBtn.disabled = true;
}

function goToCurrentCard() {
  if (roundIndex >= roundDeck.length) {
    isRoundFinished = true;
    roundDurationSec = Math.max(0, Math.round((Date.now() - roundStartMs) / 1000));
    currentCard = null;
  } else {
    currentCard = roundDeck[roundIndex];
  }
  updateRoundInfo();
  renderCard();
}

function startNewRound() {
  roundDeck = shuffle(deck);
  roundIndex = 0;
  roundStartMs = Date.now();
  roundDurationSec = 0;
  isRoundFinished = false;
  goToCurrentCard();
}

function revealAnswer() {
  if (isRoundFinished || !currentCard) {
    return;
  }

  if (isAnswerVisible) {
    cardEl.classList.remove("show-answer");
    isAnswerVisible = false;
    knowBtn.disabled = true;
    dontKnowBtn.disabled = true;
    return;
  }

  cardEl.classList.add("show-answer");
  isAnswerVisible = true;
  knowBtn.disabled = false;
  dontKnowBtn.disabled = false;
}

function emptyModeStats() {
  return { total: 0, know: 0, dontKnow: 0 };
}

function emptyStats() {
  return {
    global: emptyModeStats(),
    noteToFret: emptyModeStats(),
    fretToNote: emptyModeStats()
  };
}

function loadStats() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyStats();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      global: { ...emptyModeStats(), ...(parsed.global || {}) },
      noteToFret: { ...emptyModeStats(), ...(parsed.noteToFret || {}) },
      fretToNote: { ...emptyModeStats(), ...(parsed.fretToNote || {}) }
    };
  } catch (error) {
    return emptyStats();
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function updateStatsView() {
  const mode = modeSelect.value;
  const modeStats = stats[mode];
  const accuracy = modeStats.total > 0
    ? Math.round((modeStats.know / modeStats.total) * 100)
    : 0;

  totalStatEl.textContent = String(modeStats.total);
  knowStatEl.textContent = String(modeStats.know);
  dontKnowStatEl.textContent = String(modeStats.dontKnow);
  accuracyStatEl.textContent = `${accuracy}%`;

  const modeTitle = mode === "noteToFret" ? "Нота -> лад" : "Лад -> нота";
  modeStatsNoteEl.textContent =
    `Режим: ${modeTitle}. Общие попытки: ${stats.global.total}, знаю: ${stats.global.know}, не знаю: ${stats.global.dontKnow}.`;
}

function updateRoundInfo() {
  const answeredCount = Math.min(roundIndex, roundDeck.length);
  const currentTimeSec = isRoundFinished
    ? roundDurationSec
    : Math.max(0, Math.round((Date.now() - roundStartMs) / 1000));

  roundProgressNoteEl.textContent = `Карточка: ${answeredCount} / ${roundDeck.length}`;
  if (isRoundFinished) {
    roundTimeNoteEl.textContent = `Время раунда: ${formatDuration(currentTimeSec)} (завершен)`;
  } else {
    roundTimeNoteEl.textContent = `Время раунда: ${formatDuration(currentTimeSec)}`;
  }
}

function registerAnswer(isKnown) {
  if (!isAnswerVisible) {
    return;
  }

  const mode = modeSelect.value;
  stats.global.total += 1;
  stats[mode].total += 1;

  if (isKnown) {
    stats.global.know += 1;
    stats[mode].know += 1;
  } else {
    stats.global.dontKnow += 1;
    stats[mode].dontKnow += 1;
  }

  saveStats();
  updateStatsView();
  roundIndex += 1;
  goToCurrentCard();
}

function resetStats() {
  stats.global = emptyModeStats();
  stats.noteToFret = emptyModeStats();
  stats.fretToNote = emptyModeStats();
  saveStats();
  updateStatsView();
}

modeSelect.addEventListener("change", () => {
  updateStatsView();
  startNewRound();
});
newRoundBtn.addEventListener("click", startNewRound);
cardEl.addEventListener("click", revealAnswer);
knowBtn.addEventListener("click", () => registerAnswer(true));
dontKnowBtn.addEventListener("click", () => registerAnswer(false));
resetStatsBtn.addEventListener("click", resetStats);

deck = buildDeck();
updateStatsView();
startNewRound();
