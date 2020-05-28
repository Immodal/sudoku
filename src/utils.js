// generic Matrix ops
const fnMatrix = {
  submatrix: (matrix, row, col, rowLength, colLength) => 
    matrix
      .filter((_, i) => i >= row && i < row + rowLength)
      .map(r => r.slice(col, col + colLength)),
  transpose: matrix => matrix[0].map((col, i) => matrix.map(row => row[i])),
  copy: matrix => matrix.map(row => row.concat()),
}