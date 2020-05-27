EASY_EXAMPLE = [
  [6,1,0,0,0,2,0,0,0,],
  [0,0,0,0,3,6,9,0,0,],
  [3,5,0,0,9,8,0,1,0,],
  [7,3,0,0,0,9,4,0,0,],
  [1,0,0,3,6,4,0,0,2,],
  [0,0,6,8,0,0,0,3,9,],
  [0,2,0,9,1,0,0,8,3,],
  [0,0,3,2,8,0,0,0,0,],
  [0,0,0,6,0,0,0,9,7,],]

const sketch = ( p ) => {
  p.setup = () => {
  }

  p.draw = () => {
  }
}

// Grid functions
const sgrid = {
  mkEmpty: size => Array.from(Array(size), _ => Array(size).fill(0)),
  copy: grid => grid.map(row => row.slice()),
  // For each value in the a row, append "<value>," to its accumulator
  // For each row, append the outcome of row.reduce and "\n" to its accumulator
  toString: grid => grid.reduce((ga, row) => ga + row.reduce((ra, v) => ra + "," + v) + "\n", "")
}

let p5Instance = new p5(sketch);


console.log(sgrid.toString(EASY_EXAMPLE))
