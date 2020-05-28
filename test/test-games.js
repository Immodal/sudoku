/* Standard Game string format:
line 0: space separated list of valid symbols
line 1+: 
  comma separated values with each line representing a row on the grid.
  use a space (" ") to denote an empty cell
*/
const test44EasyGameA = {
  input: `1 2 3 4
 ,1, ,4
4,2,1, 
 ,3,4,2
2, ,3, `,
  complete: `1 2 3 4
3,1,2,4
4,2,1,3
1,3,4,2
2,4,3,1`,
  completeInvalid1: `1 2 3 4
3,1,2,4
4,2,1,3
1,3,3,2
2,4,3,1`, // invalid @ [2,2]
  completeInvalid2: `1 2 3 4
2,1,2,4
4,2,1,3
1,3,4,2
2,4,3,1`, // invalid @ [0,0]
}