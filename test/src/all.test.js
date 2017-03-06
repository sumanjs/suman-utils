#!/usr/bin/env node

const suman = require('suman');
const Test = suman.init(module);

Test.create(function (assert, sumanUtils, it, stream, Rx) {

  const {

    isStream,
    isObservable,
    isSubscriber,
    runTranspile,
    isSumanDebug,
    runAssertionToCheckForSerialization,
    buildDirsWithMkDirp,
    getArrayOfDirsToBuild,
    checkIfPathAlreadyExistsInList,
    mapToTargetDir,
    checkForEquality,
    buildDirs,
    padWithFourSpaces,
    padWithXSpaces,
    removePath,
    findSharedPath,
    removeSharedRootPath,
    checkForValInStr,
    isGeneratorFn2,
    isGeneratorFn,
    isArrowFunction,
    isAsyncFn,
    defaultSumanHomeDir,
    defaultSumanResultsDir,
    getHomeDir,
    findProjectRoot,
    once,
    onceAsync,
    arrayHasDuplicates,
    makeResultsDir

  } = sumanUtils;

  it(isStream.name, t => {

    assert(isStream(new stream.Writable()));
    assert(!isStream('dog'));
    assert(!isStream(false));

  });

  it(isObservable.name, t => {

    // assert(isObservable(Rx.Subject.create(sub => {})), 'subject is not an observable');
    assert(isObservable(Rx.Observable.create(sub => {})), 'observable is not an observable');

  });

  it(isSubscriber.name, t => {

    assert(isSubscriber(Rx.Subscriber.create(sub => {})),
      'subscriber is not an subscriber');

  });

  it(runTranspile.name, t => {

  });

  it(isSumanDebug.name, t => {

  });

  it(runAssertionToCheckForSerialization.name, t => {

  });

  it(buildDirsWithMkDirp.name, t => {

  });

  it(getArrayOfDirsToBuild.name, t => {

  });

  it(checkIfPathAlreadyExistsInList.name, t => {

  });

  it(buildDirs.name, t => {

  });

  it(padWithFourSpaces.name, t => {

  });

  it(padWithXSpaces.name, t => {

  });

  it(removeSharedRootPath.name, t => {

  });

  it(checkForValInStr.name, t => {

  });

  it(findSharedPath.name, t => {

  });

  it(removePath.name, t => {

  });

  it(isArrowFunction.name, t => {

  });

  it(isAsyncFn.name, t => {

  });

  it(isGeneratorFn2.name, t => {

  });

  it(isGeneratorFn.name, t => {

  });

  it(defaultSumanHomeDir.name, t => {

  });

  it(defaultSumanResultsDir.name, t => {

  });

  it(getHomeDir.name, t => {

  });

  it(findProjectRoot.name, t => {

  });

  it(once.name, t => {

  });

  it(onceAsync.name, t => {

  });

  it(mapToTargetDir.name, t => {

  });

  it(makeResultsDir.name, t => {

  });

  it(arrayHasDuplicates.name, t => {

  });

  it(checkForEquality.name, t => {

  });

});
