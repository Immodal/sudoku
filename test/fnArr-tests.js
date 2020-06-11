const fnArrTests = {
  'makes range of numbers as List and Set': () => {
    eq(true, Immutable.is(Immutable.List([0,1,2,3,4]), fnArr.range(5)))
    eq(true, Immutable.is(Immutable.Set([0,1,2,3,4]), fnArr.rangeSet(5)))
  },

  'shuffles list': () => {
    const list  = Immutable.List([1,2,3,4,5])
    const listShuffled = fnArr.shuffle(list)
    const list2 = Immutable.List([1,2,3,4,5])
    eq(true, Immutable.is(list, list2))
    eq(false, Immutable.is(listShuffled, list))
    eq(false, Immutable.is(listShuffled, list2))
  }
}