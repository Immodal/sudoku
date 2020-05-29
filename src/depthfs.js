const svDepthfs = {
  solve: grid => {
    let states = svDepthfs.getNext(grid) // using "moves" as stack
    
    while(states.length>0) {
      if (fnGrid.validate(grid)) break
      else {
        grid = states.pop()
        states = states.concat(svDepthfs.getNext(grid))
      }
    }

    return grid
  },

  getNext: grid => {
    const {row, col} = svDepthfs.getEmptyCell(grid)
    if (row<0) return []
    else {
      return grid.symbols
        .filter(v => svDepthfs.isValidMove(grid.matrix, row, col, v))
        .map(v => fnGrid.setValue(grid, row, col, v))
    }
  },

  getEmptyCell: ({ matrix }) => {
    for (let i=0; i<matrix.length; i++) {
      const j = matrix[i].indexOf(" ")
      if (j >= 0) return {row:i, col:j}
    }
    return {row:-1, col:-1}
  },

  isValidMove: (matrix, row, col, value) => {
    return !matrix[row].some(v => v==value) && // row
      !matrix.some(row => row[col]==value) && // col
      !fnGrid.getBlock(matrix, row, col).some(row => row.some(v => v==value)) // block
  },

}