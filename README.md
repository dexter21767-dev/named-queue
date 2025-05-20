# named-queue
like async.queue, but tasks are named and de-duplicated, with built-in statistics tracking

## Init


### ``var namedQueue = require('named-queue')``
### ``var queue = new namedQueue(processor, concurrency)``

#### `processor` - `function(task, cb)`

#### `concurrency` - `Number` for maximum concurrent tasks; can be `Infinity`

## Methods

**WARNING** All tasks must have an **`.id`** property used to identify and avoid doing the same task more than once at a time

### ``queue.push(task, cb)``

### ``queue.unshift(task, cb)``

### ``queue.length()``

## Statistics Tracking

The queue now includes built-in statistics tracking to help monitor performance.

### ``queue.getStats()``

Returns an object with the following statistics:

- `queueLength`: Current number of tasks waiting in the queue
- `activeTaskCount`: Number of tasks currently being processed
- `maxConcurrent`: Maximum number of tasks that have ever been processed concurrently
- `totalProcessed`: Total number of tasks processed since queue creation or last reset
- `duplicateTaskCalls`: Number of duplicate task calls (tasks with same ID already in progress)
- `averageWaitTime`: Average time tasks spend waiting in the queue (in milliseconds)
- `taskStats`: Array of per-task statistics, including:
  - `id`: Task ID
  - `count`: Number of times this task has been processed
  - `averageTime`: Average processing time for this task (in milliseconds)

### ``queue.resetStats()``

Resets all statistics tracking to zero. Returns the queue object for chaining.

## Example

```javascript
const queue = new namedQueue(processTask, 3);

// Add tasks to the queue
queue.push({id: 'task1', data: 'example'}, callback);

// Get current queue statistics
const stats = queue.getStats();
console.log(`Tasks processed: ${stats.totalProcessed}`);
console.log(`Average wait time: ${stats.averageWaitTime}ms`);

// Reset statistics if needed
queue.resetStats();
```