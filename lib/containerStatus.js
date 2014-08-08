'use strict';

var _ = require('lodash');

function containerStatus(original, status, parent) {

  var state = {
    topology: {
      containers: {}
    }
  };

  var container = {
    id: original.id
  };

  if (parent === null) {
    // nothing to do
  } else if (parent !== undefined) {
    container.containedBy = parent;
  } else {
    container.containedBy = original.containedBy;
  }

  if (typeof status === 'string') {

    switch(status) {
      case 'detached':
        container.added   = false;
        container.started = false;
        container.running = false;
        break;
      case 'added':
        container.added   = true;
        break;
      case 'started':
        container.started = true;
        break;
      case 'running':
        container.running = true;
        break;

      default:
        throw new Error('unknown state');
    }

  } else {
    _.forIn(status, function(value, key) {
      container[key] = value;
    });
  }

  if (container.added === false) {
    delete container.containedBy;
  }

  state.topology.containers[container.id] = container;

  return state;
}

module.exports = containerStatus;
