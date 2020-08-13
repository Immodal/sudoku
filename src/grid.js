// Grid functions
const fnGrid = {
  /**
   * Symbol used to denote an empty cell.
   */
  EMPTY_SYMBOL: " ",

  /**
   * Symbol used to denote an empty cell.
   */
  EMPTY_SYMBOL2: "0",

  /**
   * String containing all valid symbols, in order.
   */
  VALID_SYMBOLS: "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  
  /**
   * Sets the value of a cell inside the matrix of the grid object.
   * Returns a mutated copy of the grid
   */
  setValue: (grid, row, col, value) => grid.setIn(['matrix', row, col], value),

  /**
   * Returns the block (submatrix) that the cell at [row,col] belongs to.
   */
  getBlock: (grid, row, col) => {
    const blockLength = fnGrid.getBlockLen(grid)
    const rowOffset = row - (row % blockLength)
    const colOffset = col - (col % blockLength)
    return fnMatrix.submatrix(grid.get("matrix"), rowOffset, colOffset, blockLength, blockLength)
  },

  /**
   * Returns the number of blocks in a given row or column of the grid
   * For square Sudoku boards, the block length is always sqrt(board length)
   */
  getBlockLen: grid => Math.floor(Math.sqrt(grid.get("matrix").count())),

  /**
   * Returns true if the grid contains a valid solution
   */
  validate: grid => fnGrid.checkSymbols(grid) && fnGrid.checkRowsUnique(grid) && fnGrid.checkColsUnique(grid) && fnGrid.checkBlockUnique(grid),

  /**
   * Returns true if all cells contain a value that can be found in the symbols set of the grid object
   */
  checkSymbols: grid => grid.get("matrix").every(row => row.every(v => grid.get("symbols").has(v))),

  /**
   * Returns true if all rows each do NOT contain duplicate values (not necessarily a valid values)
   * For each row, sort the values, and if value is equal to the one before it, return false
   */
  checkRowsUnique: grid => grid.get("matrix").every(row => row.sort().every((v, i, list) => i!=0 ? v!=list.get(i-1) : true)),

  /**
   * Returns true if all columns each do NOT contain duplicate values (not necessarily a valid values)
   * Transposing matrix turns columns to rows and allows us to reuse checkRowsUnique
   */
  checkColsUnique: grid => fnGrid.checkRowsUnique(grid.set("matrix", fnMatrix.transpose(grid.get("matrix")))),

  /**
   * Returns true if all blocks each do NOT contain duplicate values (not necessarily a valid values)
   */
  checkBlockUnique: (grid, allowEmpty=false, emptyVal=fnGrid.EMPTY_SYMBOL) => {
    // Recursively iterate through blocks in grid
    const _checkBlocksUnique = (row, col, matrix, blockLength) => {
      // if all blocks have been checked, the matrix is valid
      if (row >= matrix.count()) return true
      // if cells in block are invalid, early termination
      else if (!_checkCellsUnique(0, 0, fnMatrix.submatrix(matrix, row, col, blockLength, blockLength), Immutable.Set())) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+blockLength >= matrix.count() ? row+blockLength : row
        const nextCol = col+blockLength >= matrix.count() ? 0 : col+blockLength
        return _checkBlocksUnique(nextRow, nextCol, matrix, blockLength)
      }
    }
    // Recursively iterate through cells in a block
    const _checkCellsUnique = (row, col, block, valueSet) => {
      // if all cells have been checked, the block is valid
      if (row >= block.count()) return true
      // if cells in block are invalid, early termination
      const value = block.get(row).get(col)
      if (value==fnGrid.EMPTY_SYMBOL || valueSet.has(value)) return false
      else {
        // If the next col is out of bounds, go to next row
        const nextRow = col+1 >= block.count() ? row+1 : row
        const nextCol = col+1 >= block.count() ? 0 : col+1
        return _checkCellsUnique(nextRow, nextCol, block, allowEmpty && value==emptyVal ? valueSet :valueSet.add(value))
      }
    }

    // If its actually a grid object
    if(Immutable.Map.isMap(grid)) return _checkBlocksUnique(0, 0, grid.get("matrix"), fnGrid.getBlockLen(grid))
    // Otherwise its a plain matrix
    else return _checkBlocksUnique(0, 0, grid, fnGrid.getBlockLen(Immutable.Map({matrix:grid})))
  },

  /**
   * Returns a string representing the state of the puzzle, first line being symbols (space separated), then matrix (comma separated)
   */
  exportString: grid => grid.get("symbols").join(fnGrid.EMPTY_SYMBOL) + "\n" + fnMatrix.toString(grid.get("matrix")),
  
  /**
   * Returns a grid object constructed based on the provided string, first line being symbols (space separated), 
   * then matrix (comma separated, spaces represent empty cells)
   * Example:
   * 1 2 3 4
   *  ,1, ,4
   * 4,2,1, 
   *  ,3,4,2
   * 2, ,3, 
   */
  importString: (str, symbolSep=fnGrid.EMPTY_SYMBOL, rowValueSep=",") => {
    const data = str.split("\n")
    const grid = Immutable.Map({
      symbols: Immutable.Set(data[0].split(symbolSep)),
      matrix: Immutable.List(data.slice(1).map(row => Immutable.List(row.split(rowValueSep)))),
    })
    return grid.set("isComplete", fnGrid.validate(grid))
  },

  /**
   * Returns true if the provided string meets all requirements for string format 2 
   */
  strIsValid2: str => {
    // Unless they are a "0", symbols can't be repeated in a row, col or block
    const rowsAreUnique = data => data.every(row => row.every((c, i, arr) => c=="0" || (c!="0" && arr.indexOf(c)==i)))
    const colsAreUnique = data => rowsAreUnique(fnMatrix.transpose(Immutable.fromJS(data)).toJS())
    const blocksAreUnique = data => fnGrid.checkBlockUnique(Immutable.fromJS(data), true, "0")
    const allSymbolsAreValid = data => data
      .reduce((acc, row) => acc.concat(row), []) // Combine into a single string
      .every(v => validSymbols.indexOf(v)>=0) // Check that all symbols appear in validSymbols
    const VALID_SYMBOLS = (fnGrid.EMPTY_SYMBOL2 + fnGrid.VALID_SYMBOLS).split("") // "0" is valid in an empty grid.
    const validSizes = [2,3,4,5].map(n => n*n)
    const data = str.toUpperCase().split("\n").map(row => row.split(""))
    // Symbol usage must be in order
    // a.k.a can't use "A" in a 9x9 puzzle
    const validSymbols = VALID_SYMBOLS.slice(0, data.length+1) // +1 to account for "0"
    if(!data.every(row => row.length==data[0].length)) return 0 // Not all rows are an equal length
    else if(data.length != data[0].length) return -1 // Is not a square
    else if(!validSizes.some(s => s==data.length)) return -2 // Is not a valid size
    else if(!allSymbolsAreValid(data)) return -3
    else if(!rowsAreUnique(data)) return -4 // No duplicates within rows
    else if(!colsAreUnique(data)) return -5 // No duplicates within columns
    else if(!blocksAreUnique(data)) return -6 // No duplicates within blocks
    else return 1 // is valid
  },

  /**
   * Returns a grid object given str that passes strIsValid2. "0" represents empty cells.
   * Example:
   * 1400
   * 0041
   * 2100
   * 0012
   */
  importString2: str => {
    const validSymbols = Immutable.List(fnGrid.VALID_SYMBOLS.split(""))
    const data = str.toUpperCase().split("\n")
    const grid = Immutable.Map({
      symbols: validSymbols.slice(0, data[0].length).toSet(),
      matrix: Immutable.List(data.map(row => Immutable.List(row.replace(/0/g, fnGrid.EMPTY_SYMBOL).split("")))),
    })
    return grid.set("isComplete", fnGrid.validate(grid))
  },

  /**
   * Returns a string representing the state of the puzzle in a matrix
   * Example:
   * 1400
   * 0041
   * 2100
   * 0012
   */
  exportString2: grid => grid.get("matrix").map(row => row.join("").replace(/\s/g, fnGrid.EMPTY_SYMBOL2)).reduce((str, row) => str + "\n" + row),

  /**
   * Returns a grid object from a JSON string queried from https://sugoku.herokuapp.com/board
   */
  importJSON: str => {
    const grid = Immutable.Map({
      symbols: Immutable.Set(["1","2","3","4","5","6","7","8","9"]),
      matrix: Immutable.fromJS(JSON.parse(str).board.map(row => row.map(n => n==0 ? fnGrid.EMPTY_SYMBOL : String(n)))),
    })
    return grid.set("isComplete", fnGrid.validate(grid))
  }
}
