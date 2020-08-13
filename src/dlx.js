const dlx = {
  /**
   * Make the data object used by the solver
   */
  mkDataMap: (grid, dancingLinksRoot=null) => Immutable.Map({
    grid: grid,
    state: dlx.mkState(grid, dancingLinksRoot),
  }),

  /**
   * Returns a state object that holds all the information needed to represent a given grid and the progress in finding a solution.
   * When provided a root, the function will it is the root for the uninitialized dancing links matrix of grid.
   */
  mkState: (grid, dancingLinksRoot=null) => {
    // Cover columns that have already been satisfied by the initial grid
    const init = (grid, ecMatrix, root) => {
      const matrix = grid.get("matrix")
      // Check every cell in the grid
      for (let i=0; i<matrix.count(); i++) {
        for (let j=0; j<matrix.count(); j++) {
          const v = matrix.getIn([i,j])
          // If it already has a value, cover the columns it satisfies
          if (v != " ") { 
            const rowInd = exactCover.getRowIndex(i, j, v, grid)
            // Get the columns that row satisfies
            const columns = ecMatrix.get(rowInd)
              .map((v, i) => v>0? i : -1)
              .filter(v => v>=0)
              .toSet()
            // Find the column object in dlx and cover
            for (let c=root.right; c!=root; c=c.right) { 
              if (columns.has(c.name)) c.cover() 
            }
          }
        }
      }
    }

    const state = {}
    state.ecMatrix = exactCover.MATRICES.get(grid.get("matrix").count())
    state.lookup = exactCover.LOOKUPS.get(grid.get("matrix").count())
    state.root = dancingLinksRoot==null ? dancingLinks.importECMatrix(state.ecMatrix) : dancingLinksRoot
    init(grid, state.ecMatrix, state.root)
    state.level = 0
    state.stack = [{c:null, r:null}]
    state.solution = []
    state.solutions = []
    
    return state
  },

  /**
   * Returns a solved grid using the first solution of searchStep function
   */
  solve: isGreedy => grid => {
    const step = dlx.solveStep(isGreedy)
    let data = dlx.mkDataMap(grid)

    while(!dlx.isFinished(data)) {
      data = step(data, isGreedy)
    }

    return data.get("grid")
  },

  /**
   * Returns the data object after running through the searchStep function
   */
  search: (data, nSolutions, stepLimit=5000) => {

    while(data.get("state").solutions.length<nSolutions && stepLimit>0 && data.get("state").level>=0) {
      data = dlx.searchStep(data, true, false)
      stepLimit -= 1
    }
    
    return data
  },

  /**
   * Returns the data object after moving the state forward by one step
   * This separate from the solver to allow stepping for visualization
   */
  solveStep: isGreedy => data => {
    if(!dlx.isFinished(data)) return dlx.searchStep(data, isGreedy)
    else return data
  },

  /**
   * Returns true if a solution has been found or if all possibilities have been exhausted
   */
  isFinished: data => data.getIn(["grid", "isComplete"]) || data.get("state").level<0,

  /**
   * Returns the data object after moving the state forward by one step
   * This is a non-recursive version of DLX
   * This is basically Donald Knuth's implementation, but instead of actual recursion,
   * a stack keeps track of the state at each level of "recursion"
   */
  searchStep: (data, isGreedy=true, updateGrid=true) => {
    const state = data.get("state")
    // Each level stack is equivalent to the recursion depth
    let {c, r} = state.stack[state.level]
    
    // If this stack level was just initialized
    if (c==null) {
      if (state.root.right==state.root) {
        // Check if its complete
        // Store the solution
        state.solutions.push(state.solution.concat())
        // Backtrack
        state.level--
        return data
      } else {
        // Otherwise Choose a column to satisfy
        if (isGreedy) {
          // S heuristic
          for (let j=state.root.right; j!=state.root; j=j.right) {
            if (c==null || j.size < c.size) c = j
          }
        } else {
          c = state.root.right
        }
        // Cover the chosen column and iterate through the rows
        c.cover()
        state.stack[state.level] = {c:c, r:c}
        r = c
      }
    }

    // If r is not a header, then it was processed in last call. We must undo r before we continue
    if (r != c) {
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
    if(updateGrid) {
      const newGrid = dlx.updateGrid(state.solution, data.get("grid"), state.lookup)
      return data.set("grid", newGrid)
    } else {
      return data
    }
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
    // Can't use "".withMutable" because fnMatrix.transpose will actually mutate it
    // during validation
    return newGrid.set("isComplete", fnGrid.validate(newGrid))
  },

  /**
   * Returns a solved grid using the first solution of search function
   */
  solve2: isGreedy => grid => {
    const state = dlx.mkState(grid)
    dlx.search2(state, 1, isGreedy)
    return dlx.updateGrid(state.solutions[0], grid, state.lookup)
  },

  /**
   * Mutates state variables as it searches all solutions found up to the limit
   * Recursive Solver that follows Donald Knuth's original implementation
   */
  search2: (state, limit=0, isGreedy=true) => {
    const root = state.root
    const solution = state.solution
    const solutions = state.solutions
    const _search = k => {
      // When all columns have been satisfied, store the solution
      if (root.right == root) solutions.push(solution.concat())
      else {
        // Otherwise, choose a column and cover it,
        let c = null
        if (isGreedy) {
          // S heuristic
          for (let j=root.right; j!=root; j=j.right) {
            if (c==null || j.size < c.size) c = j
          }
        } else {
          c = root.right
        }
        c.cover()
        // Then go through rows of column depth first
        for(let r=c.down; r!=c; r=r.down) {
          // Choose a row then cover all columns that it satisfies
          solution.push(r)
          for(let j = r.right; j!=r; j=j.right) {
            j.column.cover()
          }
          // Search assuming this row is part of the solution
          _search(k+1)
          // Undo this row and move on to the next
          r = solution.pop()
          c = r.column
          for(let j = r.left; j!=r; j=j.left) {
            j.column.uncover()
          }
          // This is to limit the number of solutions found and exit early
          if (limit>0 && solutions.length >= limit) break
        }
        // If all rows have been searched, uncover this column
        c.uncover()
      }
    }
    // Initial call
    _search(0)
  },
}

