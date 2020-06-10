const dancingLinksTests = {
  'nodes start off referencing themselves': () => {
    const node = dancingLinks.Node()
    eq(node.left, node)
    eq(node.right, node)
    eq(node.up, node)
    eq(node.down, node)
  },

  'insertRight inserts': () => {
    const node1 = dancingLinks.Node()
    const node2 = dancingLinks.Node()
    const node3 = dancingLinks.Node()

    node1.insertRight(node2)
    eq(node1.left, node2)
    eq(node1.right, node2)
    eq(node2.left, node1)
    eq(node2.right, node1)
    node2.insertRight(node3)
    eq(node2.left, node1)
    eq(node2.right, node3)
    eq(node3.left, node2)
    eq(node3.right, node1)
    eq(node1.left, node3)
    eq(node1.right, node2)
  },

  'insertDown inserts': () => {
    const node1 = dancingLinks.Node()
    const node2 = dancingLinks.Node()
    const node3 = dancingLinks.Node()

    node1.insertDown(node2)
    eq(node1.up, node2)
    eq(node1.down, node2)
    eq(node2.up, node1)
    eq(node2.down, node1)
    node2.insertDown(node3)
    eq(node2.up, node1)
    eq(node2.down, node3)
    eq(node3.up, node2)
    eq(node3.down, node1)
    eq(node1.up, node3)
    eq(node1.down, node2)
  },

  'imports ecMatrix': () => {
    const checkCol = (n, size) => {
      eq(n.size, size)
      let current = n
      for (let i=0; i<size+1; i++) {
        current = current.down
        if(i<size) eq(false, n == current)
        else eq(n, current)
      }
    }

    const ecMatrix = Immutable.fromJS([
      [1,0,0,1,1],
      [1,0,1,0,1],
      [0,1,0,0,0],
      [0,1,0,0,1],
    ])

    const root = dancingLinks.importECMatrix(ecMatrix)
    eq(root, root.right.right.right.right.right.right)
    eq(root, root.left.left.left.left.left.left)
    checkCol(root.right, 2)
    checkCol(root.right.right, 2)
    checkCol(root.right.right.right, 1)
    checkCol(root.right.right.right.right, 1)
    checkCol(root.right.right.right.right.right, 3)

    eq(root.right.down.right.down, root.left.left)
    eq(root.right.right.down, root.right.right.down.left)
    eq(root.left.up.left, root.right.right.down.down)
    eq(false, root.right.down == root.right.down.left)
    eq(false, root.right.down == root.right.down.right)
  },

  'covers and uncovers columns': () => {
    const ecMatrix = Immutable.fromJS([
      [1,0,0,1,1],
      [1,0,1,0,1],
      [0,1,0,0,0],
      [0,1,0,0,1],
    ])

    const root = dancingLinks.importECMatrix(ecMatrix)
    const c2 = root.right.right.right
    c2.cover()
    eq(root.right, root.right.right.right.right.right.right) // Column gone
    eq(root.right, root.right.down.down) // row gone
    eq(root.right.size, 1)
    c2.uncover()
    eq(root.right, root.right.right.right.right.right.right.right) // Column back
    eq(root.right.down.down.left, root.right.down.down.right.right) // row back
    eq(root.right.size, 2)
    const c1 = root.right.right
    c1.cover()
    eq(root.right, root.right.right.right.right.right.right) // Column gone
    eq(root.left.up, root.right.down.right.right.down) // rows gone
    eq(root.left.size, 2)
    c1.uncover()
    eq(root.right, root.right.right.right.right.right.right.right) // Column back
    eq(root.left.up, root.right.down.right.right.down.down) // rows back
    eq(root.left.size, 3)
  }
}