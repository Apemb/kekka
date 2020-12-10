const { Result, Success, Failure } = require('./result')

function enableResultPromiseHelpers (promise) {
  const wrapValueInResult = function (value) {
    if (value instanceof Result) {
      return value
    } else {
      return Success(value)
    }
  }
  const wrapValueInResultAsync = function (value) {
    if (value instanceof promise) {
      return value.then(wrapValueInResult)
    } else {
      return wrapValueInResult(value)
    }
  }

  promise.prototype.thenOnSuccess = function (callback) {
    return this.then(value => {
      if (value instanceof Result && value.isSuccess()) {
        return wrapValueInResultAsync(callback(value.unwrap()))
      } else {
        return value
      }
    })
  }

  promise.prototype.thenOnFailure = function (callback) {
    return this.then(value => {
      if (value instanceof Result && value.isFailure()) {
        return wrapValueInResultAsync(callback(value.value))
      } else {
        return value
      }
    })
  }

  promise.resolveFromSuccess = function (value) {
    return promise.resolve(Success(value))
  }

  promise.resolveFromFailure = function (value) {
    return promise.resolve(Failure(value))
  }
}

module.exports.enableResultPromiseHelpers = enableResultPromiseHelpers
