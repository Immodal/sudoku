// Mutation city, population: Me
const sketch = ( p ) => {
  const PUZZLE_API = "https://sugoku.herokuapp.com/board"
  const DFS = "depthfs"
  const BFS = "breadthfs"
  const GS = "greedys"

  // Data Vars
  let input_grid = fnGrid.importString(test99EasyGameA.input)
  let data = null
  let dataMap = Immutable.Map()
    .set(DFS, basicSearch.mkDataMap(false))
    .set(BFS, basicSearch.mkDataMap(false))
    .set(GS, basicSearch.mkDataMap(true))

  let runSolve = false
  let nSteps = 0
  let nFFWDs = 0

  let solveStepMap = Immutable.Map()
    .set(DFS, basicSearch.solveStep(false))
    .set(BFS, basicSearch.solveStep(true))
    .set(GS, basicSearch.solveStep(false, true))

  // Pre-allocate DOM component vars, cant be inited until setup() is called
  let canvas = null
  let getNewBtn = null
  let difficultyRadio = null

  let stepCounter = null
  let stepBtn = null
  let solveBtn = null
  let ffwdBtn = null
  let pauseBtn = null
  let resetBtn = null
  let solverSelect = null

  // Step nSteps and update the html
  const setNSteps = n => {
    nSteps = n
    stepCounter.html(nSteps)
  }

  // Get data mapper based on solver selection
  const mkDataMap = grid => {
    setNSteps(0)
    nFFWDs = 0
    return dataMap.get(solverSelect.value())(grid)
  }
  // Get solver based on solver selection
  const solveStep = data => solveStepMap.get(solverSelect.value())(data)

  // Generic btn/cb init fn
  const initBtn = (label, parent, callback) => initInteractive(p.createButton(label), parent, callback)
  // const initCb = (label, value, parent, callback=()=>{}) => initInteractive(p.createCheckbox(label, value), parent, callback)
  const initInteractive = (obj, parent, callback) => {
    obj.parent(parent)
    obj.mousePressed(callback)
    return obj
  }

  const initCanvas = () => {
    canvas = p.createCanvas(400, 400)
    canvas.parent("#cv")
  }

  p.setup = () => {
    const initPuzzleLoader = () => {
      getNewBtn = initBtn("Get New", "#loaderBtns", () => 
        p.httpGet(`${PUZZLE_API}?difficulty=${difficultyRadio.value()}`)
        .then(resp => {
          input_grid = fnGrid.importJSON(resp)
          data = mkDataMap(input_grid)
        }))
      difficultyRadio = p.createRadio()
      difficultyRadio.style("padding-left", "1em")
      difficultyRadio.style("display", "inline")
      difficultyRadio.style("font-size", "13px")
      difficultyRadio.parent("#loaderBtns")
      difficultyRadio.option("Easy", "easy")
      difficultyRadio.option("Medium", "medium")
      difficultyRadio.option("Hard", "hard")
      difficultyRadio.value("easy")
    }

    const initPlaybackControl = () => {
      stepCounter = p.createSpan("0")
      stepCounter.parent("#stepCount")
      stepBtn = initBtn("Step", "#playbackBtns", () => data = solveStep(data))
      solveBtn = initBtn("Solve", "#playbackBtns", () => runSolve = true)
      ffwdBtn = initBtn("FFWD 500 Steps", "#playbackBtns", () => nFFWDs += 500)
      pauseBtn = initBtn("Pause", "#playbackBtns", () => runSolve = false)
      resetBtn = initBtn("Reset", "#playbackBtns", () => data = mkDataMap(input_grid))
    }

    const initSolverSelect = () => {
      solverSelect = p.createSelect()
      solverSelect.style('font-size', '13px')
      solverSelect.parent("#solverSelect")
      solverSelect.option("Greedy Depth First", GS)
      solverSelect.option("Naive Depth First", DFS)
      solverSelect.option("Breadth First (Not recommended)", BFS)
      solverSelect.value(GS)
      solverSelect.changed(() => data = mkDataMap(input_grid))
    }

    const initCol1 = () => {
      initPuzzleLoader()
      initPlaybackControl()
      initSolverSelect()
    }

    initCanvas()
    initCol1()
    data = mkDataMap(input_grid)
  }

  p.draw = () => {
    p.background(240)
    p5Grid.draw(p, data.get("grid"), 0, 0, 400, 400)
    if (nFFWDs>0) {
      while (nFFWDs>0){
        data = solveStep(data)
        if (basicSearch.isFinished(data.get("grid"),data.get("moves"))) nFFWDs = 0
        else {
          setNSteps(nSteps+1)
          nFFWDs--
        }
      }
    }
    if (runSolve) {
      if (basicSearch.isFinished(data.get("grid"),data.get("moves"))) {
        runSolve = false
        nFFWDs = 0
      } else {
        data = solveStep(data)
        setNSteps(nSteps+1)
      }
    }
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

