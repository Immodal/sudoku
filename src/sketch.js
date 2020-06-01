let a = null
const sketch = ( p ) => {
  const PUZZLE_API = "https://sugoku.herokuapp.com/board"

  // Data Vars
  let data = svDepthfs.mkDataMap(fnGrid.importString(test99EasyGameA.input))
  let solve = false
  let solverMap = Immutable.Map({
    "0": svDepthfs.solveStep
  })

  // Pre-allocate DOM component vars, cant be inited until setup() is called
  let canvas = null
  let getNewBtn = null
  let difficultyRadio = null
  let stepBtn = null
  let solveBtn = null
  let pauseBtn = null
  let resetBtn = null
  let solverRadio = null

  // Get solver based on radio selection
  const solveStep = data => solverMap.get(solverRadio.value())(data)

  // Generic btn init fn
  const initBtn = (label, parent, callback) => {
    let btn = p.createButton(label)
    btn.parent(parent)
    btn.mousePressed(callback)
    return btn
  }

  const initCanvas = () => {
    canvas = p.createCanvas(400, 400)
    canvas.parent("#cv")
  }

  const initCol1 = () => {
    getNewBtn = initBtn("Get New", "#loaderBtns", () => 
      p.httpGet(`${PUZZLE_API}?difficulty=${difficultyRadio.value()}`)
      .then(resp => data = svDepthfs.mkDataMap(fnGrid.importJSON(resp))))
    difficultyRadio = p.createRadio()
    difficultyRadio.style("padding-left", "1em")
    difficultyRadio.style("display", "inline")
    difficultyRadio.style("font-size", "13px")
    difficultyRadio.parent("#loaderBtns")
    difficultyRadio.option("Easy", "easy")
    difficultyRadio.option("Medium", "medium")
    difficultyRadio.option("Hard", "hard")
    difficultyRadio.value("easy")

    stepBtn = initBtn("Step", "#playbackBtns", () => data = solveStep(data))
    solveBtn = initBtn("Solve", "#playbackBtns", () => solve = true)
    pauseBtn = initBtn("Pause", "#playbackBtns", () => solve = false)
    resetBtn = initBtn("Reset", "#playbackBtns", () => data = svDepthfs.mkDataMap(fnGrid.importString(gridStr)))
    solverRadio = p.createRadio()
    solverRadio.style('font-size', '13px')
    solverRadio.parent("#solverRadios")
    solverRadio.option("Depth First Search", "0")
    solverRadio.value("0") // Must be string
  }

  p.setup = () => {
    initCanvas()
    initCol1()
  }

  p.draw = () => {
    p.background(240)
    p5Grid.draw(p, data.get("grid"), 0, 0, 400, 400)
    if (solve) data = solveStep(data)
  }
}

const p5Grid = {
  // Draw Grid is a given p5 canvas
  draw: (p, grid, x, y, w, h) => {
    const matrix = grid.get("matrix")
    const nCols = matrix.get(0).count()
    const nRows = matrix.count()
    // Draw Cells
    const cellW = w/nCols
    const cellH = h/nRows
    matrix.map((row, j) => row.map((v, i) => p5Grid.drawCell(p, v, x+i*cellW, y+j*cellH, cellW, cellH)))
    // Draw Blocks
    const blockLen = fnGrid.getBlockLen(grid)
    const blockW = blockLen * cellW
    const blockH = blockLen * cellH
    // Get X and Y intervals for blocks
    const blockXs = Immutable.Range(x, x+w, blockW)
    const blockYs = Immutable.Range(y, y+h, blockH)
    blockYs.forEach(by => blockXs.forEach(bx => p5Grid.drawBlock(p, bx, by, blockW, blockH)))
  },

  // Draw a single cell with its text value inside
  drawCell: (p, v, x, y, w, h) => {
    // Cell
    p.noFill()
    p.stroke(0)
    p.strokeWeight(1)
    p.rect(x, y, w, h)
    // Text
    p.fill(0)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(16);
    p.text(v, x+w/2, y+h/2)
  },

  // Draw a single block
  drawBlock: (p, x, y, w, h) => {
    p.noFill()
    p.stroke(0)
    p.strokeWeight(4)
    p.rect(x, y, w, h)
  }
}

let p5Instance = new p5(sketch);