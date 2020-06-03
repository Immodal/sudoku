const basicSearch = {
  // Make data object used in Iterative solver
  mkDataMap: (isGreedy) => grid => Immutable.Map({
    grid: grid,
    moves: isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid),
    steps: 0,
  }),

  // Move the iterative algorithm forward one step
  // This separate from the function to allow stepping for visualization
  solveStep: (isBfs, isGreedy) => data => {
    const grid = data.get("grid")
    const moves = data.get("moves")
    // If grid is a valid solution, update its status
    if (fnGrid.validate(grid)) return data.setIn(["grid","isComplete"], true)
    else {
      // Otherwise add the moves from current grid and grab the first one in the stack
      const newMoves = moves.concat(isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid))
      return data
        .set("grid", isBfs ? newMoves.first() : newMoves.last())
        .set("moves", isBfs ? newMoves.shift() : newMoves.pop())
        .set("steps", data.get("steps")+1)
    }
  },

  // Impure Iterative Solver
  solve:  (isBfs, isGreedy) => data => {
    const step = basicSearch.solveStep(isBfs, isGreedy)
    // Loop until solution found or exhausted all options
    while(!data.getIn(["grid","isComplete"]) && data.get("moves").count()>0) {
      data = step(data)
    }
    return data
  },

  // Pure Functional Solver, 
  // Can easily cause stack overflow for large problems due to lack of tail call optimization in JS
  // Max recursion depth will equal the total number of moves examined
  solve2: (isBfs, isGreedy) => grid => {
    const _solve = (grid, moves) => {
      if (grid.get("isComplete") || moves.count()<=0) return grid
      else if (fnGrid.validate(grid)) return grid.set("isComplete", true)
      else {
        const newMoves = moves.concat(isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid))
        return _solve(
          isBfs ? newMoves.first() : newMoves.last(), 
          isBfs ? newMoves.shift() : newMoves.pop())
      }
    }
    return _solve(grid, isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid))
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

  // Get the next available moves from this grid
  getGreedyNext: grid => {
    const symbols = grid.get("symbols")
    const matrix = grid.get("matrix")
    const getMoves = (i, j, heap) => {
      if(i>=matrix.count()) return heap
      const cell = matrix.getIn([i,j])
      const iNew = j+1 < matrix.count() ? i : i+1
      const jNew = j+1 < matrix.count() ? j+1 : 0

      if (cell==" ") {
        const validMoves = symbols.filter(v => fnSearch.isValidMove(grid, i, j, v))
        // *Important* If there are no valid moves in an empty cell, then all moves stemming from
        // this particular grid will be invalid anyway, so just return an empty heap
        if(validMoves.count()<=0) return Heap()
        else {
          const newGrids = validMoves.map(v => fnGrid.setValue(grid, i, j, v)).toList()
          return getMoves(iNew, jNew, heap.push(newGrids))
        }
      } else return getMoves(iNew, jNew, heap)
    }
    // A heap is actually not necessary, I just wanted to try to code one.
    // For max efficiency, just pass along the list of moves with the smallest size in its place.
    const sorted = getMoves(0, 0, Heap([], (a, b) => a.count()<b.count()))
    return sorted.count()>0 ? sorted.peek() : Immutable.List()
  },
}