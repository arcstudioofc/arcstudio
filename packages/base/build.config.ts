import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    preset: "@elephant.js/config/build.preset",
    entries: ["src/index"],
});