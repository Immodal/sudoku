/**
 * Non-Dancing-Links implementation of Donald Knuth's Algorithm X
 */
const algoX = {

  /**
   * Make the data object used by the solver
   */
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    inputGrid: grid,
    state: algoX.mkStateMap(grid),
    moves: Immutable.List(),
  }),

  /**
   * Returns a state object that holds all the information needed to represent a given grid
   * and the progress in finding a solution
   */
  mkStateMap: grid => {
    // Generate set of rows that represent cells that have already been filled in the grid
    const initSolution = grid => {
      const gMatrix = grid.get("matrix")
      const symbols = grid.get("symbols")
      return Immutable.Set().withMutations(mutable => {
        for (let i=0; i<gMatrix.count(); i++) {
          for (let j=0; j<gMatrix.count(); j++) {
            const v = gMatrix.getIn([i,j])
            if (v != " ") {
              // If value exists, then it is part of the solution
              const row = exactCover.getRowIndex(i, j, v, grid)
              mutable.add(row)
            }
          }
        }
      })
    } // End initSolution
    // Generate set of rows that can be added to the solution
    const initOpen = (grid, ecMatrix, satisfied) => {
      const gMatrix = grid.get("matrix")
      const symbols = grid.get("symbols")
      return Immutable.Set().withMutations(mutable => {
        for (let i=0; i<gMatrix.count(); i++) {
          for (let j=0; j<gMatrix.count(); j++) {
            const v = gMatrix.getIn([i,j]);
            if (v == " ") {
              // If value doesn't exist, then the cell is open
              symbols.forEach(s => {
                // Only add rows that don't clash with existing solution
                const row = exactCover.getRowIndex(i, j, s, grid)
                const cols = ecMatrix.get(row).map((s,i) => s>0 ? i : -1).filter(col => col>=0)
                if(satisfied.intersect(cols).count()<=0) mutable.add(row)
              })
            }
          }
        }
      })
    } // End initOpen
    // Generate set of col indices that are already satisfied by the solution
    const initSatisfied = (solution, ecMatrix) => {
      return Immutable.Set().withMutations(mutable => {
        solution.forEach(row => ecMatrix.get(row).forEach((state, col) => { 
          if(state>0) mutable.add(col)
        }))
      })
    } // End initSatisfied

    const state = {}
    state.ecMatrix = exactCover.MATRICES.get(grid.get("matrix").count())
    state.lookup = exactCover.LOOKUPS.get(grid.get("matrix").count())
    state.solution = initSolution(grid)
    state.satisfied = initSatisfied(state.solution, state.ecMatrix)
    state.open = initOpen(grid, state.ecMatrix, state.satisfied)

    return Immutable.Map(state)
  }, // End mkDataMap

  /**
   * Returns the data object after moving the state forward by one step
   * This separate from the solver to allow stepping for visualization
   */
  solveStep: isGreedy => data => {
    const moves = data.get("moves")
    const state = data.get("state")

    if(algoX.solutionFound(data)) 
      // Only set isComplete to true if the solution is actually valid
      if(!data.getIn(["grid","isComplete"]) && fnGrid.validate(data.get("grid"))) {
        return data.setIn(["grid","isComplete"], true)
      } else return data
    else {
      // Solution wasn't found so get the list of moves from here and choose one
      const nextMoves = fnArr.shuffle(algoX.getNext(state, isGreedy)) // Randomize order of rows
      const newMoves = moves.concat(nextMoves)
      return data.withMutations(mutable => {
        mutable.set("state", newMoves.last())
        mutable.set("grid", algoX.updateGrid(newMoves.last(), data.get("inputGrid")))
        mutable.set("moves", newMoves.pop())
      })
    }
  },

  /**
   * Returns a grid containing the solution found by the solver
   * Runs solver until a solution is found or there are no more moves to be evaluated
   * When isGreedy are set to false, this runs as a plain Algorithm X DFS searching from top left to bottom right
   */
  solve: isGreedy => grid => {
    const step = algoX.solveStep(isGreedy)
    let data = algoX.mkDataMap(grid)
    // Loop until solution found or exhausted all options
    while(!algoX.isFinished(data)) {
      data = step(data)
    }
    return data.get("grid")
  },
  
  /**
   * Returns an updated grid object based on the current state of the solution
   * Best to only pass in an unaltered grid object as it does not override cells with existing values
   */
  updateGrid: (state, grid) => {
    return grid.set("matrix", grid.get("matrix").withMutations(mutable => {
      state.get("solution").forEach(row => {
        const s = state.get("lookup").get(row)
        // If statement not strictly needed, just want to prevent overriding original input cells
        // to make possible bugs more obvious
        if(mutable.getIn([s.get("i"), s.get("j")])==" ") {
          mutable.setIn([s.get("i"), s.get("j")], s.get("v"))
        }
      })
    }))
  },

  /**
   * Returns true if there is no more work left to be done on the data object
   */
  isFinished: data => data.getIn(["grid","isComplete"]) || data.getIn(["state","open"]).count()<=0,

  /**
   * Returns true if the number of constraints that have been satisfied match the number of columns in the exact cover matrix
   */
  solutionFound: data => data.getIn(["state","satisfied"]).count() == data.getIn(["state","ecMatrix",0]).count(),

  /**
   * Returns a List of moves that are available from the given state
   * If isGreedy is true, returns the smallest list of moves it can find
   * If isGreedy is false, returns the list of moves from the first unsatisfied constraint it finds.
   */
  getNext: (state, isGreedy) => {
    const candidates = isGreedy ? algoX.getBestCandidates(state) : algoX.getFirstCandidates(state)
    // Subtract both valid and invalid candidates so that states following this will not 
    // have to process candidates already shown to be invalid
    const nextState = state.set("open", state.get("open").subtract(candidates))
    return candidates
      // filter option 1, better performance, but reduces the accuracy of the greedy selector
      //.filter(c => algoX.rowIsValid(nextState, c)) 
      .map(c => nextState.withMutations(stateMutable => { // For each candidate,
        // Add to solution,
        stateMutable.set("solution", stateMutable.get("solution").add(c)) 
        // Add cols that candidate satisfies to satisfied set.
        stateMutable.set("satisfied", stateMutable.get("satisfied").union(algoX.getSatisfiedCols(stateMutable, c)))
        // Remove rows that have been made invalid by this candidate
        // filter option 2, much slower than option 1 since it is filtering the open set for states
        // that may never even be evaluated, but it increases the accuracy of the greedy selector
        stateMutable.set("open", stateMutable.get("open").filter(row => algoX.rowIsValid(stateMutable, row)))
      }))
      .toList()
  },

  /**
   * Returns the smallest list of rows (candidates) by computing the number of rows that satisfy a given column for all columns
   */
  getBestCandidates: state => {
    const cols = algoX.getUnsatisfiedCols(state)
    // Recursively iterate through the unsatisfied columns in the exact cover matrix to find the column with the least candidates
    const _getBestCandidates = (cols, i=0, best=Immutable.Set()) => {
      if(i<cols.count()) {
        const cs = algoX.getCandidates(state, cols.get(i))
        // If there is an unsatisfiable column, exit early, this state is invalid
        if (cs.count()<=0) return Immutable.Set()
        // If there is a column with less candidates, that is the new best and continue
        else if (i==0 || (cs.count()<best.count())) return _getBestCandidates(cols, i+1, cs)
        else return _getBestCandidates(cols, i+1, best) // If not, keep the current best
      } else return best
    }
    return _getBestCandidates(cols)
  }, 

  /**
   * Returns the list of row (candidates) that satisfy the first unsatisfied column
   */
  getFirstCandidates: state => {
    const col = algoX.getUnsatisfiedCol(state)
    return col>=0 ? algoX.getCandidates(state, col) : Immutable.Set()
  }, 

  /**
   * Returns a set of rows that satisfy a given column
   */
  getCandidates: (state, col) => state.get("open").filter(row => state.getIn(["ecMatrix", row]).get(col)>0),

  /**
   * Returns true if the row does not satisfy any cols that have already been satisfied (no intersection), then it is valid
   */
  rowIsValid: (state, row) => state.get("satisfied").intersect(algoX.getSatisfiedCols(state, row)).count()<=0,

  /**
   * Returns a list of columns that the row satisfies
   */
  getSatisfiedCols: (state, row) => state.get("ecMatrix").get(row).map((s,i) => s>0 ? i : -1).filter(col => col>=0),

  /**
   * Returns a column that is not satisfied by the current solution
   */
  getUnsatisfiedCol: state => { 
    for (let i=0; i<state.getIn(["ecMatrix", 0]).count(); i++) {
      if(!state.get("satisfied").has(i)) return i;
    }
    return -1;
  },

  /**
   * Returns a list of all columns that haven't been satisfied by the current solution
   */
  getUnsatisfiedCols: state => {
    return fnArr.rangeSet(state.getIn(["ecMatrix", 0]).count())
      .subtract(state.get("satisfied"))
      .toList()
  },
}