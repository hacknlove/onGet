var nodesLeft = 1000

export default function generateTree () {
  const tree = {
    0: {
      counter: 0
    }
  }

  while (nodesLeft) {
    let currentNode = tree[0]
    let length
    while (true) {
      length = Object.keys(currentNode).length
      const item = Math.floor(Math.random() * length )
      if (currentNode[item]) {
        currentNode = currentNode[item]
      } else {
        break
      }
    }
    currentNode[length] = {
      counter: 0
    }
    nodesLeft--
  }

  return tree
}
