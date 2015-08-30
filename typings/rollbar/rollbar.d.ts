declare module "rollbar" {
  interface Notifier {
    log(...errorData: any[]): void;
    debug(...errorData: any[]): void;
    info(...errorData: any[]): void;
    warn(...errorData: any[]): void;
    warning(...errorData: any[]): void;
    error(...errorData: any[]): void;
    critical(...errorData: any[]): void;
  }

  interface Rollbar extends Notifier {
    enable(): Notifier;
  }

  var rollbar: Rollbar;
  export = rollbar;
}