const basicSearchTests = {

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

  'solver works': () => {
    const check = (strIn, strOut, solver) => {
      data = basicSearch.mkDataMap(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(solver(data).get("grid")))
    }

    check(test44EasyGameA.input, test44EasyGameA.complete, basicSearch.solve(false))
    check(test44EasyGameA.input, test44EasyGameA.complete, basicSearch.solve(true))
    check(test44HardGameA.input, test44HardGameA.complete, basicSearch.solve(false))
    check(test44HardGameA.input, test44HardGameA.complete, basicSearch.solve(true))
    check(test99EasyGameA.input, test99EasyGameA.complete, basicSearch.solve(false))
    check(test99EasyGameA.input, test99EasyGameA.complete, basicSearch.solve(true))
  },
}