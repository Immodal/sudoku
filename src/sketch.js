/*const sketch = ( p ) => {
  p.setup = () => {
    p.createCanvas(400, 400);
    p.background(153);
    p.line(0, 0, p.width, p.height);
  }

  p.draw = () => {
  }
}

let p5Instance = new p5(sketch);*/


let grid = fnGrid.importString(test99EasyGameA.input)

console.log(fnMatrix.toString(grid.get("matrix")))
let solved = svDepthfs.solve(grid)
solved = svDepthfs.solve2(grid)
solved = svDepthfs.solve3(grid)

console.time('Iteration')
solved = svDepthfs.solve(grid)
console.timeEnd('Iteration')
console.time('Recursion')
let solved2 = svDepthfs.solve2(grid)
console.timeEnd('Recursion')
console.time('Hybrid')
let solved3 = svDepthfs.solve3(grid)
console.timeEnd('Hybrid')
console.log(fnGrid.validate(solved))
console.log(fnMatrix.toString(solved.get("matrix")))
console.log(fnGrid.validate(solved2))
console.log(fnMatrix.toString(solved2.get("matrix")))
console.log(fnGrid.validate(solved3))
console.log(fnMatrix.toString(solved3.get("matrix")))


