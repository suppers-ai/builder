console.log("Starting test...");
import { Builder } from "fresh/dev";
import config from "../../config.ts";

console.log("Imports successful");
console.log("Config port:", config.profilePort);

const builder = new Builder({ target: "safari12" });
console.log("Builder created");