const greedySearchTests = {
  'solver works': () => {
    const check = (strIn, strOut, solver) => {
      data = basicSearch.mkDataMap(fnGrid.importString(strIn))
      eq(strOut, fnGrid.exportString(solver(data).get("grid")))
    }

    check(test44EasyGameA.input, test44EasyGameA.complete, greedySearch.solve)
    check(test44HardGameA.input, test44HardGameA.complete, greedySearch.solve)
    check(test99EasyGameA.input, test99EasyGameA.complete, greedySearch.solve)
  },
}