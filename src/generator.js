const generator = {
  /**
   * Returns a randomly generated grid object that attempts to match the given params as closely as possible.
   */
  mkPuzzle: (size, maxSolutions, maxEmptyCells, stepLimit=1000) => {
    const indices = fnArr.range(size)
    const positions = fnArr.shuffle(indices.flatMap(i => indices.map(j => [i, j]))).toJS()

    let best = generator.mkSolution(size)
    let nEmptyCells = 0

    // Reuse the same root to avoid rebuilding the DLM on each loop 
    const root = dancingLinks.importECMatrix(exactCover.MATRICES.get(best.get("matrix").count()))
    for (let i=0; i<positions.length; i++) {
      const sol = best.withMutations(mutable => {
        mutable.setIn(["matrix", positions[i][0], positions[i][1]], fnGrid.EMPTY_SYMBOL)
        mutable.set("isComplete", false)
      })

      if(i>=0) root.reset()
      const data = dlx.mkDataMap(sol, root)
      const result = dlx.search(data, maxSolutions+1, stepLimit)
      if (result.get("state").solutions.length>0 && result.get("state").solutions.length<=maxSolutions) {
        best = sol
        nEmptyCells += 1
        if (nEmptyCells>=maxEmptyCells) return best
      }
    }
    
    return best
  },

  /**
   * Returns a randomly generated and solved grid object.
   */
  mkSolution: size => {
    while (true) {
      const grid = fnGrid.importString2(generator.mkSeed(size))
      const solved = dlx.solve(true)(grid)

      if (solved.get("isComplete")) return solved
    }
  },

  /**
   * Returns a random seed for puzzle generation as a string.
   * Seeds are not guaranteed to produce a solution.
   */
  mkSeed: size => {
    const gridStr = fnGrid.VALID_SYMBOLS
      .slice(0, size)
      .padEnd(size*size, fnGrid.EMPTY_SYMBOL2)

    return fnArr.shuffle(Immutable.List(gridStr.split("")))
      .reduce((rows, value, index) => (index % size == 0 ? rows.push([value]) : rows[rows.length-1].push(value)) && rows, [])
      .map(row => row.join(""))
      .reduce((str, row) => str + "\n" + row)
  },
}