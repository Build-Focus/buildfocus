// Takes a function to call, and turns it into function that returns a promise of its result, not the result directly
// Only useful to ensure code runs asynchronously and as a promise, not synchronously.
function asPromise<T>(body: () => T, context?: any): Promise<T> {
  return Promise.resolve().then(() => body.call(context));
}

export = asPromise;
