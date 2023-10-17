let fileName = "";

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
    fileName = file.name;
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
  const fileNameElement = document.getElementById("file-name");
  const container = document.getElementById("json-tree");
  document.querySelector(".content").style.display = "none";

  container.style.display = "flex";
  fileNameElement.style.display = "block";
  fileNameElement.innerText = fileName;
  container.innerHTML += chunk;
}
