import { render } from "preact";
import { App } from "./app";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/editor.css";
import "./styles/results.css";
import "./styles/schema.css";
import "./styles/challenges.css";
import "./styles/er.css";
import "./styles/mobile.css";

render(<App />, document.getElementById("app")!);
