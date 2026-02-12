import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    preset: "@arcstudio/config/build.preset",
    entries: ["src/index"],
});