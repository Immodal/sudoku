const generatorTests = {

  "mkSeed": () => {
    Array.from(Array(4).fill(4), size => generator.mkSeed(size)).forEach(str => eq(true, fnGrid.strIsValid2(str)))
    Array.from(Array(4).fill(9), size => generator.mkSeed(size)).forEach(str => eq(true, fnGrid.strIsValid2(str)))
    //Array.from(Array(4).fill(16), size => generator.mkSeed(size)).forEach(str => eq(true, fnGrid.strIsValid2(str)))
  }, 

  "mkSolution": () => {
    Array.from(Array(4).fill(4), size => generator.mkSolution(size)).forEach(grid => eq(true, grid.get("isComplete")))
    Array.from(Array(4).fill(9), size => generator.mkSolution(size)).forEach(grid => eq(true, grid.get("isComplete")))
    //Array.from(Array(1).fill(16), size => generator.mkSolution(size)).forEach(grid => eq(true, grid.get("isComplete")))
  },

  "mkPuzzle": () => {
    const check = (size, trials) => {
      const puzzles = Array.from(Array(trials).fill(size), s => generator.mkPuzzle(s, 1, s*s))
      puzzles.forEach(grid => eq(true, fnGrid.strIsValid2(fnGrid.exportString2(grid))))
      puzzles.forEach(grid => eq(false, fnGrid.importString2(fnGrid.exportString2(grid)).get("isComplete")))
    }

    check(4, 4)
    check(9, 1)
    //check(16, 1)
  }
}