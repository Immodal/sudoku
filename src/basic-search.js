const basicSearch = {
  // Make data object used in Iterative solver
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    moves: Immutable.List([grid]),
  }),

  // Move the iterative algorithm forward one step
  // This separate from the function to allow stepping for visualization
  solveStep: (isBfs, isGreedy) => data => {
    const grid = data.get("grid")
    const moves = data.get("moves")
    // Don't have to do anything if already complete
    // This is already handled by while loop in solve(), but useful to prevent unnecessary computation in the app
    if (basicSearch.isFinished(data)) return data
    // If grid is a valid solution, update its status
    else if (fnGrid.validate(grid)) return data.setIn(["grid","isComplete"], true)
    else {
      // Otherwise add the moves from current grid and grab the first one in the stack
      const getNext = () => isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid)
      const newMoves = isBfs ? moves.shift().concat(getNext()) : moves.pop().concat(getNext())
      return data
        .set("grid", isBfs ? newMoves.first() : newMoves.last())
        .set("moves", newMoves)
    }
  },

  // Impure Iterative Solver
  solve:  (isBfs, isGreedy) => grid => {
    const step = basicSearch.solveStep(isBfs, isGreedy)
    let data = basicSearch.mkDataMap(grid)
    // Loop until solution found or exhausted all options
    while(!basicSearch.isFinished(data)) {
      data = step(data)
    }
    return data.get("grid")
  },

  // Pure Functional Solver, 
  // Can easily cause stack overflow for large problems due to lack of tail call optimization in JS
  // Max recursion depth will equal the total number of moves examined
  solve2: (isBfs, isGreedy) => grid => {
    const _solve = data => {
      const grid = data.get("grid")
      const moves = data.get("moves")
      if (basicSearch.isFinished(data)) return data
      else if (fnGrid.validate(grid)) return data.setIn(["grid","isComplete"], true)
      else {
        const newMoves = moves.concat(isGreedy ? basicSearch.getGreedyNext(grid) : basicSearch.getNext(grid))
        return _solve(data
          .set("grid", isBfs ? newMoves.first() : newMoves.last())
          .set("moves", isBfs ? newMoves.shift() : newMoves.pop()))
      }
    }
    return _solve(basicSearch.mkDataMap(grid))
  },

  // Get the next available moves from this grid
  getNext: grid => {
    // Get the position of next empty cell
    const {row, col} = basicSearch.getEmptyCell(grid)
    if (row<0) return Immutable.List()
    else {
      return grid.get("symbols") // For all symbols,
        .filter(v => basicSearch.isValidMove(grid, row, col, v)) // filter for only the ones that are valid
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
        const validMoves = symbols.filter(v => basicSearch.isValidMove(grid, i, j, v))
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

  // No more work to be done
  isFinished: data => data.get("grid").get("isComplete") || data.get("moves").count()<=0,

  // Get position of next empty cell, top to bottom, left to right.
  getEmptyCell: (grid, i=0) => {
    const matrix = grid.get("matrix")
    const j = matrix.get(i).indexOf(" ")
    // if j<0, recurse further into the grid, else return coordinates of (i,j)
    return j<0 ? (i+1<matrix.count() ? basicSearch.getEmptyCell(grid, i+1) : {row:-1, col:-1}) : {row:i, col:j}
  },

  isValidMove: (grid, row, col, value) => 
  !grid.get("matrix").get(row).some(v => v==value) && // row
  !grid.get("matrix").some(row => row.get(col)==value) && // col
  !fnGrid.getBlock(grid, row, col).some(row => row.some(v => v==value)), // block
}