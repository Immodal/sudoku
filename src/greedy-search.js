const greedySearch = {
  // Make data object used in Iterative solver
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    moves: greedySearch.getNext(grid),
    steps: 0,
  }),

  // Move the iterative algorithm forward one step
  // This separate from the function to allow stepping for visualization
  solveStep: data => {
    const grid = data.get("grid")
    const moves = data.get("moves")
    // If grid is a valid solution, update its status
    if (fnGrid.validate(grid)) return data.setIn(["grid","isComplete"], true)
    else {
      // Otherwise add the moves from current grid and grab the first one in the stack
      const newMoves = moves.concat(greedySearch.getNext(grid))
      return data
        .set("grid", newMoves.last())
        .set("moves", newMoves.pop())
        .set("steps", data.get("steps")+1)
    }
  },

  // Impure Iterative Solver
  solve: data => {
    // Loop until solution found or exhausted all options
    while(!data.getIn(["grid","isComplete"]) && data.get("moves").count()>0) {
      data = greedySearch.solveStep(data)
    }
    return data
  },

  // Get the next available moves from this grid
  getNext: grid => {
    const symbols = grid.get("symbols")
    const matrix = grid.get("matrix")
    const getMoves = (i, j, heap) => {
      if(i>=matrix.count()) return heap
      const cell = matrix.getIn([i,j])
      const iNew = j+1 < matrix.count() ? i : i+1
      const jNew = j+1 < matrix.count() ? j+1 : 0

      if (cell==" ") {
        const validMoves = symbols.filter(v => fnSearch.isValidMove(grid, i, j, v))
        if(validMoves.count()<=0) return Heap()
        else {
          const newGrids = validMoves.map(v => fnGrid.setValue(grid, i, j, v)).toList()
          return getMoves(iNew, jNew, heap.push(newGrids))
        }
      } else return getMoves(iNew, jNew, heap)
    }
    
    const sorted = getMoves(0, 0, Heap([], (a, b) => a.count()<b.count()))
    return sorted.count()>0 ? sorted.peek() : Immutable.List()
  },
}
