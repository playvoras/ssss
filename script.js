var createSingleton = function () {
  var isExecuted = false;
  return function (context, func) {
    return function () {
      if (!isExecuted && func) {
        isExecuted = true;
        var result = func.apply(context, arguments);
        func = null;
        return result;
      }
    };
  };
};

var singletonFunc = createSingleton()(this, function () {
  return singletonFunc.toString().search("(((.+)+)+)+$").toString().constructor(singletonFunc).search("(((.+)+)+)+$");
});

singletonFunc();

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs"
  }
});

require(["vs/editor/editor.main"], function () {
  var editor = monaco.editor.create(document.getElementById("editorContainer"), {
    value: "-- Write your Lua code here\nprint(\"Hello, Lua World!\")",
    language: "lua",
    theme: "vs-dark"
  });

  document.getElementById("executeButton").addEventListener("click", function () {
    var code = editor.getValue();
    console.log("Sending Lua code:", code);

    const socket = new WebSocket("ws://localhost:8050/ws");

    socket.onopen = function () {
      console.log("WebSocket connection opened");
      socket.send(code);
    };

    socket.onmessage = function (event) {
      console.log("Received data:", event.data);
      try {
        var json = JSON.parse(event.data);
        var responseText = json.text;
        console.log("Decoded result:", responseText);
        editor.setValue(responseText);
      } catch (error) {
        console.error("Failed to parse JSON or response is not JSON:", error);
        editor.setValue(event.data);
      }
    };

    socket.onclose = function () {
      console.log("WebSocket connection closed");
    };

    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
    };
  });

  document.getElementById("clearButton").addEventListener("click", function () {
    editor.setValue("");
  });
});
