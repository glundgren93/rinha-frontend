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

  console.time("recurseTree");
  const parsedJson = await recurseTree(JSON.parse(jsonStr));
  console.timeEnd("recurseTree");
  return parsedJson;
}

function* recurseTree(tree) {
  for (let [key, value] of Object.entries(tree)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      yield `<div class="node"><div class="key">${key}:</div>`;
      yield* recurseTree(value);
      yield `</div>`;
    } else if (typeof value === "object" && Array.isArray(value)) {
      yield `<div class="array-node"><div class="key">${key}:[`;
      yield* recurseTree(value);
      yield `]</div></div>`;
    } else {
      yield `<div class="property"><span class="key">${key}:</span> <span class="value">${value}</span></div>`;
    }
  }
}

function formatDisplayValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
}
