const fnSearchTests = {
  'checks if a move is valid': () => {
    let grid = fnGrid.importString(test99EasyGameA.input)
    eq(true, fnSearch.isValidMove(grid, 8, 8, "4"))
    eq(true, fnSearch.isValidMove(grid, 8, 8, "7"))
    eq(false, fnSearch.isValidMove(grid, 8, 8, "3")) // row
    eq(false, fnSearch.isValidMove(grid, 8, 8, "6")) // col
    eq(false, fnSearch.isValidMove(grid, 8, 8, "1")) // block
  },

  'finds empty cells': () => {
    let grid = fnGrid.importString(test99EasyGameA.input)
    let {row:r, col:c} = fnSearch.getEmptyCell(grid)
    eq(0, r)
    eq(0, c)
    grid = fnGrid.importString(test44HardGameA.input)
    let {row:r1, col:c1} = fnSearch.getEmptyCell(grid)
    eq(0, r1)
    eq(2, c1)
  },

}