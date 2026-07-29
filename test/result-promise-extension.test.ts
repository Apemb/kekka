import { describe, it, expect } from 'vitest'
import {Result, Success, Failure} from '../src/result'

import '../src/result-promise-extension'

describe('result promise', () => {
  describe('thenOnSuccess', () => {
    it('should run callback with unwrapped value if value passed is a success', async () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const promiseChain: Promise<Result<string>> = Promise.resolve(successfulResult).thenOnSuccess(
        successValue => Success(successValue + ' and more')
      )

      const result = await promiseChain

      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Success('some value and more'))
    })

    it('should run wrap callback returned value in a result success if not a result', async () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const promiseChain = Promise.resolve(successfulResult).thenOnSuccess(
        successValue => {
          return Promise.resolve(successValue + ' and more')
        }
      )

      const result = await promiseChain

      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Success('some value and more'))
    })

    it('should not run callback if value passed is a failure', async () => {
      const value = new Error('Some error')
      const failedResult = Failure<string>(value)

      const promiseChain: Promise<Result<string>> = Promise.resolve(failedResult).thenOnSuccess(
        successValue => {
          return Result.fromSuccess(successValue + ' and more')
        }
      )

      const result = await promiseChain

      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Failure(value))
    })

    it('should not run callback if value passed is not a result object', async () => {
      const promiseChain: Promise<string> =
        Promise.resolve('Not a result')
          .thenOnSuccess(successValue => {
            return Success(successValue + ' and more')
          })

      await expect(promiseChain).resolves.not.toBeInstanceOf(Result)
    })
  })

  describe('thenOnFailure', () => {
    it('should run callback with unwrapped value if value passed is a failure', async () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      let receivedByCallback: unknown
      const promiseChain = Promise.resolve(failedResult)
        .thenOnFailure(receivedError => {
          receivedByCallback = receivedError
          return Success(receivedError.message + ' is now saved')
        })

      const result = await promiseChain

      // Le callback doit recevoir l'erreur stockée elle-même, pas une équivalente.
      expect(receivedByCallback).toBe(value)
      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Success('Some error is now saved'))
    })

    it('should run wrap callback returned value in a result success if not a result', async () => {
      const value = new Error('Some error')
      const failedResult = Result.fromFailure(value)

      const promiseChain = Promise.resolve(failedResult)
        .thenOnFailure(receivedError => {
          return Promise.resolve(receivedError.message + ' is now saved')
        })

      const result = await promiseChain

      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Success('Some error is now saved'))
    })

    it('should not run callback if value passed is a success', async () => {
      const value = 'some value'
      const successfulResult = Result.fromSuccess(value)

      const promiseChain = Promise.resolve(successfulResult)
        .thenOnFailure(receivedError => {
          return Result.fromSuccess(receivedError.message + ' is now saved')
        })

      const result = await promiseChain

      expect(result).toBeInstanceOf(Result)
      expect(result).toStrictEqual(Success(value))
    })

    it('should not run callback if value passed is not a result object', async () => {
      const promiseChain = Promise.resolve('Not a result')
        .thenOnFailure(successValue => {
          return Success(successValue + ' and more')
        })

      await expect(promiseChain).resolves.not.toBeInstanceOf(Result)
    })
  })
})
