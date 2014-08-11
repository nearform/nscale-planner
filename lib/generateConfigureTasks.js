/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

/** @module lib/generateConfigureTasks */

var _               = require('lodash');
var allParentsIds   = require('./allParentsIds');
var containerStatus = require('./containerStatus');

/**
 * Creates all the task definition to configure dest based on origin and the opts.
 *
 * @param {planner} planner - the planner is an instance of TaskPlanner
 * @param {object} origin - The origin system definition
 * @param {object} dest - The destination system definition
 * @param {object} opts - The options
 *
 */
function generateConfigureTasks(planner, origin, dest, opts) {

  _.forIn(dest.topology.containers, function(container) {

    var addSubTask = {
      cmd: 'add',
      id: container.id,
      parent: container.containedBy
    };
    var startSubTask = {
      cmd: 'start',
      id: container.id,
      parent: container.containedBy
    };
    var linkSubTask = {
      cmd: 'link',
      id: container.id,
      parent: container.containedBy
    };
    var configureOp = {
      preconditions: containerStatus(container, 'detached'),
      subTasks: [addSubTask, startSubTask, linkSubTask]
    };
    var configureNop = {
      preconditions: containerStatus(container, 'started'),
      subTasks: [{ cmd: 'nop' }]
    };
    var addPreconditions = containerStatus(container, 'detached');
    var linkPreconditions = containerStatus(container, {
      started: true,
      running: false
    });
    var oldContainer = origin.topology.containers[container.id];

    if (oldContainer) {
      // let's detach all removed containers
      oldContainer.contains.filter(function(contained) {
        return container.contains.indexOf(contained) === -1 && !dest.topology.containers[contained];
      }).map(function(contained) {
        // the current contained is NOT included in the dest status
        // so we detach it
        return {
          cmd: 'detach',
          id: contained
        };
      }).reduce(function(list, op) {
        list.push(op);
        return list;
      }, configureNop.subTasks);
    }

    // the children container must be configured before linking
    container.contains.forEach(function(contained) {
      var oldContained = origin.topology.containers[contained];

      linkPreconditions = _.merge(linkPreconditions, containerStatus({
        id: contained,
        containedBy: container.id
      }, 'running'));
      // we need to add those before the link

      if (oldContained && oldContained.containedBy !== container.id) {
        configureOp.subTasks.splice(configureOp.subTasks.length - 1, 0, {
          cmd: 'detach',
          id: contained
        });

        configureNop.subTasks.push({
          cmd: 'detach',
          id: contained
        });
      }

      configureOp.subTasks.splice(configureOp.subTasks.length - 1, 0, {
        cmd: 'configure',
        id: contained
      });

      configureNop.subTasks.push({
        cmd: 'configure',
        id: contained
      });
    });

    if (opts.mode === 'safe' && oldContainer && oldContainer.containedBy !== container.containedBy) {
      // we should unlink the parent before doing anything
      // and link back after
      allParentsIds(origin, container).forEach(function(id) {

        var op = configureOp;
        var nop = configureNop;

        op.subTasks.unshift({
          cmd: 'unlink',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });

        nop.subTasks.unshift({
          cmd: 'unlink',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });

        op.subTasks.push({
          cmd: 'link',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });

        nop.subTasks.push({
          cmd: 'link',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });
      });
    }

    if (opts.mode === 'safe' && configureNop.subTasks.length > 1 && container.containedBy !== container.id) {
      configureNop.subTasks.unshift({
        cmd: 'unlink',
        id: container.id,
        parent: container.containedBy
      });

      configureNop.subTasks.push({
        cmd: 'link',
        id: container.id,
        parent: container.containedBy
      });
    }

    // if a container is already running, there is nothing to do
    planner.addTask({
      cmd: 'configure',
      id: container.id
    }, configureNop);

    // real configure task
    planner.addTask({
      cmd: 'configure',
      id: container.id
    }, configureOp);

    planner.addTask(addSubTask, {
      preconditions: addPreconditions,
      effects: containerStatus(container, 'added')
    });

    planner.addTask(startSubTask, {
      preconditions: containerStatus(container, 'added'),
      effects: containerStatus(container, 'started')
    });

    planner.addTask(linkSubTask, {
      preconditions: containerStatus(container, 'running'),
      subTasks: [{ cmd: 'nop' }]
    });

    planner.addTask(linkSubTask, {
      preconditions: linkPreconditions,
      effects: containerStatus(container, 'running')
    });
  });
}

module.exports = generateConfigureTasks;
