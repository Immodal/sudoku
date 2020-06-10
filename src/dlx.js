const dlx = {
  mkDataMap: grid => Immutable.Map({
    grid: grid,
    state: dlx.mkState(grid),
  }),

  mkState: grid => {
    const state = {}
    state.ecMatrix = exactCover.mkMatrix(grid)
    state.lookup = exactCover.mkLookup(grid)
    state.root = dancingLinks.importECMatrix(state.ecMatrix)
    state.level = 0
    state.stack = [{c:null, r:null}]
    state.solution = []
    dlx.init(grid, state.ecMatrix, state.root)
    return state
  },

  solveStep: data => {
    const state = data.get("state")
    // Each level stack is equivalent to the recursion depth
    let {c, r} = state.stack[state.level]
    
    if (c==null) {
      // If there is nothing here
      if (state.root.right==state.root) {
        // Check if its complete
        state.level--
        return data
      } else {
        // Otherwise Iterate through the rows of this column
        c = state.root.right
        // S heuristic
        for (let j=c.right; j!=state.root; j=j.right) {
          if (j.size < c.size) c = j
        }
        c.cover()
        state.stack[state.level] = {c:c, r:c}
      }
    } else if (r.down != c) {
      // If r.down is a regular node
      if (c != r) {
        // And r is not a header,
        // then we must undo the move before we continue
        state.solution.pop()
        for(let j = r.left; j!=r; j=j.left) {
          j.column.uncover()
        }
      }
      // add r.down to the solution
      r = r.down
      state.solution.push(r)
      for(let j = r.right; j!=r; j=j.right) {
        j.column.cover()
      }
      // and go deeper into the stack
      state.stack[state.level] = {c:c, r:r}
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
      if (c!=r) {
        // If we actually went through the column, undo the final row
        state.solution.pop()
        for(let j = r.left; j!=r; j=j.left) {
          j.column.uncover()
        }
      }
      // uncover the column and move up a stack level
      c.uncover()
      state.level--
    }

    return data.set("grid", dlx.updateGrid(state.solution, data.get("grid")))
  },

  solve2: grid => {
    const ecMatrix = exactCover.mkMatrix(grid)
    const root = dancingLinks.importECMatrix(ecMatrix)
    const solution = []
    const solutions = []
    dlx.init(grid, ecMatrix, root, solution)
    
    const search = k => {
      if (root.right == root) {
        solutions.push(solution.concat())
      } else {
        let c = root.right
        c.cover()
        console.log("cover")
        for(let r=c.down; r!=c; r=r.down) {
          console.log("push")
          solution.push(r)
          for(let j = r.right; j!=r; j=j.right) {
            j.column.cover()
          }
          search(k+1)
          console.log("pop")
          r = solution.pop()
          c = r.column
          for(let j = r.left; j!=r; j=j.left) {
            j.column.uncover()
          }
          //if (solutions.length > 0) break
        }
        console.log("uncover")
        c.uncover()
      }
    }

    search(0)

    return solutions
  },

  solutionFound: root => root.right == root,

  isFinished: data => {
    const state = data.get("state")
    const r = null
    return r==null ? false : r.down == r.column && r.column.right ==state.root
  },

  init: (grid, ecMatrix, root) => {
    const matrix = grid.get("matrix")
    for (let i=0; i<matrix.count(); i++) {
      for (let j=0; j<matrix.count(); j++) {
        const v = matrix.getIn([i,j])
        if (v != " ") {
          const rowInd = exactCover.getRowIndex(i, j, v, grid)
          const row = ecMatrix.get(rowInd)
          for (let k=0; k<row.count(); k++) {
            let c=root.right
            if (row.get(k)>0) { // get a row it satisfies
              for (; c!=root; c=c.right) { // find the row in the dlmatrix
                if (c.name==k) { // if found,
                  c.cover()
                  break
                }
              }
            }
          }
        }
      }
    }
  },

  updateGrid: (solution, grid) => {
    const lookup = exactCover.mkLookup(grid)
    return grid.set("matrix", grid.get("matrix").withMutations(mutable => {
      solution.forEach(row => {
        const s = lookup.get(row.name)
        // If statement not strictly needed, just want to prevent overriding original input cells
        // to make possible bugs more obvious
        //if(mutable.getIn([s.get("i"), s.get("j")])==" ") {
        mutable.setIn([s.get("i"), s.get("j")], s.get("v"))
        //}
      })
    }))
  },
}

