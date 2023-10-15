let allNodes = [];
let generatorInstance = null;

onmessage = async function (event) {
  switch (event.data.action) {
    case "processTree":
      console.time("processTree");
      allNodes = await decode(event.data.tree);
      generatorInstance = treeGenerator(allNodes);
      console.timeEnd("processTree");
      postMessage({
        action: "processedTree",
      });
      break;
    case "getNextChunk":
      const nextChunk = await generatorInstance.next();
      postMessage({
        action: "newChunk",
        chunk: nextChunk.value,
        done: nextChunk.done,
      });
      break;
  }
};

async function decode(arrayBuffer) {
  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(arrayBuffer);

  const parsedJson = await recurseTree(JSON.parse(jsonStr));
  return parsedJson;
}

async function* treeGenerator(tree, chunkSize = 10) {
  const allNodes = tree;
  let index = 0;

  while (index < allNodes.length) {
    yield allNodes.slice(index, index + chunkSize);
    index += chunkSize;
  }
}

async function recurseTree(tree) {
  const tasks = Object.entries(tree).map(async ([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = await recurseTree(value);
      return `<div class="node"><div class="key">${key}:</div>\n<div class="leaf">${nested.join(
        "\n"
      )}</div></div>`;
    } else if (typeof value === "object" && Array.isArray(value)) {
      const nested = await recurseTree(value);
      return `<div class="array-node"><div class="key">${key}:[\n${nested.join(
        "\n"
      )}]</div></div>`;
    } else {
      return `<div class="leaf"><span class="key">${key}:</span> <span class="value">${value}</span></div>`;
    }
  });

  const nodes = await Promise.all(tasks);
  return nodes;
}

function formatDisplayValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
}
