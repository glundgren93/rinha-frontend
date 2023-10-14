self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

let orphanedData = "";
self.addEventListener("message", (event) => {
  if (event.data && event.data.command === "processArrayBuffer") {
    const chunkBuffer = event.data.arrayBuffer;
    const decoder = new TextDecoder();
    let chunkStr = orphanedData + decoder.decode(chunkBuffer);

    // Now you need a method to ensure chunkStr contains full JSON structures.
    // This can be complex, depending on the nature of your JSON.
    // One naive way is to ensure the chunk begins and ends with complete JSON objects or arrays.
    // Let's assume you write a function 'splitValidJSON' to help with this:

    const { validData, remainder } = splitValidJSON(chunkStr);
    orphanedData = remainder;

    // Now process 'validData' as before...
    parseJson(validData);
    const prettifiedJson = JSON.stringify(JSON.parse(validData), null, 2);
    event.ports[0].postMessage({ prettifiedJson: prettifiedJson });
  }
});

function parseJson(json) {
  const parsed = JSON.parse(json);

  const entries = Object.keys(parsed);
  console.log(entries);
}

function splitValidJSON(dataStr) {
  // Look for the last complete JSON structure in dataStr.
  // This logic might vary based on the nature of your JSON.
  const lastClosingBrace = dataStr.lastIndexOf("}");
  const validData = dataStr.substring(0, lastClosingBrace + 1);
  const remainder = dataStr.substring(lastClosingBrace + 1);

  return { validData, remainder };
}
