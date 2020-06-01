// Grid functions
const fnGrid = {
  // Sets the value of a cell in a grid.
  setValue: (grid, row, col, value) => grid.setIn(['matrix', row, col], value),

  // Get the submatrix the cell at (row, col) belongs to
  getBlock: (grid, row, col) => {
    const blockLength = fnGrid.getBlockLen(grid)
    const rowOffset = row - (row % blockLength)
    const colOffset = col - (col % blockLength)
    return fnMatrix.submatrix(grid.get("matrix"), rowOffset, colOffset, blockLength, blockLength)
  },
  // For square Sudoku boards, the block length is always sqrt(board length)
  getBlockLen: grid => Math.floor(Math.sqrt(grid.get("matrix").count())),

  // Check if the grid contains a valid solution
  validate: grid => fnGrid.checkSymbols(grid) && fnGrid.checkRowsUnique(grid) && fnGrid.checkColsUnique(grid) && fnGrid.checkBlockUnique(grid),

  // For all cells, check if their value can be found in symbols
  checkSymbols: grid => grid.get("matrix").every(row => row.every(v => grid.get("symbols").has(v))),

  // For all rows, check that each value is unique, but not necessarily a valid symbol
  // For each row, sort the values, and if value is equal to the one before it, return false
  checkRowsUnique: grid => grid.get("matrix").every(row => row.sort().every((v, i, list) => i!=0 ? v!=list.get(i-1) : true)),

  // Inefficient, but convenient, will be slow for larger boards. Transpose matrix then what were originally columns are now rows
  checkColsUnique: grid => fnGrid.checkRowsUnique(grid.set("matrix", fnMatrix.transpose(grid.get("matrix")))),

  // For each block, check that all values are unique
  checkBlockUnique: grid => {
    const _checkBlocksUnique = (row, col, matrix, blockLength) => { // Recurse through blocks in grid
      // if all blocks have been checked, the matrix is valid
      if (row >= matrix.count()) return true
      // if cells in block are invalid, early termination
      else if (!_checkCellsUnique(0, 0, fnMatrix.submatrix(matrix, row, col, blockLength, blockLength), Immutable.Set())) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+blockLength >= matrix.count() ? row+blockLength : row
        const nextCol = col+blockLength >= matrix.count() ? 0 : col+blockLength
        return _checkBlocksUnique(nextRow, nextCol, matrix, blockLength)
      }
    }
    const _checkCellsUnique = (row, col, block, valueSet) => {  // Recurse through cells in grid
      // if all cells have been checked, the block is valid
      if (row >= block.count()) return true
      // if cells in block are invalid, early termination
      const value = block.get(row).get(col)
      if (value==" " || valueSet.has(value)) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+1 >= block.count() ? row+1 : row
        const nextCol = col+1 >= block.count() ? 0 : col+1
        return _checkCellsUnique(nextRow, nextCol, block, valueSet.add(value))
      }
    }
    // first and only call in this function
    return _checkBlocksUnique(0, 0, grid.get("matrix"), fnGrid.getBlockLen(grid))
  },

  // Generate a string for exporting the state of the puzzle, first line being symbols, then matrix
  exportString: grid => grid.get("symbols").join(" ") + "\n" + fnMatrix.toString(grid.get("matrix")),
  
  // Generate a grid from a string
  importString: str => {
    const data = str.split("\n")
    const grid = Immutable.Map({
      symbols: Immutable.Set(data[0].split(" ")),
      matrix: Immutable.List(data.slice(1).map(row => Immutable.List(row.split(",")))),
    })
    return grid.set("isComplete", fnGrid.validate(grid))
  },

  // Generate a grid from a JSON string queried from https://sugoku.herokuapp.com/board
  importJSON: str => {
    const grid = Immutable.Map({
      symbols: Immutable.Set(["1","2","3","4","5","6","7","8","9"]),
      matrix: Immutable.fromJS(JSON.parse(str).board.map(row => row.map(n => n==0 ? " " : String(n)))),
    })
    return grid.set("isComplete", fnGrid.validate(grid))
  }
}
