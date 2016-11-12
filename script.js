
var container = document.getElementById('container');
var controls = document.getElementById('controls');
var selectedCell;
var matrix = [];
var cells = [];
var mcells = [];
var valueEls = [];

function rand(n) {
  return Math.floor(Math.random() * n);
}

function selectCell() {
  selectedCell = this;
  var selected = document.getElementsByClassName('selected');
  if (selected.length > 0) selected[0].classList.remove('selected');
  selectedCell.classList.add('selected');
}

function initCell(cell, x, y) {
  cell.onclick = selectCell;
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
  var cell = document.createElement('div');
  cell.classList.add('cell');
  cell.classList.add('control');
  row.appendChild(cell);
  cell.classList.add('withvalue');
  var value = document.createElement('div');
  value.classList.add('value');
  value.innerHTML = 'X';
  cell.appendChild(value);
  cell.onclick = clearSelectedCell;
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

function updatePossibilities() {
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) for (var k = 0; k < 9; k++) mcells[i][j][k].style.opacity = 1;
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) if (matrix[i][j] !== 0) {
    var value = matrix[i][j] - 1;
    for (var k = 0; k < 9; k++) mcells[i][k][value].style.opacity = 0;
    for (var k = 0; k < 9; k++) mcells[k][j][value].style.opacity = 0;
    var x = Math.floor(i / 3), y = Math.floor(j / 3);
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) mcells[x * 3 + a][y * 3 + b][value].style.opacity = 0;
  }
}

function updateSuggestions() {
  var counter = [];
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) for (var k = 0; k < 9; k++) mcells[i][j][k].style.color = 'black';
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) counter[j] = 0;
    for (var j = 0; j < 9; j++) if (matrix[i][j] === 0) {
      for (var k = 0; k < 9; k++) counter[k] += parseInt(mcells[i][j][k].style.opacity);
    }
    for (var j = 0; j < 9; j++) if (matrix[i][j] === 0)
      for (var k = 0; k < 9; k++) if (counter[k] === 1)
        mcells[i][j][k].style.color = 'lightgreen';
  }
  for (var j = 0; j < 9; j++) {
    for (var i = 0; i < 9; i++) counter[i] = 0;
    for (var i = 0; i < 9; i++) if (matrix[i][j] === 0) {
      for (var k = 0; k < 9; k++) counter[k] += parseInt(mcells[i][j][k].style.opacity);
    }
    for (var i = 0; i < 9; i++) if (matrix[i][j] === 0)
      for (var k = 0; k < 9; k++) if (counter[k] === 1)
        mcells[i][j][k].style.color = 'lightgreen';
  }
  for (var x = 0; x < 3; x++) for (var y = 0; y < 3; y++) {
    for (var i = 0; i < 9; i++) counter[i] = 0;
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
      var i = x * 3 + a, j = y * 3 + b;
      if (matrix[i][j] === 0) {
        for (var k = 0; k < 9; k++) counter[k] += parseInt(mcells[i][j][k].style.opacity);
      }
    }
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
      var i = x * 3 + a, j = y * 3 + b;
      if (matrix[i][j] === 0) {
        for (var k = 0; k < 9; k++) if (counter[k] === 1)
          mcells[i][j][k].style.color = 'lightgreen';
      }
    }
  }
  for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) if (matrix[i][j] === 0) {
    var pos = [];
    for (var k = 0; k < 9; k++) if (parseInt(mcells[i][j][k].style.opacity) === 1) pos.push(k);
    if (pos.length === 1) mcells[i][j][pos[0]].style.color = 'lightgreen';
  }
}

function refreshBoard() {
  highlightInvalid();
  updatePossibilities();
  updateSuggestions();
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
  if (e.keyCode === 8 || e.keyCode === 46) {
    clearSelectedCell();
    return;
  }
  if (e.keyCode < 48 || e.keyCode > 57 || !selectedCell) return;
  fillSelectedCell(e.keyCode - 48);
}

function getFillSelectedCell(i) {
  return function() {
    fillSelectedCell(i);
  }
}

function fillSelectedCell(i) {
  selectedCell.classList.add('withvalue');
  setValue(selectedCell, i, i + '');
}

function clearSelectedCell() {
  selectedCell.classList.remove('withvalue');
  setValue(selectedCell, 0, '');
}

initGrid();
initControls();
document.onkeydown = listener;
