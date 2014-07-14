var _ = require('lodash')

function containerStatus(original, status) {

  var state = {
          topology: {
              containers: {}
          }
      }

    , container = {
          id: original.id
      }

  if (typeof status === 'string')

    switch(status) {
      case 'detached':
        container.added   = false
        container.started = false
        container.running = false
        break
      case 'added':
        container.added   = true
        break
      case 'started':
        container.started = true
        break
      case 'running':
        container.running = true
        break

      default:
        throw new Error('unknown state')

    }

  else {
    _.forIn(status, function(value, key) {
      container[key] = value
    })
  }

  state.topology.containers[container.id] = container

  return state
}

module.exports = containerStatus
