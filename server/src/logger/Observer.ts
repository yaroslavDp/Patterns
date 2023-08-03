import * as fs from "fs";
// PATTERN:Observer
enum LogLevel {
  Info = "info",
  Warning = "warning",
  Error = "error",
}
interface Observer {
  update(level: LogLevel, message: string): void;
}
class FileLogger implements Observer {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }
  update(level: LogLevel, message: string): void {
    const myMessage = `${level}: ${message} \n`;
    fs.appendFile(this.filePath, myMessage, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      }
    });
  }
}

class ConsoleErrorLogger implements Observer {
  update(level: LogLevel, message: string): void {
    if (level === LogLevel.Error) {
      console.error(message);
    }
  }
}
export { FileLogger, ConsoleErrorLogger, Observer, LogLevel };
