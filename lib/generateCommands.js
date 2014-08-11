
'use strict';

/** @module lib/generateCommands */

var _ = require('lodash');

/**
 * Generate the configure and detach commands for all root elements.
 *
 * @param {object} origin - The origin system definition
 * @param {object} dest - The destination system definition
 */
function generateCommands(origin, dest) {
  var destCmds = _.chain(dest.topology.containers)
    .values()
    .filter(function(container) {
      return container.containedBy === container.id || !container.containedBy;
    })
    .map(function(container) {
      return {
        cmd: 'configure',
        id: container.id
      };
    })
    .value();

  var originCmds = _.chain(origin.topology.containers)
    .values()
    .map(function(container) {
      if (!dest.topology.containers[container.id]) {
        return {
          cmd: 'detach',
          id: container.id
        };
      }

      return null;
    }).filter(function(container) {
      return container !== null;
    })
    .value();

  return destCmds.concat(originCmds);
}

module.exports = generateCommands;
