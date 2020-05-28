// generic Matrix ops
const fnMatrix = {
  submatrix: (matrix, row, col, rowLength, colLength) => 
    matrix
      .filter((_, i) => i >= row && i < row + rowLength)
      .map(r => r.slice(col, col + colLength)),
  transpose: matrix => matrix[0].map((col, i) => matrix.map(row => row[i])),
  copy: matrix => matrix.map(row => row.concat()),
  // Convert matrix into string with comma separated values and "\n" separates rows. The final "\n" is removed.
  toString: matrix => matrix.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", "").slice(0, -1),
}
