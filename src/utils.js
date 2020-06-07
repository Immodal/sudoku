// generic Matrix ops
const fnMatrix = {
  /**
   * Returns a matrix with nRow rows and nCol cols filled with v
   */
  mkFill: (nRow, nCol, v) => Immutable.fromJS(Array.from(Array(nRow), _ => Array.from(Array(nCol), _ => v))),

  /**
   * Returns a copy of a subsection of the matrix
   */
  submatrix: (matrix, row, col, rowLength, colLength) => {
    return matrix
      .filter((_, i) => i >= row && i < row + rowLength)
      .map(r => r.slice(col, col + colLength))
  },
  
  /**
   * Returns a transposed copy of the matrix
   */
  transpose: matrix => matrix.get(0).map((col, i) => matrix.map(row => row.get(i))),

  /**
   * Returns a string representation of the matrix with comma separated values and "\n" separates rows.
   */
  toString: matrix => matrix.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", "").slice(0, -1),
}

const fnArr = {
  /**
   * Returns a List of numbers 0 -> (n-1)
   */
  range: n => Immutable.List(fnArr._range(n)),

  /**
   * Returns a Set of numbers 0 -> (n-1)
   */
  rangeSet: n => Immutable.Set(fnArr._range(n)),

  /**
   * Returns a JS Array of numbers 0 -> (n-1)
   */
  _range:n => Array(n).fill().map((_, i) => i)
}

/**
 * Returns a heap object
 * Simple Immutable Binary Heap Factory, by default a min heap
 */
const Heap = (list, compare=(a,b)=>a<b) => {
  const heap = {}

  heap.data = Immutable.List.isList(list) ? list : Immutable.List()

  /**
   * Comparator used to determine the order of elements in the heap
   */
  heap.compare = (a,b) => compare(a,b)

  /**
   * Returns the size of the heap
   */
  heap.count = function() {
    return this.data.count()
  }

  /**
   * Returns a copy of the heap with v added to it
   */
  heap.push = function(v) { 
    return Heap(this.bubbleUp(this.data.push(v), this.data.count()), this.compare)
  }

  /**
   * Returns a copy of the List after the bubble up operation has been run
   * Check if the value at i is smaller than its parent, if it is, move it up the heap
   */
  heap.bubbleUp = function(A, i) {
    if (i>0) {
      const parent = Math.floor((i-1)/2)
      if (this.compare(A.get(i), A.get(parent))) {
        return this.bubbleUp(A.set(i, A.get(parent)).set(parent, A.get(i)), parent)
      }
    }
    return A
  }

  /**
   * Returns the object at the top of the heap
   */
  heap.peek = function() { 
    return this.data.first()
  }

  /**
   * Returns a copy of the heap with the object at the top of the heap removed
   */
  heap.pop = function() {
    return Heap(this.bubbleDown(this.data.set(0, this.data.last()).pop(), 0), this.compare)
  }

  /**
   * Returns a copy of the List after the bubble down operation has been run
   * Check if the value at i is smaller than its children, if it is, move it down the heap
   */
  heap.bubbleDown = function(A, i) {
    const left = 2*i + 1
    const right = left + 1

    if (left < A.count() && this.compare(A.get(left), A.get(i)) && this.compare(A.get(left), A.get(right))) {
      // if left child exists and left is smaller than i, swap places with left and continue bubbling
      return this.bubbleDown(A.set(i, A.get(left)).set(left, A.get(i)), left)
    } else if (right < A.count() && this.compare(A.get(right), A.get(i))) {
      // if right child exists and right is smaller than i, swap places with right and continue bubbling
      // Don't need to check if right is smaller than left because:
      // 1) if it is smaller than left, it still has to be smaller than i anyway
      // 2) if it is larger than left and i is smaller than left, right is also going to be larger than i.
      return this.bubbleDown(A.set(i, A.get(right)).set(right, A.get(i)), right)
    } else {
      return A
    }
  }

  return heap
}