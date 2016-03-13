# named-queue
like async.queue, but tasks are named and de-duplicated

## Init


### ``var namedQueue = require('named-queue')``
### ``var queue = new namedQueue(processor, concurrency)``

#### `processor` - `function(task, cb)`

#### `concurrency` - `Number` for maximum concurrent tasks

## Methods