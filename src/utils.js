// generic Matrix ops
const fnMatrix = {
  // Get a copy of a subsection of the matrix
  submatrix: (matrix, row, col, rowLength, colLength) => 
    matrix
      .filter((_, i) => i >= row && i < row + rowLength)
      .map(r => r.slice(col, col + colLength)),
  // Transpose the matrix
  transpose: matrix => matrix.get(0).map((col, i) => matrix.map(row => row.get(i))),
  // Convert matrix into string with comma separated values and "\n" separates rows. The final "\n" is removed.
  toString: matrix => matrix.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", "").slice(0, -1),
}

const fnSearch = {
  // Get position of next empty cell, top to bottom, left to right.
  getEmptyCell: (grid, i=0) => {
    const matrix = grid.get("matrix")
    const j = matrix.get(i).indexOf(" ")
    // if j<0, recurse further into the grid, else return coordinates of (i,j)
    return j<0 ? (i+1<matrix.count() ? fnSearch.getEmptyCell(grid, i+1) : {row:-1, col:-1}) : {row:i, col:j}
  },

  isValidMove: (grid, row, col, value) => 
  !grid.get("matrix").get(row).some(v => v==value) && // row
  !grid.get("matrix").some(row => row.get(col)==value) && // col
  !fnGrid.getBlock(grid, row, col).some(row => row.some(v => v==value)), // block

}

// Simple Immutable Binary Heap Factory
const Heap = (list, compare=(a,b)=>a<b) => {
  const heap = {}

  heap.data = Immutable.List.isList(list) ? list : Immutable.List()
  heap.compare = (a,b) => compare(a,b)

  heap.count = function() {
    return this.data.count()
  }

  heap.push = function(v) { 
    return Heap(this.bubbleUp(this.data.push(v), this.data.count()), this.compare)
  }

  // Check if the value at i is smaller/larger than its parent, if it is, move it up the heap
  heap.bubbleUp = function(A, i) {
    if (i>0) {
      const parent = Math.floor((i-1)/2)
      if (this.compare(A.get(i), A.get(parent))) {
        return this.bubbleUp(A.set(i, A.get(parent)).set(parent, A.get(i)), parent)
      }
    }
    return A
  }

  heap.peek = function() { 
    return this.data.first()
  }

  heap.pop = function() {
    return Heap(this.bubbleDown(this.data.set(0, this.data.last()).pop(), 0), this.compare)
  }

  // Check if the value at i is smaller/larger than its children, if it is, move it down the heap
  heap.bubbleDown = function(A, i) {
    const left = 2*i + 1
    const right = left + 1

    if (left < A.count() && this.compare(A.get(left), A.get(i)) && this.compare(A.get(left), A.get(right))) {
      return this.bubbleDown(A.set(i, A.get(left)).set(left, A.get(i)), left)
    } else if (right < A.count() && this.compare(A.get(right), A.get(i))) {
      return this.bubbleDown(A.set(i, A.get(right)).set(right, A.get(i)), right)
    } else {
      return A
    }
  }

  return heap
}