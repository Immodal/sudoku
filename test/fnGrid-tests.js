fnGridTests = {
  'imports and exports grid from and to string': () => {
    const check = (str, exp) => {
      const grid = fnGrid.importString(str)
      //eq(exp.get("isComplete"), grid.get("isComplete"))
      eq(true, Immutable.is(grid.get("symbols"), exp.get("symbols")))
      eq(true, Immutable.is(grid.get("matrix"), exp.get("matrix")))
      eq(str, fnGrid.exportString(grid))
    }
    const expGrid1 = Immutable.fromJS({
      isComplete: false,
      symbols: Immutable.Set(["1", "2", "3", "4"]),
      matrix: [
        [" ", "1", " ", "4"],
        ["4", "2", "1", " "],
        [" ", "3", "4", "2"],
        ["2", " ", "3", " "],
      ]
    })
    check(test44EasyGameA.input, expGrid1)
    const expGrid2 = Immutable.fromJS({
      isComplete: true,
      symbols: Immutable.Set(["1", "2", "3", "4"]),
      matrix: [
        ["3", "1", "2", "4"],
        ["4", "2", "1", "3"],
        ["1", "3", "4", "2"],
        ["2", "4", "3", "1"],
      ]
    })
    check(test44EasyGameA.complete, expGrid2)
    const expGrid3 = Immutable.fromJS({
      isComplete: false,
      symbols: Immutable.Set(["1", "2", "3", "4"]),
      matrix: [
        ["3", "1", "2", "4"],
        ["4", "2", "1", "3"],
        ["1", "3", "3", "2"],
        ["2", "4", "3", "1"],
      ]
    })
    check(test44EasyGameA.completeInvalid1, expGrid3)
  },

  'gets correct block length': () => {
    eq(2, fnGrid.getBlockLen(fnGrid.importString(test44EasyGameA.complete)))
    eq(3, fnGrid.getBlockLen(fnGrid.importString(test99EasyGameA.complete)))
  },

  'gets correct block': () => {
    let grid = fnGrid.importString(test44EasyGameA.complete)
    eq(true, Immutable.is(fnGrid.getBlock(grid, 0, 0), Immutable.fromJS([["3","1"],["4","2"]])))
    eq(true, Immutable.is(fnGrid.getBlock(grid, 3, 3), Immutable.fromJS([["4","2"],["3","1"]])))

    grid = fnGrid.importString(test99EasyGameA.complete)
    let exp = Immutable.fromJS([
      ["1","6","2"],
      ["5","7","3"],
      ["8","9","4"]
    ])
    eq(true, Immutable.is(fnGrid.getBlock(grid, 4, 4), exp))
    exp = Immutable.fromJS([
      ["7","5","8"],
      ["4","6","3"],
      ["1","9","2"]
    ])
    eq(true, Immutable.is(fnGrid.getBlock(grid, 6, 2), exp))
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
    let grid = Immutable.fromJS({
      matrix: [[1,2,3,3]]
    })
    eq(false, fnGrid.checkRowsUnique(grid))
    grid = Immutable.fromJS({
      matrix: [[1,2,3,4]]
    })
    eq(true, fnGrid.checkRowsUnique(grid))

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
    let grid = Immutable.fromJS({
      matrix: [
        [4],
        [2],
        [3],
        [4]
      ]
    })
    eq(false, fnGrid.checkColsUnique(grid))
    grid = grid.set("matrix", Immutable.fromJS([
      [4],
      [3],
      [2],
      [1]
    ]))
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
