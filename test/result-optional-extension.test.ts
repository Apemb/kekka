import {expect} from './test-helper'

import('../src/result-optional-extension')
import {Empty, Some} from '../src/optional'
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

