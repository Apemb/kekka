import { expect } from './test-helper'
import {Empty, isOptional, Optional, Some} from '../src/optional'

describe('Optional', () => {

  describe('ofNullable', () => {
    it('should return a full optional if value is not nullable', () => {
      const value = 'some value'
      const optional = Optional.ofNullable(value)

      expect(optional.isSome()).to.be.true
    })

    it('should return an empty optional if value is undefined', () => {
      const value = undefined
      const optional = Optional.ofNullable<string>(value)

      expect(optional.isSome()).to.be.false
    })

    it('should return an empty optional if value is null', () => {
      const value = null
      const optional = Optional.ofNullable<string>(value)

      expect(optional.isSome()).to.be.false
    })
  })

  describe('isSome', () => {
    it('should be true if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      expect(some.isSome()).to.be.true
    })

    it('should be false if optional is empty', () => {
      const empty = Empty<string>()

      expect(empty.isSome()).to.be.false
    })
  })

  describe('isEmpty', () => {
    it('should be false if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      expect(some.isEmpty()).to.be.false
    })

    it('should be true if optional is empty', () => {
      const empty = Empty<string>()

      expect(empty.isEmpty()).to.be.true
    })
  })

  describe('orElse', () => {
    it('should return associated value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const backupValue = 'other value'
      expect(some.orElse(backupValue)).to.equal(value)
    })

    it('should return function argument if optional is empty', () => {
      const empty = Empty<string>()

      const backupValue = 'other value'
      expect(empty.orElse(backupValue)).to.equal(backupValue)
    })
  })

  describe('orElseGet', () => {
    it('should return Promise with associated value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const backupValue = 'other value'
      expect(some.orElseGet(() => Promise.resolve(backupValue))).to.eventually.equal(value)
    })

    it('should return function return value if optional is empty', () => {
      const empty = Empty<string>()

      const backupValue = 'other value'
      expect(empty.orElseGet(() => Promise.resolve(backupValue))).to.eventually.equal(backupValue)
    })
  })

  describe('orElseThrow', () => {
    it('should return associated value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const error = new Error('some error')
      expect(some.orElseThrow(error)).to.equal(value)
    })

    it('should throw error if optional is empty', () => {
      const empty = Empty<string>()

      const error = new Error('some error')
      expect(() => empty.orElseThrow(error)).to.throw(error)
    })
  })

  describe('map', () => {
    it('should not run callback and return Empty if start optional is Empty', () => {
      const empty = Empty<string>()
      const mapFunction = (value: string) => value + ' and again'

      const returnedOptional = empty.map(mapFunction)

      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.isEmpty()).to.be.true
    })

    it('should run callback with unwrapped value and return Some with callback result if result not undef or null', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = (value: string) => value + ' and again'

      const returnedOptional = some.map(mapFunction)

      const expectedValue = 'some value and again'
      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.orElse('something else')).to.equal(expectedValue)
    })

    it('should run callback and return Empty with callback result if result is undef', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = () => undefined

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.isEmpty()).to.be.true
    })

    it('should run callback and return Empty with callback result if result is null', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = () => null

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.isEmpty()).to.be.true
    })

    it('should run callback with unwrapped value and return Some with callback result if result is Optional with associated value', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const otherValue = 'Other better value'
      const otherSome = Some(otherValue)
      const mapFunction = () => otherSome

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.orElse('something else')).to.equal(otherValue)
    })

    it('should run callback with unwrapped value and return Empty with callback result if result is Empty Optional', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const otherEmpty = Empty<string>()
      const mapFunction = () => otherEmpty

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).to.be.true
      expect(returnedOptional.isEmpty()).to.be.true
    })
  })
})

describe('isOptional', () => {
  it('should be true if obj is an optional with value', () => {
    const value = 'some value'
    const optional = Some(value)

    expect(isOptional(optional)).to.be.true
  })

  it('should be true if obj is an empty optional', () => {
    const emptyOptional = Empty<string>()

    expect(isOptional(emptyOptional)).to.be.true
  })


  it('should be false if obj is not an optional', () => {
    const someObject = {a: 'test'}

    expect(isOptional(someObject)).to.be.false
  })

  it('should be false if obj is a string or an integer', () => {
    expect(isOptional('a string')).to.be.false
    expect(isOptional(31)).to.be.false
  })

  it('should be false if obj is a bool', () => {
    expect(isOptional(true)).to.be.false
    expect(isOptional(false)).to.be.false
  })

  it('should be false if value is undefined', () => {
    expect(isOptional(undefined)).to.be.false
  })

  it('should be false if value is null', () => {
    expect(isOptional(null)).to.be.false
  })
})
