import chalk from "chalk";

const TERMINAL_WIDTH = process.stdout.columns ?? 80;

export const logger = (...data: unknown[]) => {
  const time = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
  const message = data.map(String).join(" ");

  const padding =
    TERMINAL_WIDTH - message.length - time.length - 1;

  console.log(
    message +
      " ".repeat(Math.max(1, padding)) +
      time
  );
};
