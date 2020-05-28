/*
const sketch = ( p ) => {
  p.setup = () => {
  }

  p.draw = () => {
  }
}
let p5Instance = new p5(sketch);
*/

const fnMatrix = {
  submatrix: (matrix, row, col, rowLength, colLength) => 
    matrix
      .filter((_, i) => i >= row && i < row + rowLength)
      .map(r => r.slice(col, col + colLength)),
  transpose: matrix => matrix[0].map((col, i) => matrix.map(row => row[i])),
  copy: matrix => matrix.map(row => row.concat()),
}

// Grid functions
const fnGrid = {
  // Check if the grid contains a valid solution
  validate: (grid) => fnGrid.validateSymbols(grid) && fnGrid.validateRows(grid) && fnGrid.validateCols(grid) && fnGrid.validateBlocks(grid),
  // For all cells, check if their value can be found in symbols
  validateSymbols: ({ symbols, matrix }) => matrix.every(row => row.every(v => symbols.indexOf(v)>=0)),
  // For all rows, check that each value is unique, but not necessarily a valid symbol
  // For each row, make a copy (because sort sorts in-place), sort the values, and if value is equal to the one before it, return false
  validateRows: ({ matrix }) => matrix.every(row => row.concat().sort().reduce((ra, v, i, arr) => (i!=0 && ra) ? v!=arr[i-1] : ra, true)),
  // Horribly inefficient, but convenient. Transpose matrix then what were originally columns are now rows
  validateCols: ({ matrix }) => fnGrid.validateRows({ matrix: fnMatrix.transpose(matrix) }),
  // For each block, check that all values are unique
  validateBlocks: ({ matrix }) => fnGrid._validateBlocks(0, 0, matrix, Math.floor(Math.sqrt(matrix.length))),
  // Helper function for validateBlocks
  _validateBlocks: (row, col, matrix, blockLength) => {
    // if all blocks have been checked, the matrix is valid
    if (row >= matrix.length) return true
    // if cells in block are invalid, early termination
    else if (!fnGrid._validateCells(0, 0, fnMatrix.submatrix(matrix, row, col, blockLength, blockLength), new Set())) return false
    else {
      // If the next col is out of bounds, go to next row
      const nextRow = col+blockLength >= matrix.length ? row+blockLength : row
      const nextCol = col+blockLength >= matrix.length ? 0 : col+blockLength
      return fnGrid._validateBlocks(nextRow, nextCol, matrix, blockLength)
    }
  },
  // Helper function for _validateBlocks
  _validateCells: (row, col, block, valueSet) => {
    // if all cells have been checked, the block is valid
    if (row >= block.length) return true

    const value = block[row][col]
    // if cells in block are invalid, early termination
    if (value==" " || valueSet.has(value)) return false
    else {
      // If the next col is out of bounds, go to next row
      const nextRow = col+1 >= block.length ? row+1 : row
      const nextCol = col+1 >= block.length ? 0 : col+1
      return fnGrid._validateCells(nextRow, nextCol, block, valueSet.add(value))
    }
  },
  // Make a shallow copy of a given state
  copy: ({ symbols, matrix }) => {
    return {
      symbols: symbols.concat(),
      matrix: fnMatrix.copy(matrix),
    }
  },
  // Generate a string for exporting the state of the puzzle, then remove last unnecessary "\n"
  exportString: ({ symbols, matrix }) => symbols.join(" ") + "\n" + matrix.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", "").slice(0, -1),
  // Generate a grid from a string
  importString: str => {
    const data = str.split("\n")
    return {
      symbols: data[0].split(" "),
      matrix: data.slice(1).map(row => row.split(",")),
    }
  }
}

//const grid = fnGrid.importString(testGamesCompletedInvalid.a)
//fnGrid.validate(grid)