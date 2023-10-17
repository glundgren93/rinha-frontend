let allNodes = [];
let generatorInstance = null;

onmessage = async function (event) {
  switch (event.data.action) {
    case "processTree":
      console.time("processTree");
      generatorInstance = await decode(event.data.tree);
      console.timeEnd("processTree");
      postMessage({
        action: "processedTree",
      });
      break;
    case "getNextChunk":
      let chunk = [];
      let done = false;
      for (let i = 0; i < event.data.chunkSize && !done; i++) {
        const nextItem = await generatorInstance.next();
        if (!nextItem.done) {
          chunk.push(nextItem.value);
        }
        done = nextItem.done;
      }
      postMessage({
        action: "newChunk",
        chunk: chunk.join(""),
        done: done,
      });
      break;
  }
};

async function decode(arrayBuffer) {
  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(arrayBuffer);
  const parsedJson = JSON.parse(jsonStr);
  const parentType = Array.isArray(parsedJson) ? "array" : "object";
  const tree = await recurseTree(parsedJson, parentType);
  return tree;
}

function* recurseTree(tree, parentType) {
  const parentContainer =
    parentType === "array" ? '<div class="array-node">' : '<div class="node">';

  yield parentContainer;
  for (let [key, value] of Object.entries(tree)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      yield `<div class="key">${key}:`;
      yield* recurseTree(value, "object");
      yield `</div>`;
    } else if (typeof value === "object" && Array.isArray(value)) {
      yield `<div class="key">${key}:[`;
      yield* recurseTree(value, "array");
      yield `]</div>`;
    } else {
      yield `<div class="property"><span class="key">${key}:</span> <span class="value">${value}</span></div>`;
    }
  }
  yield "</div>";
}

function formatDisplayValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
}
