const graph = {
  0: {1: 1, 8: 1},
  1: {0: 1, 2: 1},
  2: {1: 1, 6: 1, 7: 1},
  3: {2: 1, 4: 1, 5: 1},
  4: {3: 1},
  5: {3: 1},
  6: {2: 1},
  7: {2: 1},
  8: {1: 1, 9: 1, 10: 1},
  9: {8: 1},
 10: {8: 1},
}

const graph_VADA_map = {
  0: {2: 1},
  1: {2: 1},
  2: {0: 1, 1: 1, 3: 1, 4: 1},
  3: {2: 1},
  4: {2: 1, 5: 1, 9: 1, 10: 1},
  5: {4: 1, 6: 1},
  6: {5: 1, 7: 1, 8: 1, 11: 1},
  7: {6: 1},
  8: {6: 1},
  9: {4: 1},
 10: {4: 1},
 11: {6: 1}
}


const lowestCostNode = (costs, processed) => {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === null || costs[node] < costs[lowest]) {
      if (!processed.includes(node)) {
        lowest = node;
      }
    }
    return lowest;
  }, null);
};

// function that returns the minimum cost and path to reach Finish

function calculate (graph, startp, finishp)  {

  const processed = [startp]
  const costs = Object.assign({[finishp]: Infinity}, graph[startp]);
  // track patth
  const parents = {[finishp]: null};
  for (let child in graph[startp]) {
    parents[child] = startp;
  }

  let node = lowestCostNode(costs, processed);
  while (node) {
    //console.log(node)
    let cost = costs[node];
    let children = graph[node];
    for (let n in children) {
     if (!processed.includes(n)) {
      let newCost = cost + children[n];
      if (!costs[n]) {
        costs[n] = newCost;
        parents[n] = node;
      }
      if (costs[n] > newCost) {
        costs[n] = newCost;
        parents[n] = node;
      }
     }
    }
    processed.push(node);
    node = lowestCostNode(costs, processed);
  }

  let optimalPath = [finishp];
  let parent = parents[finishp];
  while (parent) {
    optimalPath.push(parent);
    parent = parents[parent];
  }
  optimalPath.reverse();

  const results = {
    distance: costs[finishp],
    path: optimalPath
  };

  return results.path;
};

module.exports.calculate = calculate;

console.log(calculate(graph_VADA_map, "0", "10"))
