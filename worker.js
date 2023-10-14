onmessage = async (e) => {
  console.log("Message received from main script");
  postMessage(await decode(e.data[0]));
};

async function decode(arrayBuffer) {
  const decoder = new TextDecoder();

  const jsonStr = decoder.decode(arrayBuffer);
  return await recurseTree(JSON.parse(jsonStr), 0);
}

async function recurseTree(tree, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel); // For visual indentation in the HTML output.

  const tasks = Object.entries(tree).map(async ([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = await recurseTree(value, indentLevel + 1); // Wait for nested formatting to be completed.
      return `<div class="key">${key}:</div>\n${nested}`;
    } else if (typeof value === "object" && Array.isArray(value)) {
      const nested = await recurseTree(value, indentLevel + 1); // Wait for nested formatting to be completed.
      return `<div class="entry"><div class="key">${key}:[\n${nested}]</div></div>`;
    } else {
      return `<div class="entry"><span class="key">${key}:</span> <span class="value">${formatDisplayValue(value)}</span></div>`;
    }
  });

  const nodes = await Promise.all(tasks);
  return nodes.join("\n");
}

    // async function recurseTree(tree, indentLevel = 0) {
    //   const indent = "  ".repeat(indentLevel); // Assuming 2 spaces for each level of indentation.

    //   const tasks = Object.entries(tree).map(async ([key, value]) => {
    //     if (value && typeof value === "object" && !Array.isArray(value)) {
    //       const nested = await recurseTree(value, indentLevel + 1); // Wait for nested formatting to be completed.
    //       return `${indent}<div class="key">${key}:</div>${nested}`;
    //     } else if (Array.isArray(value)) {
    //       const nested = await recurseTree(value, indentLevel + 1); // Wait for nested formatting to be completed.
    //       return `${indent}${key}:[\n${nested}\n${indent}]`;
    //     } else {
    //       return `${indent}<div class="entry"><span class="key">${key}: </span> <span class="value">${formatDisplayValue(
    //         value
    //       )}</span></div>`;
    //     }
    //   });

    //   const nodes = await Promise.all(tasks);
    //   return nodes.join("\n");
    // }

function formatDisplayValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
}

function applyIndentation(value, indentAmount) {
  return "\t".repeat(indentAmount) + value;
}
