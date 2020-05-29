fnGridTests = {
  'imports and exports grid from and to string': () => {
    const check = (str, exp) => {
      const grid = fnGrid.importString(str)
      eq(exp.isComplete, grid.isComplete)
      eq(true, grid.symbols.every((s, i) => s==exp.symbols[i]))
      eq(true, grid.matrix.every((row, i) => row.every((v, j) => v == exp.matrix[i][j])))
      eq(str, fnGrid.exportString(grid))
    }
    const expGrid1 = {
      isComplete: false,
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
      isComplete: true,
      symbols: ["1", "2", "3", "4"],
      matrix: [
        ["3", "1", "2", "4"],
        ["4", "2", "1", "3"],
        ["1", "3", "4", "2"],
        ["2", "4", "3", "1"],
      ]
    }
    check(test44EasyGameA.complete, expGrid2)
    const expGrid3 = {
      isComplete: false,
      symbols: ["1", "2", "3", "4"],
      matrix: [
        ["3", "1", "2", "4"],
        ["4", "2", "1", "3"],
        ["1", "3", "3", "2"],
        ["2", "4", "3", "1"],
      ]
    }
    check(test44EasyGameA.completeInvalid1, expGrid3)
  },

  'makes shallow copies': () => {
    let grid = fnGrid.importString(test44EasyGameA.input)
    let gridCopy = fnGrid.copy(grid)
    // Check references
    eq(false, grid == gridCopy)
    eq(false, grid.symbols == gridCopy.symbols)
    grid.matrix.forEach((row, i) => eq(false, row == gridCopy.matrix[i]))
    // Check values
    eq(grid.isComplete, gridCopy.isComplete)
    grid.symbols.forEach((s, i) => eq(s, gridCopy.symbols[i]))
    grid.matrix.forEach((row, i) => row.forEach((v,j) => eq(v, gridCopy.matrix[i][j])))
  },

  'gets correct block length': () => {
    eq(2, fnGrid.getBlockLen(fnGrid.importString(test44EasyGameA.complete).matrix))
    eq(3, fnGrid.getBlockLen(fnGrid.importString(test99EasyGameA.complete).matrix))
  },

  'gets correct block': () => {
    let grid = fnGrid.importString(test44EasyGameA.complete)
    let exp = [
      ["3","1"],
      ["4","2"]
    ]
    eq(true, fnGrid.getBlock(grid.matrix, 0, 0).every((row, i) => row.every((v, j) => v == exp[i][j])))
    exp = [
      ["4","2"],
      ["3","1"]
    ]
    eq(true, fnGrid.getBlock(grid.matrix, 3, 3).every((row, i) => row.every((v, j) => v == exp[i][j])))

    grid = fnGrid.importString(test99EasyGameA.complete)
    exp = [
      ["1","6","2"],
      ["5","7","3"],
      ["8","9","4"]
    ]
    eq(true, fnGrid.getBlock(grid.matrix, 4, 4).every((row, i) => row.every((v, j) => v == exp[i][j])))
    exp = [
      ["7","5","8"],
      ["4","6","3"],
      ["1","9","2"]
    ]
    eq(true, fnGrid.getBlock(grid.matrix, 6, 2).every((row, i) => row.every((v, j) => v == exp[i][j])))
  },

  'checks blocks of grids for uniqueness of their cells': () => {
    eq(false, fnGrid.checkBlockUnique(fnGrid.importString(test44EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkBlockUnique(fnGrid.importString(test44EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkBlockUnique(fnGrid.importString(test44EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkBlockUnique(fnGrid.importString(test44EasyGameA.complete)))

    eq(false, fnGrid.checkBlockUnique(fnGrid.importString(test99EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkBlockUnique(fnGrid.importString(test99EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkBlockUnique(fnGrid.importString(test99EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkBlockUnique(fnGrid.importString(test99EasyGameA.complete)))

  },

  'checks rows of grids for uniqueness of their cells': () => {
    let matrix = [
      [1,2,3,3]
    ]
    eq(false, fnGrid.checkRowsUnique({ matrix }))
    matrix = [
      [1,2,3,4]
    ]
    eq(true, fnGrid.checkRowsUnique({ matrix }))

    eq(false, fnGrid.checkRowsUnique(fnGrid.importString(test44EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkRowsUnique(fnGrid.importString(test44EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkRowsUnique(fnGrid.importString(test44EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkRowsUnique(fnGrid.importString(test44EasyGameA.complete)))

    eq(false, fnGrid.checkRowsUnique(fnGrid.importString(test99EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkRowsUnique(fnGrid.importString(test99EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkRowsUnique(fnGrid.importString(test99EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkRowsUnique(fnGrid.importString(test99EasyGameA.complete)))
  },

  'checks columns of grids for uniqueness of their cells': () => {
    let grid = {
      matrix: [
      [4],
      [2],
      [3],
      [4]
    ]}
    eq(false, fnGrid.checkColsUnique(grid))
    grid.matrix = [
      [4],
      [3],
      [2],
      [1]
    ]
    eq(true, fnGrid.checkColsUnique(grid))

    eq(false, fnGrid.checkColsUnique(fnGrid.importString(test44EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkColsUnique(fnGrid.importString(test44EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkColsUnique(fnGrid.importString(test44EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkColsUnique(fnGrid.importString(test44EasyGameA.complete)))

    eq(false, fnGrid.checkColsUnique(fnGrid.importString(test99EasyGameA.completeInvalid1)))
    eq(false, fnGrid.checkColsUnique(fnGrid.importString(test99EasyGameA.completeInvalid2)))
    eq(true, fnGrid.checkColsUnique(fnGrid.importString(test99EasyGameA.completeInvalid3))) // Symbol invalid but rows are still unique
    eq(true, fnGrid.checkColsUnique(fnGrid.importString(test99EasyGameA.complete)))
  },

  'checks whole grid for validity of symbols': () => {
    eq(false, fnGrid.checkSymbols(fnGrid.importString(test44EasyGameA.input)))
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test44EasyGameA.complete)))
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test44EasyGameA.completeInvalid1))) // Row/Col invalid but symbols are valid
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test44EasyGameA.completeInvalid2)))  // Row/Col invalid but symbols are valid
    eq(false, fnGrid.checkSymbols(fnGrid.importString(test44EasyGameA.completeInvalid3)))

    eq(false, fnGrid.checkSymbols(fnGrid.importString(test99EasyGameA.input)))
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test99EasyGameA.complete)))
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test99EasyGameA.completeInvalid1))) // Row/Col invalid but symbols are valid
    eq(true, fnGrid.checkSymbols(fnGrid.importString(test99EasyGameA.completeInvalid2)))  // Row/Col invalid but symbols are valid
    eq(false, fnGrid.checkSymbols(fnGrid.importString(test99EasyGameA.completeInvalid3)))
  },

  'check the overall validity of grid': () => {
    eq(false, fnGrid.validate(fnGrid.importString(test44EasyGameA.input)))
    eq(true, fnGrid.validate(fnGrid.importString(test44EasyGameA.complete)))
    eq(false, fnGrid.validate(fnGrid.importString(test44EasyGameA.completeInvalid1)))
    eq(false, fnGrid.validate(fnGrid.importString(test44EasyGameA.completeInvalid2)))
    eq(false, fnGrid.validate(fnGrid.importString(test44EasyGameA.completeInvalid3)))

    eq(false, fnGrid.validate(fnGrid.importString(test99EasyGameA.input)))
    eq(true, fnGrid.validate(fnGrid.importString(test99EasyGameA.complete)))
    eq(false, fnGrid.validate(fnGrid.importString(test99EasyGameA.completeInvalid1)))
    eq(false, fnGrid.validate(fnGrid.importString(test99EasyGameA.completeInvalid2)))
    eq(false, fnGrid.validate(fnGrid.importString(test99EasyGameA.completeInvalid3)))
  }
}
