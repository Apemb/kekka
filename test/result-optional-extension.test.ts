import {expect} from './test-helper'

import('../src/result-optional-extension')
import {Empty, isOptional, Some} from '../src/optional'
import {Success, Failure} from '../src/result'

describe('Optional Extension', () => {

  describe('toResult', () => {
    it('should return Success with value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const error = new Error('some error')
      const result = Success(value)
      expect(some.toResult(error)).to.deep.equal(result)
    })

    it('should return Failure if optional is empty', () => {
      const empty = Empty()

      const error = new Error('some error')
      const result = Failure(error)
      expect(empty.toResult(error)).to.deep.equal(result)
    })
  })
})

describe('Result Extension', () => {

  describe('toOptional', () => {
    it('should return Some with value if Result is Success with not undef or null value', () => {
      const value = 'some value'
      const result = Success(value)

      const optional = result.toOptional()

      expect(isOptional(optional)).to.be.true
      expect(optional.orElse('another value')).to.equal(value)
    })

    it('should return Empty if Result is a Failure', () => {
      const error = new Error('some error')
      const result = Failure(error)

      const optional = result.toOptional()

      expect(isOptional(optional)).to.be.true
      expect(optional.isEmpty()).to.be.true
    })

    it('should return Empty with value if Result is Success with undef or null value', () => {
      const value = null
      const result = Success(value)

      const optional = result.toOptional()

      expect(isOptional(optional)).to.be.true
      expect(optional.isEmpty()).to.be.true
    })
  })
})

