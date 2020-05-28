fnMatrixTests = {
  'transposes a matrix': () => {
    let exp1 = [[1,2,3]]
    let exp2 = [[1],[2],[3]]
    eq(true, fnMatrix.transpose(exp2).every((row,i) => row.every((col, j) => col == exp1[i][j])))
    eq(true, fnMatrix.transpose(exp1).every((row,i) => row.every((col, j) => col == exp2[i][j])))

    exp1 = [
      ['1','2','3','4'],
      ['5','6','7','8'],
      ['9','A','B','C'],
      ['D','E','F','G'],
    ]
    exp2 = [
      ['1','5','9','D'],
      ['2','6','A','E'],
      ['3','7','B','F'],
      ['4','8','C','G'],
    ]
    eq(true, fnMatrix.transpose(exp2).every((row,i) => row.every((col, j) => col == exp1[i][j])))
    eq(true, fnMatrix.transpose(exp1).every((row,i) => row.every((col, j) => col == exp2[i][j])))
  },

  'gets a submatrix': () => {
    let matrix = [
      ['1','2','3','4'],
      ['5','6','7','8'],
      ['9','A','B','C'],
      ['D','E','F','G'],
    ]
    let exp = [
      ['7','8'],
      ['B','C'],
    ]
    eq(true, fnMatrix.submatrix(matrix, 1, 2, 2).every((row,i) => row.every((col, j) => col == exp[i][j])))
    exp = [
      ['5','6','7'],
      ['9','A','B'],
      ['D','E','F'],
    ]
    eq(true, fnMatrix.submatrix(matrix, 1, 0, 3).every((row,i) => row.every((col, j) => col == exp[i][j])))
  },

  'makes shallow copies': () => {
    let matrix = [
      ['1','2','3','4'],
      ['5','6','7','8'],
      ['9','A','B','C'],
      ['D','E','F','G'],
    ]
    let matrixCopy = fnMatrix.copy(matrix)
    eq(false, matrix == matrixCopy)
    matrix.forEach((row, i) => eq(false, row == matrixCopy[i]))
  },
}