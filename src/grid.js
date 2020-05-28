// Grid functions
const fnGrid = {
  // Check if the grid contains a valid solution
  validate: (grid) => fnGrid.checkSymbols(grid) && fnGrid.checkRowsUnique(grid) && fnGrid.checkColsUnique(grid) && fnGrid.checkBlockUnique(grid),

  // For all cells, check if their value can be found in symbols
  checkSymbols: ({ symbols, matrix }) => matrix.every(row => row.every(v => symbols.indexOf(v)>=0)),

  // For all rows, check that each value is unique, but not necessarily a valid symbol
  // For each row, make a copy (because sort sorts in-place), sort the values, and if value is equal to the one before it, return false
  checkRowsUnique: ({ matrix }) => matrix.every(row => row.concat().sort().reduce((ra, v, i, arr) => (i!=0 && ra) ? v!=arr[i-1] : ra, true)),

  // Horribly inefficient, but convenient. Transpose matrix then what were originally columns are now rows
  checkColsUnique: ({ matrix }) => fnGrid.checkRowsUnique({ matrix: fnMatrix.transpose(matrix) }),

  // For each block, check that all values are unique
  checkBlockUnique: ({ matrix }) => {
    const _checkBlocksUnique = (row, col, matrix, blockLength) => { // Recurse through blocks in grid
      // if all blocks have been checked, the matrix is valid
      if (row >= matrix.length) return true
      // if cells in block are invalid, early termination
      else if (!_checkCellsUnique(0, 0, fnMatrix.submatrix(matrix, row, col, blockLength, blockLength), new Set())) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+blockLength >= matrix.length ? row+blockLength : row
        const nextCol = col+blockLength >= matrix.length ? 0 : col+blockLength
        return _checkBlocksUnique(nextRow, nextCol, matrix, blockLength)
      }
    }
    const _checkCellsUnique = (row, col, block, valueSet) => {  // Recurse through cells in grid
      // if all cells have been checked, the block is valid
      if (row >= block.length) return true
      // if cells in block are invalid, early termination
      const value = block[row][col]
      if (value==" " || valueSet.has(value)) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+1 >= block.length ? row+1 : row
        const nextCol = col+1 >= block.length ? 0 : col+1
        return _checkCellsUnique(nextRow, nextCol, block, valueSet.add(value))
      }
    }
    // first and only call in this function
    return _checkBlocksUnique(0, 0, matrix, Math.floor(Math.sqrt(matrix.length)))
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
      matrix: fnMatrix.toString(data.slice(1)),
    }
  }
}