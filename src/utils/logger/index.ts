import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from "winston";
import ora from "ora";
import chalk from "chalk";
import {
  LoggerMessageComponent,
  LoggerSpinner,
  LoggerMessageColor,
  LoggerOperationResultType,
} from "@/types/logger";

class Logger {
  private static instance: Logger;
  private readonly logger: WinstonLogger;
  private readonly logLevels = ["info", "warn", "error", "debug"] as const;
  private readonly colorMap: Record<
    (typeof this.logLevels)[number],
    LoggerMessageColor
  > = {
    info: "whiteBright",
    warn: "yellow",
    error: "red",
    debug: "gray",
  };

  private constructor() {
    this.logger = createLogger({
      level: "info",
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`,
        ),
      ),
      transports: [new transports.Console()],
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private colorizeMessage(...components: LoggerMessageComponent[]): string {
    return components
      .map((component) => {
        if (typeof component === "string") {
          return chalk.white(component);
        }

        let coloredMessage = chalk[component.color](component.message);

        if (component.isBold) {
          coloredMessage = chalk.bold(coloredMessage);
        }

        return coloredMessage;
      })
      .join(" ");
  }

  private log(
    level: (typeof this.logLevels)[number],
    ...components: LoggerMessageComponent[]
  ): void {
    const newComponents = components.map((component) => {
      if (typeof component === "string") {
        // Overriding the component to include the specified color
        return {
          message: component,
          isBold: false,
          color: this.colorMap[level],
        };
      }

      return component;
    });

    this.logger[level](this.colorizeMessage(...newComponents));
  }

  public info(...components: LoggerMessageComponent[]): void {
    this.log("info", ...components);
  }

  public warn(...components: LoggerMessageComponent[]): void {
    this.log("warn", ...components);
  }

  public error(...components: LoggerMessageComponent[]): void {
    this.log("error", ...components);
  }

  public debug(...components: LoggerMessageComponent[]): void {
    this.log("debug", ...components);
  }

  public startSpinner(...components: LoggerMessageComponent[]): LoggerSpinner {
    const spinner = ora(this.colorizeMessage(...components)).start();

    const stop = (
      result: LoggerOperationResultType,
      ...components: LoggerMessageComponent[]
    ) => {
      spinner.prefixText = "";
      const message = this.colorizeMessage(...components);

      const spinnerActions: Record<LoggerOperationResultType, () => void> = {
        success: () => spinner.succeed(message),
        failure: () => spinner.fail(message),
        warn: () => spinner.warn(message),
        info: () => spinner.info(message),
      };

      spinnerActions[result]!();
    };

    const update = (...components: LoggerMessageComponent[]) => {
      spinner.text = this.colorizeMessage(...components);
    };

    return { update, stop };
  }
}

export default Logger.getInstance();
