const basicSearch = {
  // Make data object used in Iterative solver
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    moves: basicSearch.getNext(grid),
    steps: 0,
  }),

  // Move the iterative algorithm forward one step
  // This separate from the function to allow stepping for visualization
  solveStep: isBfs => data => {
    const grid = data.get("grid")
    const moves = data.get("moves")
    // If grid is a valid solution, update its status
    if (fnGrid.validate(grid)) return data.setIn(["grid","isComplete"], true)
    else {
      // Otherwise add the moves from current grid and grab the first one in the stack
      const newMoves = moves.concat(basicSearch.getNext(grid))
      return data
        .set("grid", isBfs ? newMoves.first() : newMoves.last())
        .set("moves", isBfs ? newMoves.shift() : newMoves.pop())
        .set("steps", data.get("steps")+1)
    }
  },

  // Impure Iterative Solver
  solve: isBfs => data => {
    const step = basicSearch.solveStep(isBfs)
    // Loop until solution found or exhausted all options
    while(!data.getIn(["grid","isComplete"]) && data.get("moves").count()>0) {
      data = step(data)
    }
    return data
  },

  // Pure Functional Solver, 
  // Can easily cause stack overflow for large problems due to lack of tail call optimization in JS
  // Max recursion depth will equal the total number of moves examined
  solve2: isBfs => grid => {
    const _solve = (grid, moves) => {
      if (grid.get("isComplete") || moves.count()<=0) return grid
      else if (fnGrid.validate(grid)) return grid.set("isComplete", true)
      else {
        const newMoves = moves.concat(basicSearch.getNext(grid))
        return _solve(
          isBfs ? newMoves.first() : newMoves.last(), 
          isBfs ? newMoves.shift() : newMoves.pop())
      }
    }
    return _solve(grid, basicSearch.getNext(grid))
  },

  // Get the next available moves from this grid
  getNext: grid => {
    // Get the position of next empty cell
    const {row, col} = fnSearch.getEmptyCell(grid)
    if (row<0) return Immutable.List()
    else {
      return grid.get("symbols") // For all symbols,
        .filter(v => fnSearch.isValidMove(grid, row, col, v)) // filter for only the ones that are valid
        .map(v => fnGrid.setValue(grid, row, col, v)) // get new grids with the valid symbols added to the position
        .toList() // Convert from Set to List
    }
  },
}