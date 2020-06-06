const fnArrTests = {
  'makes range of numbers as List and Set': () => {
    eq(true, Immutable.is(Immutable.List([0,1,2,3,4])), fnArr.range(5))
    eq(true, Immutable.is(Immutable.Set([0,1,2,3,4])), fnArr.rangeSet(5))
  }
}