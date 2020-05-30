const svDepthfs = {
  solve: grid => {
    states = svDepthfs.getNext(grid) // using "states" as stack
    while(states.count()>0) {
      if (fnGrid.validate(grid)) break 
      else {
        grid = states.last()
        states = states.pop().concat(svDepthfs.getNext(grid))
      }
    }
    return grid
  },

  getNext: grid => {
    const {row, col} = svDepthfs.getEmptyCell(grid)
    if (row<0) return Immutable.List()
    else {
      return grid.get("symbols")
        .filter(v => svDepthfs.isValidMove(grid, row, col, v))
        .map(v => fnGrid.setValue(grid, row, col, v))
        .toList()
    }
  },

  getEmptyCell: grid => {
    const getCell = (matrix, i) => {
      const j = matrix.get(i).indexOf(" ")
      return j<0 ? (i+1<matrix.count() ? getCell(matrix, i+1) : {row:-1, col:-1}) : {row:i, col:j}
    }
    return getCell(grid.get("matrix"), 0)
  },

  isValidMove: (grid, row, col, value) => 
    !grid.get("matrix").get(row).some(v => v==value) && // row
    !grid.get("matrix").some(row => row.get(col)==value) && // col
    !fnGrid.getBlock(grid, row, col).some(row => row.some(v => v==value)), // block

}