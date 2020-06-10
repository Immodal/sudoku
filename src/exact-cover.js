const exactCover = {
  /**
   * see https://www.stolaf.edu//people/hansonr/sudoku/exactcovermatrix.htm
   * for how I expect the row progression to look, columns probably wont be the same.
   * for this module, the words:
   * row, col = exact cover matrix row and col
   * Every row will represent [i,j,v]
   * i, j, b = grid row, col and block
   * v = value at grid[i,j]
   */

  /**
   * Returns an exact cover matrix for the given grid (only influenced by size of grid)
   */
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

  /**
   * Returns a Map where the keys are the row indices of the exact cover matrix, 
   * and values are a Map containing the values of i, j, v for that row
   */
  mkLookup: grid => {
    const gMatrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // Create maps of matrix row to grid coords and value for easy lookup
    return Immutable.Map().withMutations(mutable => {
      for (let i=0; i<gMatrix.count(); i++) {
        for (let j=0; j<gMatrix.count(); j++) {
          // Using ecMatrix row index as key
          symbols.forEach(v => {
            const row = exactCover.getRowIndex(i, j, v, grid)
            mutable.set(row, Immutable.Map({"i":i, "j":j, "v":v}))
          })
        }
      }
    })
  },

  /**
   * Returns the index of the row in the exact cover matrix representing the cell [i,j] when it takes the value v
   * This is the most important function that allows me to assign 1s to rows out of order
   */
  getRowIndex: (i, j, v, grid) => {
    const matrix = grid.get("matrix")
    const symbols = grid.get("symbols")
    // for every cycle of v, j will increase. For every cycle of j, i will increase
    const iOffset = i * matrix.count() * symbols.count()
    // for every cycle of v, j will increase.
    const jOffset = j * symbols.count()
    const vOffset = symbols.toList().indexOf(v) 
    return iOffset + jOffset + vOffset
  },

  /**
   * Mutates in-place the given exact cover matrix (mutable) to include information (1s) about 
   * cell constraint columns satisfied by each row.
   * The col parameter is the starting column index for a particular section of constraints
   */
  _setCellConstraints: (mutable, grid, col) => {
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

  /**
   * Mutates in-place the given exact cover matrix (mutable) to include information (1s) about 
   * row constraint columns satisfied by each row.
   * The col parameter is the starting column index for a particular section of constraints
   */
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

  /**
   * Mutates in-place the given exact cover matrix (mutable) to include information (1s) about 
   * column constraint columns satisfied by each row.
   * The col parameter is the starting column index for a particular section of constraints
   */
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

  /**
   * Mutates in-place the given exact cover matrix (mutable) to include information (1s) about 
   * block constraint columns satisfied by each row.
   * The col parameter is the starting column index for a particular section of constraints
   */
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