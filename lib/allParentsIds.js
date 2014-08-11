'use strict';

/** @module lib/allParentsIds */

/**
 * Returns all parents of the passed container, minus the root.
 *
 * @param {object} context - the system definition in which to perform the search
 * @param {object} container - the container to search
 */
function allParentsIds(context, container, parents) {
  var isLeaf = parents === undefined;

  parents = parents || [];

  // doing this before pushing skips the root
  if (!container.containedBy || container.containedBy === container.id) {
    return parents;
  }

  if (!isLeaf) {
    parents.push(container.id);
  }

  // let's order them by tree order
  return allParentsIds(context, context.topology.containers[container.containedBy], parents);
}

module.exports = allParentsIds;
