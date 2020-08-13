// https://arxiv.org/pdf/cs/0011047.pdf
const dancingLinks = {
  /**
   * General Data Object
   */
  Node: (column, name) => {
    const node = {}
    node.left = node
    node.right = node
    node.up = node
    node.down = node
    node.column = column
    node.name = name

    /**
     * Insert n to the right of node
     */
    node.insertRight = n => {
      // Update pointers in n
      n.left = node
      n.right = node.right
      // Update pointers in new n.right, originally points to node, now n
      n.right.left = n
      // Update pointers in node
      node.right = n
    }

    /**
     * Insert n to the bottom of node
     */
    node.insertDown = n => {
      // Update pointers in n
      n.up = node
      n.down = node.down
      // Update pointers in new n.down, originally points to node, now n
      n.down.up = n
      // Update pointers in node
      node.down = n
    }

    return node
  },

  /**
   * Column object that functions as a header for a column of Nodes
   */
  Column: name => {
    const column = dancingLinks.Node(null, name)
    column.size = 0
    column.covered = false

    /**
     * Covers the column to remove it from the matrix
     */
    column.cover = () => {
      column.covered = true
      // Point column header's left right neighbors at each other
      column.right.left = column.left
      column.left.right = column.right
      // Going top to bottom, i being a row in the column
      let i = column.down
      while (i != column) {
        // Left to right, j a node in row i satisfies
        let j = i.right
        while (j != i) {
          // Point j's up down neighbors at each other
          j.down.up = j.up
          j.up.down = j.down
          // Because j has been covered, update the size of the column it belongs to
          j.column.size--
          // Continue to the right
          j = j.right
        }
        // Continue to the bottom
        i = i.down
      }
    }

    /**
     * Covers the column to reintroduce it to the matrix
     * Works in reverse of column.cover
     */
    column.uncover = () => {
      column.covered = false
      // Going bottom to top, i being a row in the column
      let i = column.up
      while (i != column) {
        // Right to left, j being columns that row i satisfies
        let j = i.left
        while (j != i) {
          // Because j has been uncovered, update the size of the column it belongs to
          j.column.size++
          // Point j's up down neighbors to j again
          j.down.up = j
          j.up.down = j
          // Continue to the left
          j = j.left
        }
        // Continue to the top
        i = i.up
      }
      // Point column header's left right neighbors at column again
      column.right.left = column
      column.left.right = column
    }

    return column
  },

  /**
   * Root object of the dancing links matrix. Essentially a Column but also retains references to all column objects.
   * 
   */
  Root: (name, columns) => {
    const r = dancingLinks.Column(name)

    r.columns = columns

    /**
     * Uncovers all covered columns to reset the DLM to its initial state
     */
    r.reset = () => r.columns.forEach(col => { if (col.covered) col.uncover() })

    return r
  },

  /**
   * Returns the root column of the dancing links version of the ecMatrix
   */
  importECMatrix: ecMatrix => {
    const columns = []
    for (let i=0; i<ecMatrix.get(0).count(); i++) {
      columns.push(dancingLinks.Column(i))
      // Insert new columns to the right of their predecessors
      if (i>0) columns[i-1].insertRight(columns[i])
    }

    // For each row in the ecMatrix,
    for (let i=0; i<ecMatrix.count(); i++) {
      let prevNode = null
      // And each column in the ecMatrix,
      for (let j=0; j<ecMatrix.get(0).count(); j++) {
        // If row i satisfies column j, create a node here
        if (ecMatrix.getIn([i,j])>0) {
          const c = columns[j]
          const node = dancingLinks.Node(c, i)
          // Because iteration is going top to bottom, insertion will always
          // be at the bottom of the column (which is always above the header)
          // Vertical Link
          c.up.insertDown(node)
          c.size++
          // Because iteration is going left to right, insertion will always
          // to the right of the previous node
          // Horizontal Link
          if (prevNode!=null) prevNode.insertRight(node)
          prevNode = node
        }
      }
    }
    // Insert root object
    const root = dancingLinks.Root(null, columns)
    columns[columns.length-1].insertRight(root)
    return root
  },

  /**
   * Returns a string with every column listing the name of every row in it
   */
  toString: root => {
    let s = ""
    for (let c=root.right; c!=root; c=c.right) {
      s += `c ${c.name}: `
      for (let r=c.down; r!=c; r=r.down)
        s += `${r.name},`
      s += `\n`
    }
    
    return s.slice(0,-1)
  },
}