import { describe, it, expect } from 'vitest'
import { thrownBy } from './test-helper'
import { Result, Success, Failure, isResult } from '../src/result'
import { isOptional } from '../src/optional'

describe('result', () => {
  describe('isSuccess', () => {
    it('should be true if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.isSuccess()).toBe(true)
    })

    it('should be false if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      expect(failedResult.isSuccess()).toBe(false)
    })
  })

  describe('isFailure', () => {
    it('should be false if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.isFailure()).toBe(false)
    })

    it('should be true if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      expect(failedResult.isFailure()).toBe(true)
    })
  })

  describe('unwrap', () => {
    it('should return value if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      expect(successfulResult.unwrap()).toBe(value)
    })

    it('should return undefined if result is a success without any value', () => {
      const successfulResult = Success()

      expect(successfulResult.unwrap()).toBeUndefined()
    })

    it('should throw the failure error if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)
      const unwrapFunction = () => failedResult.unwrap()

      expect(thrownBy(unwrapFunction)).toBe(value)
    })
  })

  describe('merge', () => {
    it('should return a success merged result', () => {
      const arrayOfSuccessResult = [
        Success('some'),
        Success('value')
      ]

      const mergedResult = Result.merge(arrayOfSuccessResult)

      expect(mergedResult.isSuccess()).toBe(true)
      expect(mergedResult.unwrap()).toStrictEqual(['some', 'value'])
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

      expect(mergedResultFailure.isFailure()).toBe(true)
      // Les deux erreurs portent le même message : seule l'identité distingue la première.
      expect(thrownBy(unwrapFunction)).toBe(firstError)
    })
  })

  describe('onSuccess', () => {
    it('should run callback with unwrapped value and return value if result is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return Success(receivedValue + ' and more')
      })

      expect(returnedResult.isSuccess()).toBe(true)
      expect(returnedResult.unwrap()).toBe('some value and more')
    })

    it('should wrap result in success if callback returns anything other than result', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return receivedValue + ' and more'
      })

      expect(returnedResult.isSuccess()).toBe(true)
      expect(returnedResult.unwrap()).toBe('some value and more')
    })

    it('should return failedResult in callback return a failure', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onSuccess(receivedValue => {
        return Result.fromFailure(new Error(receivedValue + ' and more'))
      })

      expect(returnedResult.isSuccess()).toBe(false)
      expect(returnedResult.isFailure()).toBe(true)

      const unwrapFunction = () => returnedResult.unwrap()
      expect(unwrapFunction).toThrow('some value and more')
    })

    it('should return itself if called on a failedResult', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onSuccess(() => {
        return Result.fromSuccess('Success')
      })

      // « itself » au sens strict : une nouvelle Failure portant la même erreur ne suffit pas.
      expect(returnedResult).toBe(failedResult)
      expect(returnedResult.isSuccess()).toBe(false)
      expect(returnedResult.isFailure()).toBe(true)

      const unwrapFunction = () => returnedResult.unwrap()
      expect(thrownBy(unwrapFunction)).toBe(value)
    })
  })

  describe('onFailure', () => {
    it('should run callback with unwrapped value and return value if result is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return Result.fromSuccess(receivedError.message + ' is now saved')
      })

      expect(returnedResult.isSuccess()).toBe(true)
      expect(returnedResult.unwrap()).toBe('Some error is now saved')
    })

    it('should wrap result in success if callback returns anything other than result', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return receivedError.message + ' is now saved'
      })

      expect(returnedResult.isSuccess()).toBe(true)
      expect(returnedResult.unwrap()).toBe('Some error is now saved')
    })

    it('should return failedResult in callback return a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const returnedResult = failedResult.onFailure(receivedError => {
        return Result.fromFailure(
            new Error(receivedError.message + ' is now failed again')
        )
      })

      expect(returnedResult.isSuccess()).toBe(false)
      expect(returnedResult.isFailure()).toBe(true)

      const unwrapFunction = () => returnedResult.unwrap()
      expect(unwrapFunction).toThrow('Some error is now failed again')
    })

    it('should return itself if called on a successResult', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const returnedResult = successfulResult.onFailure(() => {
        return Result.fromSuccess('Success')
      })

      // « itself » au sens strict : un nouveau Success portant la même valeur ne suffit pas.
      expect(returnedResult).toBe(successfulResult)
      expect(returnedResult.isSuccess()).toBe(true)
      expect(returnedResult.unwrap()).toBe(value)
    })
  })

  describe('toOptional', () => {
    it('should return Some with value if Result is Success with not undef or null value', () => {
      const value = 'some value'
      const result = Success(value)

      const optional = result.toOptional()

      expect(isOptional(optional)).toBe(true)
      expect(optional.orElse('another value')).toBe(value)
    })

    it('should return Empty if Result is a Failure', () => {
      const error = new Error('some error')
      const result = Failure(error)

      const optional = result.toOptional()

      expect(isOptional(optional)).toBe(true)
      expect(optional.isEmpty()).toBe(true)
    })

    it('should return Empty with value if Result is Success with undef or null value', () => {
      const value = null
      const result = Success(value)

      const optional = result.toOptional()

      expect(isOptional(optional)).toBe(true)
      expect(optional.isEmpty()).toBe(true)
    })
  })
})

describe('isResult', () => {
  it('should be true if obj is a success', () => {
    const value = 'some value'
    const successfulResult = Success(value)

    expect(isResult(successfulResult)).toBe(true)
  })

  it('should be true if obj is a failure', () => {
    const value = new Error('Some error')
    const failedResult = Failure(value)

    expect(isResult(failedResult)).toBe(true)
  })


  it('should be false if obj is not a result', () => {
    const someObject = {a: 'test'}

    expect(isResult(someObject)).toBe(false)
  })

  it('should be false if obj is a string or an integer', () => {
    expect(isResult('a string')).toBe(false)
    expect(isResult(31)).toBe(false)
  })

  it('should be false if obj is a bool', () => {
    expect(isResult(true)).toBe(false)
    expect(isResult(false)).toBe(false)
  })

  it('should be false if value is undefined', () => {
    expect(isResult(undefined)).toBe(false)
  })

  it('should be false if value is null', () => {
    expect(isResult(null)).toBe(false)
  })

  it('should be false if obj only mimics the api version without the methods', () => {
    expect(isResult({ kekkaPublicApiVersion: 4 })).toBe(false)
  })
})
