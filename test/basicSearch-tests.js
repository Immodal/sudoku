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
    const checkDfs = (strIn, strOut) => {
      data = basicSearch.mkDataMap(false)(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(basicSearch.solve(false, false)(data).get("grid")))
    }

    const checkBfs = (strIn, strOut) => {
      data = basicSearch.mkDataMap(false)(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(basicSearch.solve(true, false)(data).get("grid")))
    }

    const checkGreedyDfs = (strIn, strOut) => {
      data = basicSearch.mkDataMap(true)(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(basicSearch.solve(false, true)(data).get("grid")))
    }

    const checkGreedyBfs = (strIn, strOut) => {
      data = basicSearch.mkDataMap(true)(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(basicSearch.solve(true, true)(data).get("grid")))
    }

    const check = (strIn, strOut) => {
      checkDfs(strIn, strOut)
      checkBfs(strIn, strOut)
      checkGreedyDfs(strIn, strOut)
      checkGreedyBfs(strIn, strOut)
    }


    check(test44EasyGameA.input, test44EasyGameA.complete)
    check(test44HardGameA.input, test44HardGameA.complete)
    check(test99EasyGameA.input, test99EasyGameA.complete)
  },
}