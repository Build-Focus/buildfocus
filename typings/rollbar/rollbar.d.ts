declare module "rollbar" {
  interface RollbarNotifier {
    log(...errorData: any[]): void;
    debug(...errorData: any[]): void;
    info(...errorData: any[]): void;
    warn(...errorData: any[]): void;
    warning(...errorData: any[]): void;
    error(...errorData: any[]): void;
    critical(...errorData: any[]): void;
  }

  var rollbar: RollbarNotifier;
  export = rollbar;
}