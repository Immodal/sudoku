/*
const sketch = ( p ) => {
  p.setup = () => {
  }

  p.draw = () => {
  }
}
let p5Instance = new p5(sketch);
*/

// Grid functions
const fnGrid = {
  validate: ({ symbols, matrix }) => {

    return colSymbolsAreUnique(matrix)//symbolsAreValid(matrix, symbols) && rowSymbolsAreUnique(matrix)
  },
  // For all cells, check if their value can be found in symbols
  validateSymbols: ({ symbols, matrix }) => matrix.every(row => row.every(v => symbols.indexOf(v)>=0)),
  // For all rows, check that each value is unique, but not necessarily a valid symbol
  // For each row, make a copy (because sort sorts in-place), sort the values, and if value is equal to the one before it, return false
  validateRows: ({ matrix }) => matrix.every(row => row.concat().sort().reduce((ra, v, i, arr) => (i!=0 && ra) ? v!=arr[i-1] : ra, true)),
  // Horribly inefficient, but convenient. Transpose matrix then what were originally columns are now rows
  validateCols: ({ matrix }) => validateRows(matrix[0].map((col, i) => matrix.map(row => row[i]))),
  // No idea how to do this without for-loops
  validateBlocks: ({ matrix }) => {
    let blockLength = Math.floor(Math.sqrt(matrix.length))
    // Iterate through blocks in grid
    for (let blockRow=0; blockRow<matrix.length; blockRow+=blockLength) {
      for (let blockCol=0; blockCol<matrix.length; blockCol+=blockLength) {
        // Check cells in block
        let values = new Set();
        for (let i=0; i<blockLength; i++) {
          for (let j=0; j<blockLength; j++) {
            const value = matrix[blockRow+i][blockCol+j]
            if (value==" " || values.has(value)) {
              // if cell is empty or value has been seen before
              return false
            } else {
              values.add(value)
            }
          }
        }
      }
    }
    return true;
  },
  // Make a shallow copy of a given state
  copy: ({ symbols, matrix }) => {
    return {
      symbols: symbols.concat(),
      matrix: matrix.map(row => row.concat()),
    }
  },
  // Generate a string for exporting the state of the puzzle
  exportString: ({ symbols, matrix }) => symbols.join(" ") + "\n" + matrix.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", ""),
  // Generate a grid from a string
  importString: str => {
    const data = str.split("\n")
    return {
      symbols: data[0].split(" "),
      matrix: data.slice(1).map(row => row.split(",")),
    }
  }
}

const grid = fnGrid.importString(testGamesCompletedInvalid.a)
fnGrid.validate(grid)