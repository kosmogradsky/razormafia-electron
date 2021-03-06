import { writeStringToSocket } from "./util/writeStringToSocket.js";
import { readMessagesFromSocket } from "./util/readMessagesFromSocket.js";

const net = require("net");
const { nanoid } = require("nanoid");

class RemoteRequester {
  #responseCallbacks = new Map();

  request({ method, path, body }) {
    const requestId = nanoid();

    writeStringToSocket(socket, JSON.stringify({ requestId, method, path, body }));

    return new Promise((resolve) => {
      const timeoutHandle = setTimeout(() => {
        this.#responseCallbacks.delete(requestId);

        resolve({ status: "timeout" });
      }, 5000);

      this.#responseCallbacks.set(requestId, (responseBody) => {
        clearTimeout(timeoutHandle);
        this.#responseCallbacks.delete(requestId);

        resolve(responseBody);
      });
    });
  }

  invoke(responseId, responseBody) {
    const responseHandler = this.#responseCallbacks.get(responseId);

    if (responseHandler) {
      responseHandler(responseBody);
    }
  }
}

const remoteRequester = new RemoteRequester();

const connectionStatusSubject = new rxjs.BehaviorSubject("pending");

const socket = net.Socket();

socket.connect(8080, "127.0.0.1");

socket.on("connect", () => {
  connectionStatusSubject.next("connected");

  remoteRequester
    .request({ method: "subscribe", path: "auth_state" })
    .then((response) => {
      console.log("auth_state subscribe response", response);
    });
});

socket.on("error", () => {
  connectionStatusSubject.next("error");
});

socket.on("data", (dataBuffer) => {
  const dataUint8Array = new Uint8Array(dataBuffer);
  const strMessages = readMessagesFromSocket(dataUint8Array);

  for (const strMessage of strMessages) {
    const message = JSON.parse(strMessage);
    const responseId = message.responseId;
    const body = message.body;

    console.log("incoming message", message);

    if (responseId) {
      remoteRequester.invoke(responseId, body);
    }
  }
});

socket.on("close", () => {
  connectionStatusSubject.next("closed");
});

const appDiv = document.createElement("div");

function ConnectionStatus({ connectionStatus$ }) {
  const [connectionStatus, setConnectionStatus] = React.useState("pending");

  React.useEffect(() => {
    const connectionStatusSubscription =
      connectionStatus$.subscribe(setConnectionStatus);

    return () => {
      connectionStatusSubscription.unsubscribe();
    };
  }, []);

  function getStatusMessage() {
    switch (connectionStatus) {
      case "pending":
        return "?????????????????????????? ???????????????????? ?? ????????????????...";
      case "connected":
        return "???????????????????? ?? ???????????????? ??????????????????????.";
      case "error":
        return "???????????? ???????????????????? ?? ????????????????!";
      case "closed":
        return "???????????? ?????????????? ????????????????????.";
    }
  }

  return React.createElement(
    "div",
    { style: { marginBottom: "1.25rem" } },
    getStatusMessage()
  );
}

function Login() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSetUsername = React.useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleSetPassword = React.useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();

      remoteRequester
        .request({
          method: "contract",
          path: "sign_in",
          body: { username, password },
        })
        .then((response) => {
          console.log("logged in response", response);
        });
    },
    [username, password]
  );

  return React.createElement(
    "form",
    { action: "", onSubmit: handleSubmit },
    React.createElement(
      "label",
      { style: { display: "block", marginBottom: ".5rem" } },
      React.createElement("span", null, "?????? ????????????????????????: "),
      React.createElement("input", {
        type: "text",
        onChange: handleSetUsername,
      })
    ),
    React.createElement(
      "label",
      { style: { display: "block", marginBottom: ".5rem" } },
      React.createElement("span", null, "????????????: "),
      React.createElement("input", {
        type: "password",
        onChange: handleSetPassword,
      })
    ),
    React.createElement("button", { type: "submit" }, "????????????????????????")
  );
}

function Main({ connectionStatus$ }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ConnectionStatus, { connectionStatus$ }),
    React.createElement(Login)
  );
}

document.body.appendChild(appDiv);

ReactDOM.render(
  Main({ connectionStatus$: connectionStatusSubject.asObservable() }),
  appDiv
);
