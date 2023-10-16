document.getElementById("load-json").addEventListener("click", openDialog);
document
  .getElementById("json-file")
  .addEventListener("change", handleFileSubmission);

function openDialog() {
  document.getElementById("json-file").click();
}
const myWorker = new Worker("/worker.js");

function handleFileSubmission(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      myWorker.postMessage({
        action: "processTree",
        tree: event.target.result,
      });
    };

    reader.readAsArrayBuffer(file);
  }
}

myWorker.onmessage = function (event) {
  if (event.data.action === "processedTree") {
    myWorker.postMessage({ action: "getNextChunk", chunkSize: 1000 });
  }
  if (event.data.action === "newChunk") {
    renderData(event.data.chunk);
    // Optionally, handle the 'done' state. E.g., hide a loading spinner, display a message, etc.
  }
};

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    myWorker.postMessage({ action: "getNextChunk", chunkSize: 1000 });
  }
});

function renderData(chunk) {
  const container = document.getElementById("json-tree");
  container.style.display = "flex";
  document.querySelector(".content").style.display = "none";
  container.innerHTML += chunk;
}
