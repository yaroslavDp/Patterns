import { Observer, FileLogger, ConsoleErrorLogger } from "./Observer";
import LoggerPublisher from "./Publisher";
import { LogLevel } from "./Observer";

const path = require("path");
const logFileName = "log.txt";
const logsPath = path.join(__dirname, "..", "logs", logFileName);
class LoggingSystem {
  private publisher: LoggerPublisher;

  constructor() {
    this.publisher = new LoggerPublisher();
  }

  subscribe(subscriber: Observer) {
    this.publisher.subscribe(subscriber);
  }

  unsubscribe(subscriber: Observer) {
    this.publisher.unsubscribe(subscriber);
  }

  log(level: LogLevel, message: string) {
    this.publisher.notify(level, message);
  }
}
// PATTERN:Observer
const notification = new LoggingSystem();
const fileLogger = new FileLogger(logsPath);
const errorLogger = new ConsoleErrorLogger();
notification.subscribe(fileLogger);
notification.subscribe(errorLogger);

export { notification };
