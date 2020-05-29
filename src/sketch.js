/*
const sketch = ( p ) => {
  p.setup = () => {
  }

  p.draw = () => {
  }
}
let p5Instance = new p5(sketch);
*/

let grid = fnGrid.importString(test99EasyGameA.input)
console.log(fnMatrix.toString(grid.matrix))
let solved = svDepthfs.solve(grid)
console.log(fnMatrix.toString(solved.matrix))
console.log(fnGrid.validate(solved))


//const grid = fnGrid.importString(testGamesCompletedInvalid.a)
//fnGrid.validate(grid)
