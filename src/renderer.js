import {
  h,
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
} from "./thirdparty/snabbdom.js";

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

const appDiv = document.createElement("div");

const oldSpanVnode = h("span", { style: { fontWeight: "bold" } }, "This is bold");
const newSpanVnode = h("span", { style: { fontWeight: "400" } }, "This is italic");

const vnode = h("div#container.two.classes", { on: { click: () => { console.log('onClick') } } }, [
  oldSpanVnode
]);

document.body.appendChild(appDiv);

// Patch into empty DOM element – this modifies the DOM as a side effect
patch(appDiv, vnode);

patch(oldSpanVnode, newSpanVnode);