fnGridTests = {
  'imports and exports grid from and to string': () => {
    const check = (str, exp) => {
      const grid = fnGrid.importString(str)
      eq(true, grid.symbols.every((s, i) => s==exp.symbols[i]))
      eq(true, grid.matrix.every((row, i) => row.every((v, j) => v == exp.matrix[i][j])))
      eq(str, fnGrid.exportString(grid))
    }
    const expGrid1 = {
      symbols: ["1", "2", "3", "4"],
      matrix: [
        [" ", "1", " ", "4"],
        ["4", "2", "1", " "],
        [" ", "3", "4", "2"],
        ["2", " ", "3", " "],
      ]
    }
    check(test44EasyGameA.input, expGrid1)
    const expGrid2 = {
      symbols: ["1", "2", "3", "4"],
      matrix: [
        ["3", "1", "2", "4"],
        ["4", "2", "1", "3"],
        ["1", "3", "4", "2"],
        ["2", "4", "3", "1"],
      ]
    }
    check(test44EasyGameA.complete, expGrid2)
  },

  'makes shallow copies': () => {
    let grid = fnGrid.importString(test44EasyGameA.input)
    let gridCopy = fnGrid.copy(grid)
    eq(false, grid == gridCopy)
    eq(false, grid.symbols == gridCopy.symbols)
    grid.matrix.forEach((row, i) => eq(false, row == gridCopy.matrix[i]))
  },

  'checks cells of block for uniqueness': () => {
    eq(false, fnGrid._validateCells(0, 0, [[1,2],[3,2]], new Set()))
    eq(false, fnGrid._validateCells(0, 0, [[2,2],[3,4]], new Set()))
    eq(true, fnGrid._validateCells(0, 0, [[1,2],[3,4]], new Set()))
  },

  'checks blocks of grids for uniqueness of their cells': () => {
    let grid = fnGrid.importString(test44EasyGameA.completeInvalid1)
    eq(false, fnGrid.validateBlocks(grid))
    grid = fnGrid.importString(test44EasyGameA.completeInvalid2)
    eq(false, fnGrid.validateBlocks(grid))
    grid = fnGrid.importString(test44EasyGameA.complete)
    eq(true, fnGrid.validateBlocks(grid))
  },

  'checks rows of grids for uniqueness of their cells': () => {
    let matrix = [
      [1,2,3,3]
    ]
    eq(false, fnGrid.validateRows({ matrix }))
    matrix = [
      [1,2,3,4]
    ]
    eq(true, fnGrid.validateRows({ matrix }))
    let grid = fnGrid.importString(test44EasyGameA.completeInvalid1)
    eq(false, fnGrid.validateRows(grid))
    grid = fnGrid.importString(test44EasyGameA.completeInvalid2)
    eq(false, fnGrid.validateRows(grid))
    grid = fnGrid.importString(test44EasyGameA.complete)
    eq(true, fnGrid.validateRows(grid))
  },

  'checks columns of grids for uniqueness of their cells': () => {
    let grid = {
      matrix: [
      [4],
      [2],
      [3],
      [4]
    ]}
    eq(false, fnGrid.validateCols(grid))
    grid.matrix = [
      [4],
      [3],
      [2],
      [1]
    ]
    eq(true, fnGrid.validateCols(grid))
    grid = fnGrid.importString(test44EasyGameA.completeInvalid1)
    eq(false, fnGrid.validateCols(grid))
    grid = fnGrid.importString(test44EasyGameA.completeInvalid2)
    eq(false, fnGrid.validateCols(grid))
    grid = fnGrid.importString(test44EasyGameA.complete)
    eq(true, fnGrid.validateCols(grid))
  },

  'checks whole grid for validity of symbols': () => {
    
  }
}