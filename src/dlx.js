const dlx = {
  /**
   * Make the data object used by the solver
   */
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    state: dlx.mkState(grid),
  }),

  /**
   * Returns a state object that holds all the information needed to represent a given grid
   * and the progress in finding a solution
   */
  mkState: grid => {
    const state = {}
    state.ecMatrix = exactCover.mkMatrix(grid)
    state.lookup = exactCover.mkLookup(grid)
    state.root = dancingLinks.importECMatrix(state.ecMatrix)
    dlx.init(grid, state.ecMatrix, state.root)
    state.level = 0
    state.stack = [{c:null, r:null}]
    state.solution = []
    
    return state
  },

  /**
   * Returns the data object after moving the state forward by one step
   * This separate from the solver to allow stepping for visualization
   */
  solveStep: data => {
    if(!dlx.isFinished(data)) return dlx._solveStep(data)
    else return data
  },

  /**
   * Returns the data object after moving the state forward by one step
   * This is a non-recursive version of DLX
   */
  _solveStep: data => {
    const state = data.get("state")
    // Each level stack is equivalent to the recursion depth
    let {c, r} = state.stack[state.level]
    
    // If this stack level was just initialized
    if (c==null) {
      if (state.root.right==state.root) {
        // Check if its complete
        state.level--
        return data
      } else {
        // Otherwise Choose a column to satisfy
        // S heuristic
        for (let j=state.root.right; j!=state.root; j=j.right) {
          if (c==null || j.size < c.size) c = j
        }
        // Cover the chosen column and iterate through the rows
        c.cover()
        state.stack[state.level] = {c:c, r:c}
        r = c
      }
    }

    // If r is not a header, then we must undo r before we continue
    if (c != r) {
      state.solution.pop()
      for(let j = r.left; j!=r; j=j.left) {
        j.column.uncover()
      }
    }
    
    // If there is a non-header below r
    if (r.down != c) {
      // add r.down to the solution
      r = r.down
      state.solution.push(r)
      for(let j = r.right; j!=r; j=j.right) {
        j.column.cover()
      }
      // Record the state of the current level
      state.stack[state.level] = {c:c, r:r}
      // and go deeper into the stack
      state.level++
      // Make sure the next level in the stack is clear
      // Grow stack if needed
      if(state.stack.length==state.level) {
        state.stack.push({c:null, r:null})
      } else {
        state.stack[state.level] = {c:null, r:null}
      }
    } else {
      // If we've reached the end if the column or there are no rows
      // uncover the column and move up a stack level
      c.uncover()
      state.level--
    }

    // Check if the grid is complete
    const newGrid = dlx.updateGrid(state.solution, data.get("grid"), state.lookup)
    return data.set("grid", newGrid)
  },

  /**
   * Returns an updated grid object based on the current state of the solution
   */
  updateGrid: (solution, grid, lookup) => {
    const newGrid = grid.set("matrix", grid.get("matrix").withMutations(mutable => {
      solution.forEach(row => {
        const s = lookup.get(row.name)
        mutable.setIn([s.get("i"), s.get("j")], s.get("v"))
      })
    }))
    return newGrid.set("isComplete", fnGrid.validate(newGrid))
  },

  /**
   * Recursive Solver that follows Donald Knuth's original implementation
   */
  solve2: (grid, limit=1) => {
    const ecMatrix = exactCover.mkMatrix(grid)
    const lookup = exactCover.mkLookup(grid)
    const root = dancingLinks.importECMatrix(ecMatrix)
    dlx.init(grid, ecMatrix, root, solution)
    const solution = []
    const solutions = []
    
    const search = k => {
      if (root.right == root) {
        solutions.push(solution.concat())
      } else {
        let c = root.right
        c.cover()
        for(let r=c.down; r!=c; r=r.down) {
          solution.push(r)
          for(let j = r.right; j!=r; j=j.right) {
            j.column.cover()
          }
          search(k+1)
          r = solution.pop()
          c = r.column
          for(let j = r.left; j!=r; j=j.left) {
            j.column.uncover()
          }
          if (limit>0 && solutions.length >= limit) break
        }
        c.uncover()
      }
    }

    search(0)

    return dlx.updateGrid(solutions[0], grid, lookup)
  },

  isFinished: data => data.getIn(["grid", "isComplete"]) || data.get("state").level<0,

  // Cover columns that have already been satisfied by the initial grid
  init: (grid, ecMatrix, root) => {
    const matrix = grid.get("matrix")
    // Check every cell in the grid
    for (let i=0; i<matrix.count(); i++) {
      for (let j=0; j<matrix.count(); j++) {
        const v = matrix.getIn([i,j])
        // If it already has a value, cover the columns it satisfies
        if (v != " ") { 
          const rowInd = exactCover.getRowIndex(i, j, v, grid)
          const row = ecMatrix.get(rowInd)
          // Get the columns that row satisfies
          columns = Immutable.Set(row.map((v, i) => v>0? i : -1).filter(v => v>0))
          // Find the column object in dlx and cover
          for (let c=root.right; c!=root; c=c.right) { 
            if (columns.has(c.name)) c.cover() 
          }
        }
      }
    }
  }
}

