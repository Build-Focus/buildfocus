interface KeenStatic {
  new (config: KeenConfig): KeenClient;
}

interface KeenConfig {
  projectId: string;
  writeKey?: string;
  readKey?: string;
}

interface KeenClient {
  addEvent(eventCollection: string,
           eventProperties: {[key:string]: any},
           callback: (error: {}, response: {}) => void): void;

  setGlobalProperties(globalPropertiesGenerator: (eventCollection: string) => {[index:string]: any}): void;
}

declare module "keen" {
  var keen: KeenStatic;
  export = keen;
}