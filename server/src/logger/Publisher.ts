import { Observer } from "./Observer";
import { LogLevel } from "./Observer";
// PATTERN:Observer
export default class LoggerPublisher {
  private observers: Observer[] = [];

  public subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  public unsubscribe(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notify(level: LogLevel, message: string): void {
    this.observers.forEach((observer) => observer.update(level, message));
  }
}
