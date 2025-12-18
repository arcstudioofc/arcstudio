import PKG from "../../package.json";
// import Project from "../../projects.json";

export const settings = {
  name: "ARC Studio",
  version: PKG.version,
  // projects: Project.projects,
  author: "Israel R. Jatobá",
  email: "contact.israeljatoba@gmail.com",
  callbaclUrl: process.env.NEXT_PUBLIC_APP_URL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,

  links: {
    github: "https://github.com/arcstudioofc/arcstudio",
    site: "https://arcstudio.online/",
    app: "https://app.arcstudio.online/",
    discord: "/discord",
    instagram: "/instagram",
    twitter: "/twitter",
  },
};
