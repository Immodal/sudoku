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
    state.solution = []
    dlx.init(grid, state.ecMatrix, state.root, state.solution)
    return state
  },

  solveStep: data => {
    const state = data.get("state")
    const root = state.root

    if(root.right==root) return data
    else {
      let c = root.right
      if (c.down==c) { // no rows
        while(state.solution[state.solution.length-1].column == null) state.solution.pop()
        let r = state.solution.pop()
        for(let j = r.left; j!=r; j=j.left) {
          j.column.uncover()
        }
        state.solution.push(r.down)
      } else {
        c.cover()
        let r = c.down
        state.solution.push(r)
        for(let j = r.right; j!=r; j=j.right) {
          j.column.cover()
        }
      }
    }

    return data.set("grid", dlx.updateGrid(state.solution, data.get("grid")))
  },

  solve: grid => {
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
          if (solutions.length > 0) break
        }
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

