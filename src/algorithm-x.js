const algoX = {
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    state: algoX.mkStateMap(grid),
    moves: Immutable.List(),
  }),

  mkStateMap: grid => {
    // Lookup Table for using rows to find the [i,j,v] they represent
    const mkLookup = grid => {
      const gMatrix = grid.get("matrix")
      const symbols = grid.get("symbols")
      // Create maps of matrix row to grid coords and value for easy lookup
      return Immutable.Map().withMutations(mutable => {
        for (let i=0; i<gMatrix.count(); i++) {
          for (let j=0; j<gMatrix.count(); j++) {
            // Using ecMatrix row index as key
            symbols.forEach(v => {
              const row = exactCover.getRowIndex(i, j, v, grid)
              mutable.set(row, Immutable.Map({"i":i, "j":j, "v":v}))
            })
          }
        }
      })
    } // End mkLookup
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
    const initOpen = grid => {
      const gMatrix = grid.get("matrix")
      const symbols = grid.get("symbols")
      return Immutable.Set().withMutations(mutable => {
        for (let i=0; i<gMatrix.count(); i++) {
          for (let j=0; j<gMatrix.count(); j++) {
            const v = gMatrix.getIn([i,j]);
            if (v == " ") {
              // If value doesn't exist, then the cell is open
              symbols.forEach(s => {
                const row = exactCover.getRowIndex(i, j, s, grid)
                mutable.add(row)
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
    }

    const state = {}
    state.ecMatrix = exactCover.mkMatrix(grid)
    state.lookup = mkLookup(grid)
    state.solution = initSolution(grid)
    state.open = initOpen(grid)
    state.satisfied = initSatisfied(state.solution, state.ecMatrix)

    return Immutable.Map(state)
  }, // End mkDataMap

  solveStep: data => {
    // Follows Pseudocode found on wikipedia
    const moves = data.get("moves")
    const state = data.get("state")

    if(algoX.solutionFound(data)) return data.setIn(["grid","isComplete"], true)
    else {
      // 2. Otherwise choose a column c (deterministically).
      // 3. Choose a row r such that Ar, c = 1 (nondeterministically).
      const candidates = algoX.getNext(state)
      const newState = state.set("open", state.get("open").subtract(candidates))
      let newMoves = moves

      const validCandidates = candidates.filter(c => algoX.rowIsValid(state, c)).toList()
      for (let i=0; i<validCandidates.count(); i++) {
        newMoves = newMoves.push(newState.withMutations(mutable => {
          // 4. Include row r in the partial solution.
          mutable.set("solution", newState.get("solution").add(validCandidates.get(i)))
          // 5. For each column j such that Ar, j = 1, ...
          // Not deleting columns but instead marking columns satisfied
          mutable.set("satisfied", newState.get("satisfied").union(algoX.getSatisfiedCols(state, validCandidates.get(i))))
        }))
      }

      return data
        .set("state", newMoves.last())
        .set("grid", algoX.updateGrid(newMoves.last(), data.get("grid")))
        .set("moves", newMoves.pop())
    }
  },

  // Impure Iterative Solver
  solve: grid => {
    let data = algoX.mkDataMap(grid)
    // Loop until solution found or exhausted all options
    let count = 0
    // 1. If the matrix A (state.open) has no columns, the current partial solution is a valid solution; terminate successfully.
    while(!algoX.isFinished(data)) {
      data = algoX.solveStep(data)
    }
    return data.get("grid")
  },

  updateGrid: (state, grid) => {
    const lookup = state.get("lookup")
    const solution = state.get("solution")
    let gMatrix = grid.get("matrix")

    solution.forEach(row => {
      const s = lookup.get(row)
      if(gMatrix.getIn([s.get("i"), s.get("j")])==" ") {
        gMatrix = gMatrix.setIn([s.get("i"), s.get("j")], s.get("v"))
      }
    })

    return grid.set("matrix", gMatrix)
  },
  // Either a solution has been found, or there are no more open rows
  isFinished: data => data.getIn(["grid","isComplete"]) || data.getIn(["state","open"]).count()<=0,
  // Is solution found once all constraints are satisfied, which happens to be the number of columns in the ecmatrix
  solutionFound: data => data.getIn(["state","satisfied"]).count() == data.getIn(["state","ecMatrix",0]).count(),
  // Check that none of the other constraints in the row have been satisfied
  // If they have, then it is invalid
  rowIsValid: (state, row) => {
    return !state.getIn(["ecMatrix", row])
      .some((st, col) => state.get("satisfied").has(col) && st>0)
  },
  // Get rows that satisfy the same unsatisfied column
  getNext: state => {
    const getCandidates = state => state.get("open").filter(row => state.getIn(["ecMatrix", row]).get(col)>0)
    const col = algoX.getUnsatisfiedCol(state)
    return col>=0 ? getCandidates(state) : Immutable.Set()

  },
  // Fund a column that is not satisfied by the solution
  getUnsatisfiedCol: state => {
    for (let i=0; i<state.getIn(["ecMatrix", 0]).count(); i++) {
      if(!state.get("satisfied").has(i)) return i;
    }
    return -1;
  },

  getSatisfiedCols: (state, row) => state.get("ecMatrix").get(row).map((s,i) => s>0 ? i : -1).filter(col => col>=0)
}