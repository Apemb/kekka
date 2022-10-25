import {expect} from './test-helper'
import {Result, Success, Failure} from '../src/result'

import('../src/result-promise-extension')

describe('result promise', () => {
  describe('thenOnSuccess', () => {
    it('should run callback with unwrapped value if value passed is a success', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const promiseChain: Promise<Result<string>> = Promise.resolve(successfulResult).thenOnSuccess(
        successValue => Success(successValue + ' and more')
      )

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Success('some value and more'))
    })

    it('should run wrap callback returned value in a result success if not a result', () => {
      const value = 'some value'
      const successfulResult = Success(value)

      const promiseChain = Promise.resolve(successfulResult).thenOnSuccess(
        successValue => {
          return Promise.resolve(successValue + ' and more')
        }
      )

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Success('some value and more'))
    })

    it('should not run callback if value passed is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure<string>(value)

      const promiseChain: Promise<Result<string>> = Promise.resolve(failedResult).thenOnSuccess(
        successValue => {
          return Result.fromSuccess(successValue + ' and more')
        }
      )

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Failure(value))
    })

    it('should not run callback if value passed is not a result object', () => {
      const promiseChain: Promise<string> =
        Promise.resolve('Not a result')
          .thenOnSuccess(successValue => {
            return Success(successValue + ' and more')
          })

      return expect(promiseChain).to.eventually.not.be.an.instanceOf(Result)
    })
  })

  describe('thenOnFailure', () => {
    it('should run callback with unwrapped value if value passed is a failure', () => {
      const value = new Error('Some error')
      const failedResult = Failure(value)

      const promiseChain = Promise.resolve(failedResult)
        .thenOnFailure(receivedError => {
          return Success(receivedError.message + ' is now saved')
        })

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Success('Some error is now saved'))
    })

    it('should run wrap callback returned value in a result success if not a result', () => {
      const value = new Error('Some error')
      const failedResult = Result.fromFailure(value)

      const promiseChain = Promise.resolve(failedResult)
        .thenOnFailure(receivedError => {
          return Promise.resolve(receivedError.message + ' is now saved')
        })

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Success('Some error is now saved'))
    })

    it('should not run callback if value passed is a success', () => {
      const value = 'some value'
      const successfulResult = Result.fromSuccess(value)

      const promiseChain = Promise.resolve(successfulResult)
        .thenOnFailure(receivedError => {
          return Result.fromSuccess(receivedError.message + ' is now saved')
        })

      return expect(promiseChain).to.eventually.be.an.instanceOf(Result)
        .and.to.deep.equal(Success(value))
    })

    it('should not run callback if value passed is not a result object', () => {
      const promiseChain = Promise.resolve('Not a result')
        .thenOnFailure(successValue => {
          return Success(successValue + ' and more')
        })

      return expect(promiseChain).to.eventually.not.be.an.instanceOf(Result)
    })
  })
})
