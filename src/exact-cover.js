const exactCover = {
  // see https://www.stolaf.edu//people/hansonr/sudoku/exactcovermatrix.htm
  // for how I expect the row progression to look, columns probably wont be the same.
  // for this module, the words:
  // row, col = exact cover matrix row and col
  // i, j, b = grid row, col and block
  // v = value at grid[i,j]
  // Every row will represent [i,j,v]

  mkMatrix: grid => {
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")

    // One row for every value in every grid[i,j]
    const nRows = gMatrix.count() * gMatrix.get(0).count() * symbols.count()
    // Cell constraint (each grid[i,j] must contain a v)
    // One col for every grid[i,j]
    // This constraint is satisfied when a grid[i,j] contains any valid value
    const nCellConCols = gMatrix.count() * gMatrix.get(0).count()
    // Row constraint (Each i must contain every v)
    // One col for every possible (i,v) pair
    // This constraint is satisfied when a v exists in a given i. 
    const nRowConCols = gMatrix.count() * symbols.count()
    // Col constraint (Each j must contain every v)
    // One col for every possible (j,v) pair
    // This constraint is satisfied when a v exists in a given j. 
    const nColConCols = gMatrix.get(0).count() * symbols.count()
    // Block constraint (Each b must contain every v)
    // One col for every possible (b,v) pair
    // This constraint is satisfied when a v exists in a given b.
    const nBlocksInGrid = gMatrix.count()
    const nBlockConCols = nBlocksInGrid * symbols.count()
    // Starting Columns for each constraint section
    const cellConStartCol = 0
    const rowConStartCol = nCellConCols
    const colConStartCol = nCellConCols + nRowConCols
    const blockConStartCol = nCellConCols + nRowConCols + nColConCols

    return fnMatrix.mkFill(nRows, nCellConCols + nRowConCols + nColConCols + nBlockConCols, 0)
      .withMutations(mutable => {
        exactCover._setCellConstraints(mutable, grid, cellConStartCol)
        exactCover._setRowConstraints(mutable, grid, rowConStartCol)
        exactCover._setColConstraints(mutable, grid, colConStartCol)
        exactCover._setBlockConstraints(mutable, grid, blockConStartCol)
      })
  },

  getRowIndex: (i, j, v, grid) => {
    // Returns the index of the row in the EC matrix for the grid state [i,j,v]
    // This is the most important function that allows me to assign 1s to rows out of order
    const matrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // for every cycle of v, j will increase. For every cycle of j, i will increase
    const iOffset = i * matrix.count() * symbols.count()
    const jOffset = j * symbols.count()
    // Thankfully the order of values in the an Immutable.Set is stable
    const vOffset = symbols.toList().indexOf(v) 
    return iOffset + jOffset + vOffset
  },

  _setCellConstraints: (mutable, grid, col) => {
    // col represents the starting index for a particular section of constraints
    // Usually it means that it is the sum on the number of column for each section
    // that has come before it
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // For each grid[i,j]
    for (let i=0; i<gMatrix.count(); i++) {
      for (let j=0; j<gMatrix.count(); j++) {
        // and every possible value for each cell
        symbols.forEach(v => {
          // Mark the current col at the row that represents [i,j,v]
          const row = exactCover.getRowIndex(i, j, v, grid)
          mutable.setIn([row, col], 1)
        })
        // Go to next col after every row that satisfies the same constraint has been marked
        col++
      }
    }
  },

  _setRowConstraints: (mutable, grid, col) => {
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // For each i
    for (let i=0; i<gMatrix.count(); i++) {
      // and every v that needs to be in the i
      symbols.forEach(v => {
        for (let j=0; j<gMatrix.count(); j++) {
          // Mark the current col at the row that represents [i,j,v]
          const row = exactCover.getRowIndex(i, j, v, grid)
          mutable.setIn([row, col], 1)
        }
        // Go to next col after every row that satisfies the same constraint has been marked
        col++
      })
    }
  },

  _setColConstraints: (mutable, grid, col) => {
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // For each j
    for (let j=0; j<gMatrix.count(); j++) {
      // and every v that needs to be in the j
      symbols.forEach(v => {
        for (let i=0; i<gMatrix.count(); i++) {
          // Mark the current col at the row that represents [i,j,v]
          const row = exactCover.getRowIndex(i, j, v, grid)
          mutable.setIn([row, col], 1)
        }
        // Go to next col after every row that satisfies the same constraint has been marked
        col++
      })
    }
  },

  _setBlockConstraints: (mutable, grid, col) => {
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    const blockLen = fnGrid.getBlockLen(grid) // block per row or col
    // For every block in the grid
    for (let iOffset=0; iOffset<gMatrix.count(); iOffset+=blockLen) {
      for (let jOffset=0; jOffset<gMatrix.count(); jOffset+=blockLen) {
        // and every value that needs to be in each block
        symbols.forEach(v => {
          // For every grid[i,j] in the block
          for (let i = 0; i < blockLen; i++) {
            for (let j = 0; j < blockLen; j++) {
                // Mark the current col at the row that represents [i,j,v]
                const row = exactCover.getRowIndex(iOffset+i, jOffset+j, v, grid)
                mutable.setIn([row, col], 1)
              }
            }
          // Go to next col after every row that satisfies the same constraint has been marked
          col++
        })
      }
    }
  }
}