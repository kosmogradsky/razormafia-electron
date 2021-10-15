const net = require("net");
const socket = net.Socket();

const connectionStatusSubject = new rxjs.BehaviorSubject("pending");

socket.connect(8080, "127.0.0.1");

socket.on("connect", () => {
  connectionStatusSubject.next("connected");
});

socket.on("error", () => {
  connectionStatusSubject.next("error");
});

socket.on("data", (data) => {
  console.log("received data: " + data);
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
        return "Устанавливаем соединение с сервером...";
      case "connected":
        return "Соединение с сервером установлено.";
      case "error":
        return "Ошибка соединения с сервером!";
    }
  }

  return React.createElement(
    "div",
    { style: { marginBottom: "1.25rem" } },
    getStatusMessage()
  );
}

function Login({ socket }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSetUsername = React.useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleSetPassword = React.useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const handleSubmit = React.useCallback((event) => {
    event.preventDefault();

    socket.write(JSON.stringify({ type: "login", username, password }));
  }, []);

  return React.createElement(
    "form",
    { action: "", onSubmit: handleSubmit },
    React.createElement(
      "label",
      { style: { display: "block", marginBottom: ".5rem" } },
      React.createElement("span", null, "Имя пользователя: "),
      React.createElement("input", {
        type: "text",
        onChange: handleSetUsername,
      })
    ),
    React.createElement(
      "label",
      { style: { display: "block", marginBottom: ".5rem" } },
      React.createElement("span", null, "Пароль: "),
      React.createElement("input", {
        type: "password",
        onChange: handleSetPassword,
      })
    ),
    React.createElement("button", { type: "submit" }, "Залогиниться")
  );
}

function Main({ connectionStatus$, socket }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ConnectionStatus, { connectionStatus$ }),
    React.createElement(Login, { socket })
  );
}

document.body.appendChild(appDiv);

ReactDOM.render(
  Main({ connectionStatus$: connectionStatusSubject.asObservable(), socket }),
  appDiv
);
