/*
const sketch = ( p ) => {
  p.setup = () => {
  }

  p.draw = () => {
  }
}
let p5Instance = new p5(sketch);
*/

let grid = fnGrid.importString(test99EasyGameA.input)

const svDepthfs = {
  solve: grid => {
    let curGrid = grid
    let moves = svDepthfs.getMoves(curGrid) // using "moves" as stack
    
    while(moves.length>0) {
      if (fnGrid.validate(curGrid)) break
      const move = moves.pop()
      curGrid = fnGrid.copy(move.grid)
      curGrid.matrix[move.row][move.col] = move.value
      moves = moves.concat(svDepthfs.getMoves(curGrid))
    }

    return curGrid
  },

  getMoves: grid => {
    const coords = svDepthfs.getEmpty(grid)
    if (coords[0]<0) return []
    else {
      return grid.symbols
        .filter(v => svDepthfs.isValidMove(grid.matrix, coords[0], coords[1], v))
        .map(v => { return {row:coords[0], col:coords[1], value:v, grid:grid} })
    }
  },

  getEmpty: ({ matrix }) => {
    for (let i=0; i<matrix.length; i++) {
      const j = matrix[i].indexOf(" ")
      if (j >= 0) return [i, j]
    }
    return [-1, -1]
  },

  isValidMove: (matrix, row, col, value) => {
    return !matrix[row].some(v => v==value) && // row
      !matrix.some(row => row[col]==value) && // col
      !fnGrid.getBlock(matrix, row, col).some(row => row.some(v => v==value)) // block
  },

}

console.log(fnMatrix.toString(grid.matrix))
let solved = svDepthfs.solve(grid)
console.log(fnMatrix.toString(solved.matrix))
console.log(fnGrid.validate(solved))


//const grid = fnGrid.importString(testGamesCompletedInvalid.a)
//fnGrid.validate(grid)
