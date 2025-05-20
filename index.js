function namedQueue(processor, concurrency) {
	concurrency = concurrency || 1

	var waiting = []

	var inProg = {}
	var count = 0

	//var paused = false

	// Statistics tracking
	var stats = {
		totalProcessed: 0,
		currentlyProcessing: 0,
		maxConcurrent: 0,
		waitTimes: [],
		processingTimes: {},
		taskHistory: {},
		startTimes: {},
		duplicateTaskCalls: 0
	}

	function update() {
		while (waiting.length && count < concurrency) (function () {
			var t = waiting.shift()

			if (inProg[t.task.id]) {
				inProg[t.task.id].push(t.cb)
				stats.duplicateTaskCalls++
				return
			} else {
				// Record task start time
				stats.startTimes[t.task.id] = Date.now()
				if (!stats.taskHistory[t.task.id]) {
					stats.taskHistory[t.task.id] = { count: 0, totalTime: 0 }
				}

				inProg[t.task.id] = [t.cb]
				count++
				stats.currentlyProcessing = count
				stats.maxConcurrent = Math.max(stats.maxConcurrent, count)

				// Record wait time
				if (t.queuedAt) {
					var waitTime = Date.now() - t.queuedAt
					stats.waitTimes.push(waitTime)
				}

				processor(t.task, function () {
					var args = arguments

					if (!inProg[t.task.id]) return // probably callback called twice

					// Record processing time
					var processingTime = Date.now() - stats.startTimes[t.task.id]
					stats.processingTimes[t.task.id] = processingTime
					stats.taskHistory[t.task.id].count++
					stats.taskHistory[t.task.id].totalTime += processingTime

					count--
					stats.totalProcessed++
					stats.currentlyProcessing = count

					inProg[t.task.id].forEach(function (cb) { cb.apply(null, args) })
					delete inProg[t.task.id]
					delete stats.startTimes[t.task.id]

					setImmediate(update)
				})
			}
		})()
	}

	this.push = function (task, cb) {
		if (!task.hasOwnProperty('id')) throw new Error('no task.id')
		if (inProg[task.id]) {
			inProg[task.id].push(cb)
			stats.duplicateTaskCalls++
			return
		}
		waiting.push({ task: task, cb: cb, queuedAt: Date.now() })
		setImmediate(update)
	}

	this.unshift = function (task, cb) {
		if (inProg[task.id]) {
			inProg[task.id].push(cb)
			stats.duplicateTaskCalls++
			return
		}
		waiting.unshift({ task: task, cb: cb, queuedAt: Date.now() })
		setImmediate(update)
	}

	this.length = function () {
		return waiting.length
	}

	// Statistics methods
	this.getStats = function () {
		return {
			queueLength: waiting.length,
			activeTaskCount: count,
			maxConcurrent: stats.maxConcurrent,
			totalProcessed: stats.totalProcessed,
			duplicateTaskCalls: stats.duplicateTaskCalls,
			averageWaitTime: stats.waitTimes.length > 0 ?
				stats.waitTimes.reduce((a, b) => a + b, 0) / stats.waitTimes.length : 0,
			taskStats: Object.keys(stats.taskHistory).map(id => ({
				id: id,
				count: stats.taskHistory[id].count,
				averageTime: stats.taskHistory[id].count > 0 ?
					stats.taskHistory[id].totalTime / stats.taskHistory[id].count : 0
			}))
		}
	}

	this.resetStats = function () {
		stats = {
			totalProcessed: 0,
			currentlyProcessing: 0,
			maxConcurrent: 0,
			waitTimes: [],
			processingTimes: {},
			taskHistory: {},
			startTimes: {},
			duplicateTaskCalls: 0
		}
		return this
	}
}

module.exports = namedQueue