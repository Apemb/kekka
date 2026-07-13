process.env.NODE_ENV = 'test'

import { use, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'

use(chaiAsPromised)

export { expect }
