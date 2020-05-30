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
console.log(fnMatrix.toString(solved.get("matrix")))
console.log(fnGrid.validate(solved))

