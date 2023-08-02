import { expect } from './test-helper'
import { Result, Success, Failure, isResult } from '../src/result'

describe('result', () => {
  describe('isSuccess', () => {
    it('should be true if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.isSuccess()).to.be.true
    })

    it('should be false if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      expect(failedResult.isSuccess()).to.be.false
    })
  })

  describe('isFailure', () => {
    it('should be false if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.isFailure()).to.be.false
    })

    it('should be true if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      expect(failedResult.isFailure()).to.be.true
    })
  })

  describe('unwrap', () => {
    it('should return value if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.unwrap()).to.equal(value)
    })

    it('should return undefined if result is a success without any value', () => {
      const successfulResult = Success()

      expect(successfulResult.unwrap()).to.equal(undefined)
    })

    it('should throw the failure error if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)
      const unwrapFunction = () => failedResult.unwrap()

      expect(unwrapFunction).to.throw(value)
    })
  })

  describe('merge', () => {
    it('should return a success merged result', () => {
      const arrayOfSuccessResult = [
        Success('some'),
        Success('value')
      ]

      const mergedResult = Result.merge(arrayOfSuccessResult)

      expect(mergedResult.isSuccess()).to.be.true
      expect(mergedResult.unwrap()).to.deep.equal(['some', 'value'])
    })

    it('should return the first failure if one or more items in array is a failure', () => {
      const firstError = new Error('First error')
      const secondError = new Error('First error')

      const arrayOfFailureResult = [
        Success('some'),
        Failure(firstError),
        Failure(secondError),
        Success('value')
      ]

      const mergedResultFailure = Result.merge(arrayOfFailureResult)
      const unwrapFunction = () => mergedResultFailure.unwrap()

      expect(mergedResultFailure.isFailure()).to.be.true
      expect(unwrapFunction).to.throw(firstError)
    })
  })

  describe('onSuccess', () => {
    it('should run callback with unwrapped value and return value if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return Success(receivedValue + ' and more')
      })

      expect(returnedResult.isSuccess()).to.be.true
      expect(returnedResult.unwrap()).to.equal('some value and more')
    })

    it('should wrap result in success if callback returns anything other than result', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return receivedValue + ' and more'
      })

      expect(returnedResult.isSuccess()).to.be.true
      expect(returnedResult.unwrap()).to.equal('some value and more')
    })

    it('should return failedResult in callback return a failure', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return Result.fromFailure(new Error(receivedValue + ' and more'))
      })

      expect(returnedResult.isSuccess()).to.be.false
      expect(returnedResult.isFailure()).to.be.true

      const unwrapFunction = () => returnedResult.unwrap()
      expect(unwrapFunction).to.throw('some value and more')
    })

    it('should return itself if called on a failedResult', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onSuccess(() => {
        return Result.fromSuccess('Success')
      })

      expect(returnedResult.isSuccess()).to.be.false
      expect(returnedResult.isFailure()).to.be.true

      const unwrapFunction = () => returnedResult.unwrap()
      expect(unwrapFunction).to.throw(value)
    })
  })

  describe('onFailure', () => {
    it('should run callback with unwrapped value and return value if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return Result.fromSuccess(receivedError.message + ' is now saved')
      })

      expect(returnedResult.isSuccess()).to.be.true
      expect(returnedResult.unwrap()).to.equal('Some error is now saved')
    })

    it('should wrap result in success if callback returns anything other than result', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return receivedError.message + ' is now saved'
      })

      expect(returnedResult.isSuccess()).to.be.true
      expect(returnedResult.unwrap()).to.equal('Some error is now saved')
    })

    it('should return failedResult in callback return a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return Result.fromFailure(
            new Error(receivedError.message + ' is now failed again')
        )
      })

      expect(returnedResult.isSuccess()).to.be.false
      expect(returnedResult.isFailure()).to.be.true

      const unwrapFunction = () => returnedResult.unwrap()
      expect(unwrapFunction).to.throw('Some error is now failed again')
    })

    it('should return itself if called on a successResult', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onFailure(() => {
        return Result.fromSuccess('Success')
      })

      expect(returnedResult.isSuccess()).to.be.true
      expect(returnedResult.unwrap()).to.equal(value)
    })
  })
})

describe('isResult', () => {
  it('should be true if obj is a success', () => {
    const value = 'some value'
    const successfulResult = Success(value)

    expect(isResult(successfulResult)).to.be.true
  })

  it('should be true if obj is a failure', () => {
    const value = new Error('Some error')
    const failedResult = Failure(value)

    expect(isResult(failedResult)).to.be.true
  })


  it('should be false if obj is not a result', () => {
    const someObject = {a: 'test'}

    expect(isResult(someObject)).to.be.false
  })

  it('should be false if obj is a string or an integer', () => {
    expect(isResult('a string')).to.be.false
    expect(isResult(31)).to.be.false
  })

  it('should be false if obj is a bool', () => {
    expect(isResult(true)).to.be.false
    expect(isResult(false)).to.be.false
  })

  it('should be false if value is undefined', () => {
    expect(isResult(undefined)).to.be.false
  })

  it('should be false if value is null', () => {
    expect(isResult(null)).to.be.false
  })
})
