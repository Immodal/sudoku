
// Mutation city, population: Me
const sketch = ( p ) => {
  const DFS = "depthfs"
  const BFS = "breadthfs"
  const GS = "greedys"
  const AX = "algox"
  const GAX = "greedyalgox"
  const NDLX = "naivedlx"
  const DLX = "dlx"

  const SOLUTIONS_MAX = 9999
  const SOLUTIONS_MIN = 1
  const SOLUTIONS_INIT = 1

  // Data Vars
  let input_grid = fnGrid.importString(test99EasyGameA.input)
  let data = null
  const dataMap = Immutable.Map()
    .set(DFS, basicSearch.mkDataMap)
    .set(BFS, basicSearch.mkDataMap)
    .set(GS, basicSearch.mkDataMap)
    .set(AX, algoX.mkDataMap)
    .set(GAX, algoX.mkDataMap)
    .set(NDLX, dlx.mkDataMap)
    .set(DLX, dlx.mkDataMap)

  let runSolve = false
  let nSteps = 0
  let nFFWDs = 0

  const solveStepMap = Immutable.Map()
    .set(DFS, basicSearch.solveStep(false))
    .set(BFS, basicSearch.solveStep(true))
    .set(GS, basicSearch.solveStep(false, true))
    .set(AX, algoX.solveStep(false))
    .set(GAX, algoX.solveStep(true))
    .set(NDLX, dlx.solveStep(false))
    .set(DLX, dlx.solveStep(true))

  const isFinishedMap = Immutable.Map()
    .set(DFS, basicSearch.isFinished)
    .set(BFS, basicSearch.isFinished)
    .set(GS, basicSearch.isFinished)
    .set(AX, algoX.isFinished)
    .set(GAX, algoX.isFinished)
    .set(NDLX, dlx.isFinished)
    .set(DLX, dlx.isFinished)

  const customPuzzleParseErrorMap = Immutable.Map()
    .set(1, "")
    .set(0, "Not all rows are an equal length")
    .set(-1, "It is not a square")
    .set(-2, "Is not a valid size")
    .set(-3, "One or more symbols are invalid")
    .set(-4, "There are duplicates in the rows")
    .set(-5, "There are duplicates in the columns")
    .set(-6, "There are duplicates in the blocks")

  // Pre-allocate DOM component vars, cant be inited until setup() is called
  let canvas = null
  let getNewBtn = null
  let sizeRadio = null
  let maxSolutionsLabel = null
  let maxSolutionsSlider = null

  let stepCounter = null
  let stepBtn = null
  let solveBtn = null
  let ffwdBtn = null
  let pauseBtn = null
  let resetBtn = null
  let solverSelect = null

  let parsePuzzleBtn = null
  let parsePuzzleErrorMsg = null
  let insertExample4x4Btn = null
  let insertExample9x9Btn = null
  let insertExample16x16Btn = null

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
  // Get solver specific functions based on solver selection
  const solveStep = data => {
    const newData = solveStepMap.get(solverSelect.value())(data)
    if (isFinished(newData)) {
      runSolve = false
      nFFWDs = 0
    } else {
      setNSteps(nSteps+1)
      nFFWDs--
    }
    return newData
  }
  const isFinished = data => isFinishedMap.get(solverSelect.value())(data)

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
      getNewBtn = initBtn("Get New", "#loaderBtns", () => {
        const size = parseInt(sizeRadio.value())
        input_grid = generator.mkPuzzle(size, maxSolutionsSlider.value(), size*size)
        data = mkDataMap(input_grid)
      })
      sizeRadio = p.createRadio()
      sizeRadio.style("padding-left", "1em")
      sizeRadio.style("display", "inline")
      sizeRadio.style("font-size", "13px")
      sizeRadio.parent("#sizesRadio")
      sizeRadio.option("4")
      sizeRadio.option("9")
      sizeRadio.option("16", "16 (May take a while)")
      sizeRadio.selected("9")

      maxSolutionsSlider = p.createSlider(SOLUTIONS_MIN, SOLUTIONS_MAX, SOLUTIONS_INIT)
      maxSolutionsLabel = p.createSpan(`${maxSolutionsSlider.value()}`)
      maxSolutionsLabel.parent("#maxSolutionsLbl")
      maxSolutionsSlider.parent('#maxSolutionsSlider')
      maxSolutionsSlider.changed(() => {
        maxSolutionsLabel.html(maxSolutionsSlider.value())
      })
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
      solverSelect.option("DLX", DLX)
      solverSelect.option("Naive DLX", NDLX)
      solverSelect.option("Greedy Algorithm X", GAX)
      solverSelect.option("Algorithm X", AX)
      solverSelect.option("Greedy Depth First", GS)
      solverSelect.option("Depth First", DFS)
      solverSelect.option("Breadth First (Not recommended)", BFS)
      solverSelect.value(DLX)
      solverSelect.changed(() => data = mkDataMap(input_grid))
    }

    const initCustomInputArea = () => {
      parsePuzzleBtn = initBtn("Parse", "#customPuzzleBtns", () => {
        const str = customInput.value()
        const validity = fnGrid.strIsValid2(str)
        parsePuzzleErrorMsg.html(customPuzzleParseErrorMap.get(validity))
        if (validity==1) {
          input_grid = fnGrid.importString2(str)
          data = mkDataMap(input_grid)
        }
      })
      parsePuzzleErrorMsg = p.createSpan("")
      parsePuzzleErrorMsg.parent("#customPuzzleBtns")
      parsePuzzleErrorMsg.style('font-size', '12px')
      parsePuzzleErrorMsg.style("padding-left", "1em")

      customInput = p.createElement('textarea')
      customInput.parent("#customInputArea")
      customInput.attribute("rows", 10)
      customInput.attribute("cols", 50)

      insertExample4x4Btn = initBtn("4x4 Example", "#insertExampleBtns", () => {
        customInput.value(test44HardGameA.inputf2)
      })
      insertExample9x9Btn = initBtn("9x9 Example", "#insertExampleBtns", () => {
        customInput.value(test99EasyGameC.inputf2)
      })
      insertExample16x16Btn = initBtn("16x16 Example", "#insertExampleBtns", () => {
        customInput.value(test1616EasyGameA.inputf2)
      })
    }

    initCanvas()
    // Col1
    initPuzzleLoader()
    initPlaybackControl()
    initSolverSelect()
    // Col2
    initCustomInputArea()


    data = mkDataMap(input_grid)
  }

  p.draw = () => {
    p.background(240)
    p5Grid.draw(p, data.get("grid"), 0, 0, 400, 400)
    if (nFFWDs>0) { // if FFWD is active
      while (nFFWDs>0){
        data = solveStep(data)
      }
    }
    if (runSolve) { // If solve button was pressed
      data = solveStep(data)
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
