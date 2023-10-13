document.getElementById("load-json").addEventListener("click", openDialog);
document
  .getElementById("json-file")
  .addEventListener("change", handleFileSubmission);

function openDialog() {
  document.getElementById("json-file").click();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch(function (error) {
      console.error("Service Worker registration failed:", error);
    });
}

function sendToServiceWorker(arrayBuffer) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = handleServiceWorkerResponse;

    navigator.serviceWorker.controller.postMessage(
      { command: "processArrayBuffer", arrayBuffer: arrayBuffer },
      [arrayBuffer, messageChannel.port2]
    );
  }
}

function handleServiceWorkerResponse(event) {
  const prettifiedJson = event.data.prettifiedJson;
  document.getElementById("json-tree").innerHTML = prettifiedJson;
}

function handleFileSubmission(event) {
  const file = event.target.files[0];

  if (file) {
    parseFile(file);
    // const reader = new FileReader();

    // reader.onload = function (event) {
    //   sendToServiceWorker(event.target.result);
    // };

    // reader.readAsArrayBuffer(file);
  }
}

function parseFile(file, callback) {
  var fileSize = file.size;
  var chunkSize = 64 * 1024; // bytes
  var offset = 0;
  var self = this; // we need a reference to the current object
  var chunkReaderBlock = null;

  var readEventHandler = function (evt) {
    if (evt.target.error == null) {
      offset += evt.target.result.byteLength;
      sendToServiceWorker(evt.target.result); // callback for handling read chunk
    } else {
      console.log("Read error: " + evt.target.error);
      return;
    }
    if (offset >= fileSize) {
      console.log("Done reading file");
      return;
    }

    // of to the next chunk
    chunkReaderBlock(offset, chunkSize, file);
  };

  chunkReaderBlock = function (_offset, length, _file) {
    var r = new FileReader();
    var blob = _file.slice(_offset, length + _offset);
    r.onload = readEventHandler;
    r.readAsArrayBuffer(blob);
  };

  // now let's start the read with the first block
  chunkReaderBlock(offset, chunkSize, file);
}
