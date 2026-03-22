import Template from "./template.js";
import { VMBrowser } from "./vm_browser.js";

const template = new Template(VMBrowser);
const exported = template.exports();

export const { render, renderAsync, compile, compileAsync } = exported;
export default exported;
