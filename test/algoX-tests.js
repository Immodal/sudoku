const algoXTests = {
  'gets unsatisfied col': () => {
    const state = Immutable.Map({
      satisfied: Immutable.Set([0,1,2,3,4,5,7,8]),
      ecMatrix: Immutable.fromJS([
        [0,0,0,0,1,0,0,0,1],
      ])
    })
    eq(6, algoX.getUnsatisfiedCol(state))
    eq(-1, algoX.getUnsatisfiedCol(state.set("satisfied", Immutable.Set([0,1,2,3,4,5,6,7,8]))))
  },

  'gets candidates': () => {
    const state = Immutable.Map({
      open: Immutable.Set([0,1,2,3]),
      ecMatrix: Immutable.fromJS([
        [0,0,0,0,1,0,0,0],
        [0,0,1,0,0,1,0,0],
        [0,0,1,0,0,0,1,0],
        [0,0,0,1,0,1,0,0],
      ])
    })
    let exp = Immutable.Set()
    eq(true, Immutable.is(algoX.getCandidates(state, 0), exp))
    exp = Immutable.Set([1,2])
    eq(true, Immutable.is(algoX.getCandidates(state, 2), exp))
    exp = Immutable.Set([1,3])
    eq(true, Immutable.is(algoX.getCandidates(state, 5), exp))
    exp = Immutable.Set()
    eq(true, Immutable.is(algoX.getCandidates(state, 7), exp))
  },
  
  'gets cols that are satisfied by row': () => {
    const state = Immutable.Map({
      ecMatrix: Immutable.fromJS([
        [0,0,0,0,1,0,0,0],
        [0,0,1,0,0,1,0,0],
        [0,0,1,0,0,0,1,0],
        [0,0,0,1,0,1,0,0],
      ])
    })
    let exp = Immutable.List([4])
    eq(true, Immutable.is(algoX.getSatisfiedCols(state, 0), exp))
    exp = Immutable.List([2,5])
    eq(true, Immutable.is(algoX.getSatisfiedCols(state, 1), exp))
    exp = Immutable.List([2,6])
    eq(true, Immutable.is(algoX.getSatisfiedCols(state, 2), exp))
    exp = Immutable.List([3,5])
    eq(true, Immutable.is(algoX.getSatisfiedCols(state, 3), exp))
  },

  'correctly identifies if row is valid': () => {
    const state = Immutable.Map({
      satisfied: Immutable.Set([2,5]),
      ecMatrix: Immutable.fromJS([
        [0,0,0,0,1,0,0,0],
        [0,0,1,0,0,1,0,0],
        [0,0,1,0,0,0,1,0],
        [0,0,0,1,0,1,0,0],
      ])
    })
    eq(true, algoX.rowIsValid(state, 0))
    eq(false, algoX.rowIsValid(state, 1))
    eq(false, algoX.rowIsValid(state, 2))
    eq(false, algoX.rowIsValid(state, 3))
  },

  'solver works': () => {
    const check = (strIn, strOut) => {
      eq(strOut, fnGrid.exportString(algoX.solve(fnGrid.importString(strIn))))
    }

    check(test44EasyGameA.input, test44EasyGameA.complete)
    check(test44HardGameA.input, test44HardGameA.complete)
    check(test99EasyGameA.input, test99EasyGameA.complete)
  },
}