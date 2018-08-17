"use strict";

const describeRef = require("@lerna/describe-ref");
const ValidationError = require("@lerna/validation-error");

module.exports = checkWorkingTree;

function checkWorkingTree({ cwd } = {}) {
  let chain = Promise.resolve();

  chain = chain.then(() => describeRef({ cwd }));

  // wrap each test separately to allow all applicable errors to be reported
  const tests = [
    // prevent duplicate versioning
    chain.then(({ refCount }) => {
      if (refCount === "0") {
        throw new ValidationError(
          "ERELEASED",
          "The current commit has already been released. Please make new commits before continuing."
        );
      }
    }),
    // prevent publish of uncommitted changes
    chain.then(({ isDirty }) => {
      if (isDirty) {
        throw new ValidationError(
          "EUNCOMMIT",
          "Working tree has uncommitted changes, please commit or remove changes before continuing."
        );
      }
    }),
  ];

  return chain.then(result => Promise.all(tests).then(() => result));
}
