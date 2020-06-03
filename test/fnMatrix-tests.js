const fnMatrixTests = {
  'makes and fills a matrix of the correct size and fills it': () => {
    let exp1 = Immutable.fromJS([
      [5,5,5,5],
      [5,5,5,5],
    ])
    eq(true, Immutable.is(fnMatrix.mkFill(2,4,5), exp1))
    let exp2 = Immutable.fromJS([
      [3,3,3],
      [3,3,3],
      [3,3,3],
      [3,3,3],
      [3,3,3],
    ])
    eq(true, Immutable.is(fnMatrix.mkFill(5,3,3), exp2))
    let exp3 = Immutable.fromJS([
      [9,9,9,9],
      [9,9,9,9],
      [9,9,9,9],
      [9,9,9,9],
    ])
    eq(true, Immutable.is(fnMatrix.mkFill(4,4,9), exp3))
  },

  'transposes a matrix': () => {
    let exp1 = Immutable.fromJS([[1,2,3]])
    let exp2 = Immutable.fromJS([[1],[2],[3]])
    eq(true, Immutable.is(fnMatrix.transpose(exp2), exp1))
    eq(true, Immutable.is(fnMatrix.transpose(exp1), exp2))

    exp1 = Immutable.fromJS([
      ['1','2','3','4'],
      ['5','6','7','8'],
      ['9','A','B','C'],
      ['D','E','F','G'],
    ])
    exp2 = Immutable.fromJS([
      ['1','5','9','D'],
      ['2','6','A','E'],
      ['3','7','B','F'],
      ['4','8','C','G'],
    ])
    eq(true, Immutable.is(fnMatrix.transpose(exp2), exp1))
    eq(true, Immutable.is(fnMatrix.transpose(exp1), exp2))
  },

  'gets a submatrix': () => {
    let matrix = Immutable.fromJS([
      ['1','2','3','4'],
      ['5','6','7','8'],
      ['9','A','B','C'],
      ['D','E','F','G'],
    ])
    let exp = Immutable.fromJS([
      ['7','8'],
      ['B','C'],
    ])
    eq(true, Immutable.is(fnMatrix.submatrix(matrix, 1, 2, 2, 2), exp))
    exp = Immutable.fromJS([
      ['5','6','7'],
      ['9','A','B'],
      ['D','E','F'],
    ])
    eq(true, Immutable.is(fnMatrix.submatrix(matrix, 1, 0, 3, 3), exp))
  },

  'converts a matrix to a string': () => {
    let matrix = Immutable.fromJS([
      ['7','8'],
      ['B','C'],
    ])
    let exp = "7,8\nB,C"
    eq(exp, fnMatrix.toString(matrix))
    matrix = Immutable.fromJS([
      ['5','6','7'],
      ['9','A','B'],
      ['D','E','F'],
    ])
    exp = "5,6,7\n9,A,B\nD,E,F"
    eq(exp, fnMatrix.toString(matrix))
  },
}