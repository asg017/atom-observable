import node from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  input: "src/index.js",
  output: [
    {
      file: "bundle.js",
      format: "es"
    }
  ],
  plugins: [node(), commonjs()]
};
