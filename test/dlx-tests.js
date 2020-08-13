const dlxTests = {
  'initializes root correctly': () => {
    const state = dlx.mkState(fnGrid.importString(test44HardGameA.input))
    const exp = `c 2: 9,10,
c 3: 14,
c 4: 18,
c 5: 21,22,
c 10: 42,
c 11: 46,47,
c 12: 50,51,
c 13: 54,
c 17: 9,
c 18: 10,14,
c 21: 21,
c 22: 18,22,
c 26: 42,46,
c 27: 47,
c 30: 50,54,
c 31: 51,
c 34: 18,50,
c 35: 51,
c 37: 21,
c 38: 22,54,
c 41: 9,
c 42: 10,42,
c 46: 14,46,
c 47: 47,
c 49: 21,
c 50: 18,22,
c 53: 9,
c 54: 10,14,
c 58: 50,54,
c 59: 51,
c 62: 42,46,
c 63: 47,`
    eq(exp, dancingLinks.toString(state.root))
  },

  'finds all solutions': () => {
    const str = `295743861
431865900
876192543
387459216
612387495
549216738
763524189
928671354
154938600`
    const state = dlx.mkState(fnGrid.importString2(str))
    dlx.search2(state)
    eq(2, state.solutions.length)

    const str2 = `0000
0000
0000
0000`
  const state2 = dlx.mkState(fnGrid.importString2(str2))
  dlx.search2(state2)
  eq(288, state2.solutions.length)

  const state3 = dlx.mkState(fnGrid.importString(test99EasyGameA.input))
  dlx.search2(state3)
  eq(1, state3.solutions.length)
  },

  'solver works': () => {
    const check = (strIn, strOut) => {
      eq(strOut, fnGrid.exportString(dlx.solve(false)(fnGrid.importString(strIn)))) // Naive
      eq(strOut, fnGrid.exportString(dlx.solve(true)(fnGrid.importString(strIn)))) // Greedy
      eq(strOut, fnGrid.exportString(dlx.solve2(false)(fnGrid.importString(strIn)))) // Recursive Naive
      eq(strOut, fnGrid.exportString(dlx.solve(true)(fnGrid.importString(strIn)))) // Recursive Greedy
    }

    check(test44EasyGameA.input, test44EasyGameA.complete)
    check(test44HardGameA.input, test44HardGameA.complete)
    check(test99EasyGameA.input, test99EasyGameA.complete)
    check(test99HardGameA.input, test99HardGameA.complete)
  },
}