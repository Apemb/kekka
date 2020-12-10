const TYPE = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

class Result {
  constructor ({ type, value }) {
    this.type = type
    this.value = value
  }

  static fromSuccess (value) {
    return new Result({ type: TYPE.SUCCESS, value: value })
  }

  static fromFailure (value) {
    return new Result({ type: TYPE.FAILURE, value: value })
  }

  static merge (results) {
    return results.reduce((resultOfMerge, currentResult) => {
      if (currentResult.isSuccess()) {
        return resultOfMerge.onSuccess(mergedResultValue => {
          mergedResultValue.push(currentResult.unwrap())
          return mergedResultValue
        })
      } else if (currentResult.isFailure() && resultOfMerge.isSuccess()) {
        return currentResult
      }
      return resultOfMerge
    }, Result.fromSuccess([]))
  }

  isSuccess () {
    return this.type === TYPE.SUCCESS
  }

  isFailure () {
    return this.type === TYPE.FAILURE
  }

  unwrap () {
    if (this.isSuccess()) {
      return this.value
    } else if (this.isFailure()) {
      throw this.value
    }
  }

  onSuccess (callback) {
    if (this.isSuccess()) {
      const returnedValue = callback(this.value)

      if (returnedValue instanceof Result) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue)
      }
    } else {
      return this
    }
  }

  onFailure (callback) {
    if (this.isFailure()) {
      const returnedValue = callback(this.value)

      if (returnedValue instanceof Result) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue)
      }
    } else {
      return this
    }
  }

  toString () {
    if (this.isSuccess()) {
      return `[Result-Success (${this.value})]`
    } else if (this.isFailure()) {
      return `[Result-Failure (${this.value})]`
    } else {
      return `[Result (${this.type} - ${this.value})]`
    }
  }

  inspect () {
    return this.toString()
  }
}

Result.type = TYPE

module.exports.Result = Result
module.exports.Success = Result.fromSuccess
module.exports.Failure = Result.fromFailure
