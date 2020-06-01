basicSearchTests = {
  'checks if a move is valid': () => {
    let grid = fnGrid.importString(test99EasyGameA.input)
    eq(true, basicSearch.isValidMove(grid, 8, 8, "4"))
    eq(true, basicSearch.isValidMove(grid, 8, 8, "7"))
    eq(false, basicSearch.isValidMove(grid, 8, 8, "3")) // row
    eq(false, basicSearch.isValidMove(grid, 8, 8, "6")) // col
    eq(false, basicSearch.isValidMove(grid, 8, 8, "1")) // block
  },

  'finds empty cells': () => {
    let grid = fnGrid.importString(test99EasyGameA.input)
    let {row:r, col:c} = basicSearch.getEmptyCell(grid)
    eq(0, r)
    eq(0, c)
    grid = fnGrid.importString(test44HardGameA.input)
    let {row:r1, col:c1} = basicSearch.getEmptyCell(grid)
    eq(0, r1)
    eq(2, c1)
  },

  'gets the next available moves from a grid': () => {
    const grid = fnGrid.importString(test44EasyGameA.input)
    const moves = basicSearch.getNext(grid)

    const exp = Immutable.fromJS({
      isComplete: false,
      symbols: Immutable.Set(["1", "2", "3", "4"]),
      matrix: [
        ["3", "1", " ", "4"],
        ["4", "2", "1", " "],
        [" ", "3", "4", "2"],
        ["2", " ", "3", " "],
      ]
    })
    eq(1, moves.count())
    eq(true, Immutable.is(exp, moves.get(0)))
  },

  'solvers work': () => {
    const check = (strIn, strOut, solver) => eq(strOut, fnGrid.exportString(solver(fnGrid.importString(strIn))))
    solvers = [basicSearch.solve, basicSearch.solve2]
    for (let i=0; i<solvers.length; i++) {
      check(test44EasyGameA.input, test44EasyGameA.complete, solvers[i](false))
      check(test44EasyGameA.input, test44EasyGameA.complete, solvers[i](true))
      check(test44HardGameA.input, test44HardGameA.complete, solvers[i](false))
      check(test44HardGameA.input, test44HardGameA.complete, solvers[i](true))
      check(test99EasyGameA.input, test99EasyGameA.complete, solvers[i](false))
      check(test99EasyGameA.input, test99EasyGameA.complete, solvers[i](true))
    }
  },
}