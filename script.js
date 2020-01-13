
var container = document.getElementById('container');
var controls = document.getElementById('controls');
var selectedCell;
var matrix = [];
var cells = [];
var mcells = [];
var valueEls = [];
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_TAB = 9;
var refreshDisabled = false;

function rand(n) {
  return Math.floor(Math.random() * n);
}

function cellOnClick() {
  if (!this.classList.contains('cell')) return;
  selectCell(this.getAttribute('data-row'), this.getAttribute('data-col'));
}

function selectCell(x, y) {
  selectedCell = cells[x][y];
  var selected = document.getElementsByClassName('selected');
  if (selected.length > 0) selected[0].classList.remove('selected');
  selectedCell.classList.add('selected');
}

function initCell(cell, x, y) {
  cell.onclick = cellOnClick;
  for (var i = 0; i < 3; i++) {
    var row = document.createElement('div');
    row.classList.add('microrow');
    cell.appendChild(row);
    for (var j = 0; j < 3; j++) {
      var mcell = document.createElement('div');
      mcell.classList.add('microcell');
      row.appendChild(mcell);
      mcells[x][y].push(mcell);
      mcell.innerHTML = (i * 3 + j + 1) + '';
    }
  }
  var value = document.createElement('div');
  valueEls[x].push(value);
  value.classList.add('value');
  cell.appendChild(value);
}

function initGrid() {
  for (var i = 0; i < 9; i++) {
    var values = []
    matrix.push(values);
    var cellsrow = [];
    cells.push(cellsrow);
    var mcellsrow = [];
    mcells.push(mcellsrow);
    valueEls.push([]);
    var row = document.createElement('div');
    row.classList.add('row');
    container.appendChild(row);
    for (var j = 0; j < 9; j++) {
      values.push(0);
      var cell = document.createElement('div');
      cellsrow.push(cell);
      mcellsrow.push([]);
      cell.classList.add('cell');
      cell.setAttribute('data-row', i);
      cell.setAttribute('data-col', j);
      row.appendChild(cell);
      initCell(cell, i, j);
      if (i % 3 === 0) cell.classList.add('topstrong');
      if (j % 3 === 0) cell.classList.add('leftstrong');
    }
  }
}

function initControls() {
  var row = document.createElement('div');
  row.classList.add('row');
  controls.appendChild(row);
  for (var i = 0; i < 9; i++) {
    var cell = document.createElement('div');
    cell.classList.add('cell');
    cell.classList.add('control');
    row.appendChild(cell);
    cell.classList.add('withvalue');
    var value = document.createElement('div');
    value.classList.add('value');
    value.innerHTML = i + 1 + '';
    cell.appendChild(value);
    cell.onclick = getFillSelectedCell(i + 1);
  }
  row.appendChild(createButton('X', clearSelectedCell));
  document.getElementById('reset').appendChild(createButton("\u{21bb}", resetSudoku));
}

function createButton(text, action) {
  var cell = document.createElement('div');
  cell.classList.add('cell');
  cell.classList.add('control');
  cell.classList.add('withvalue');
  var value = document.createElement('div');
  value.classList.add('value');
  value.innerHTML = text;
  cell.appendChild(value);
  cell.onclick = action;
  return cell;
}

function highlightInvalid() {
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) cells[i][j].classList.remove('invalid');
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) if (matrix[i][j] !== 0) {
    var valid = true;
    for (var k = 0; k < 9; k++) valid &= k === j || matrix[i][k] !== matrix[i][j];
    for (var k = 0; k < 9; k++) valid &= k === i || matrix[k][j] !== matrix[i][j];
    var x = Math.floor(i / 3), y = Math.floor(j / 3);
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) valid &= (x * 3 + a === i && y * 3 + b === j) || matrix[x * 3 + a][y * 3 + b] !== matrix[i][j];
    if (!valid) cells[i][j].classList.add('invalid');
  }
}

function resetPossibilities() {
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) for (var k = 0; k < 9; k++) mcells[i][j][k].style.opacity = 1;
}

function removePossibility(i, j, k) {
  mcells[i][j][k - 1].style.opacity = 0;
}

function removePossibilityInRow(i, rj, v) {
  for (var j = 0; j < 9; j++) if (j !== rj) removePossibility(i, j, v);
}

function removePossibilityInColumn(ri, j, v) {
  for (var i = 0; i < 9; i++) if (i !== ri) removePossibility(i, j, v);
}

function removePossibilityInBlock(i, j, v) {
  const x = Math.floor(i / 3), y = Math.floor(j / 3);
  for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) if (x * 3 + a !== i || y * 3 + b !== j)
    removePossibility(x * 3 + a, y * 3 + b, v);
}

function recomputePossibilities() {
  resetPossibilities();
  updateByExploredSolution();
  updateByHiddenSingle();
  updateByNakedSingle();
}

function updateByExploredSolution() {
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) if (matrix[i][j] !== 0)
    removePossibilityForConfirmedSuggestion(i, j, matrix[i][j]);
}

function removePossibilityForConfirmedSuggestion(i, j, v) {
  removePossibilityInRow(i, j, v);
  removePossibilityInColumn(i, j, v);
  removePossibilityInBlock(i, j, v);
}

function updateByNakedSingle() {
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) {
    const ns = getNakedSingle(i, j);
    if (ns !== 0) removePossibilityForConfirmedSuggestion(i, j, ns);
  }
}

function getNakedSingle(i, j) {
  if (matrix[i][j] !== 0) return 0;
  var foundNS = 0;
  for (var k = 0; k < 9; k++) {
    const visible = parseInt(mcells[i][j][k].style.opacity);
    if (foundNS > 0 && visible) return 0;
    if (visible) foundNS = k + 1;
  }
  return foundNS;
}

function updateByHiddenSingle() {
  for (var i = 0; i < 9; i++) updateByHiddenSinglesInRow(i);
  for (var j = 0; j < 9; j++) updateByHiddenSinglesInColumn(j);
  for (var i = 0; i < 9; i += 3) for (var j = 0; j < 9; j += 3)
    updateByHiddenSinglesInBlock(i, j);
}

function updateCounter(i, j, counter, posx, posy) {
  if (matrix[i][j] !== 0) return;
  for (var k = 0; k < 9; k++) {
    if (parseInt(mcells[i][j][k].style.opacity)) {
      counter[k]++;
      posx[k] = i;
      posy[k] = j;  
    }
  }
}

function getHiddenSingles(counter) {
  return counter.map((e, i) => e === 1 ? i + 1 : 0).filter(i => i);
}

function removePossibilitiesForHiddenSingles(hs, posx, posy) {
  hs.forEach(hsi => {
    const x = posx[hsi - 1], y = posy[hsi - 1];
    removePossibilityForConfirmedSuggestion(x, y, hsi);
    for (var k = 0; k < 9; k++) if (k + 1 !== hsi) removePossibility(x, y, k + 1);
  });
  return hs.length > 0;
}

function updateByHiddenSinglesInRow(i) {
  var counter = Array(9).fill(0);
  var posx = Array(9).fill(-1);
  var posy = Array(9).fill(-1);
  for (var j = 0; j < 9; j++) updateCounter(i, j, counter, posx, posy);
  return removePossibilitiesForHiddenSingles(getHiddenSingles(counter), posx, posy);
}

function updateByHiddenSinglesInColumn(j) {
  var counter = Array(9).fill(0);
  var posx = Array(9).fill(-1);
  var posy = Array(9).fill(-1);
  for (var i = 0; i < 9; i++) updateCounter(i, j, counter, posx, posy);
  return removePossibilitiesForHiddenSingles(getHiddenSingles(counter), posx, posy);
}

function updateByHiddenSinglesInBlock(i, j) {
  var counter = Array(9).fill(0);
  var posx = Array(9).fill(-1);
  var posy = Array(9).fill(-1);
  for (var x = 0; x < 3; x++) for (var y = 0; y < 3; y++) updateCounter(i + x, j + y, counter, posx, posy);
  return removePossibilitiesForHiddenSingles(getHiddenSingles(counter), posx, posy);
}

function getElement(x) {
  const i = Math.floor(x / 9), j = x % 9;
  return i === 9 ? 0 : matrix[i][j];
}

function setElement(x, v) {
  const i = Math.floor(x / 9), j = x % 9;
  if (v === 0 || i === 9) return;
  fill(cells[i][j], v);
}

function encodeState() {
  const size = Math.ceil(81 / 2);
  const state = new Uint8Array(size);
  for (var i = 0; i < size; i++) state[i] = getElement(i * 2) * 16 + getElement(i * 2 + 1);
  return state;
}

function decodeState() {
  var hash = window.location.hash;
  if (!hash) return;
  refreshDisabled = true;
  console.log('Decoding', hash);
  const state = fromString(atob(hash.substr(1)));
  for (var i = 0; i < 81 / 2; i++) {
    setElement(i * 2, Math.floor(state[i] / 16));
    setElement(i * 2 + 1, state[i] % 16);
  }
  refreshDisabled = false;
  refreshBoard();
}

function mkString(arr) {
  var str = '';
  for (var i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return str;
}

function fromString(str) {
  const arr = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

function updateHash() {
  window.location.hash = btoa(mkString(encodeState()));
}

function refreshBoard() {
  if (refreshDisabled) return;
  updateHash();
  highlightInvalid();
  recomputePossibilities();
}

function setValue(cell, value, label) {
  var els = cell.getElementsByClassName('value');
  if (els.length > 0) {
    var el = els[0];
    el.innerHTML = label;
    var row = parseInt(cell.getAttribute('data-row'));
    var col = parseInt(cell.getAttribute('data-col'));
    matrix[row][col] = value;
  }
  refreshBoard();
}

function listener(e) {
  if (e.keyCode === KEY_LEFT || (e.keyCode === KEY_TAB && e.shiftKey)) {
    var x = parseInt(selectedCell.getAttribute('data-row')),
        y = parseInt(selectedCell.getAttribute('data-col'));
    if (y > 0) selectCell(x, y - 1);
    e.preventDefault();
  }
  if (e.keyCode === KEY_RIGHT || (e.keyCode === KEY_TAB && !e.shiftKey)) {
    var x = parseInt(selectedCell.getAttribute('data-row')),
        y = parseInt(selectedCell.getAttribute('data-col'));
    if (y < 8) selectCell(x, y + 1);
    e.preventDefault();
  }
  if (e.keyCode === KEY_UP || (e.keyCode === KEY_ENTER && e.shiftKey)) {
    var x = parseInt(selectedCell.getAttribute('data-row')),
        y = parseInt(selectedCell.getAttribute('data-col'));
    if (x > 0) selectCell(x - 1, y);
    e.preventDefault();
  }
  if (e.keyCode === KEY_DOWN || (e.keyCode === KEY_ENTER && !e.shiftKey)) {
    var x = parseInt(selectedCell.getAttribute('data-row')),
        y = parseInt(selectedCell.getAttribute('data-col'));
    if (x < 8) selectCell(x + 1, y);
    e.preventDefault();
  }
  if (e.keyCode === 8 || e.keyCode === 46) {
    clearSelectedCell();
    e.preventDefault();
  }
  if (e.keyCode >= 48 && e.keyCode <= 57) {
    fillSelectedCell(e.keyCode - 48);
    e.preventDefault();
  }
}

function getFillSelectedCell(i) {
  return function() {
    fillSelectedCell(i);
  }
}

function fill(cell, i) {
  cell.classList.add('withvalue');
  setValue(cell, i, i + '');
}

function fillSelectedCell(i) {
  if (!selectedCell) return;
  fill(selectedCell, i);
}

function clear(cell) {
  cell.classList.remove('withvalue');
  setValue(cell, 0, '');
}

function clearSelectedCell() {
  if (!selectedCell) return;
  clear(selectedCell);
}

function resetSudoku() {
  refreshDisabled = true;
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) clear(cells[i][j]);
  refreshDisabled = false;
  refreshBoard();
}

initGrid();
initControls();
document.onkeydown = listener;
document.addEventListener('DOMContentLoaded', decodeState);