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

/** @module lib/generateDetachTasks */

var _               = require('lodash');
var allParentsIds   = require('./allParentsIds');
var containerStatus = require('./containerStatus');

/**
 * Creates all the task definition to shut down (detach) all instances in origin.
 *
 * @param {planner} planner - the planner is an instance of TaskPlanner
 * @param {object} origin - The origin system definition
 * @param {object} opts - The options
 *
 */
function generateDetachTasks(planner, origin, opts) {

  _.forIn(origin.topology.containers, function(container) {

    var stopSubTask = {
      cmd: 'stop',
      id: container.id,
      parent: container.containedBy
    };

    var removeSubTask = {
      cmd: 'remove',
      id: container.id,
      parent: container.containedBy
    };

    var unlinkSubTask = {
      cmd: 'unlink',
      id: container.id,
      parent: container.containedBy
    };

    var detachOp = {
      preconditions: containerStatus(container, 'running'),
      subTasks: [unlinkSubTask, stopSubTask, removeSubTask]
    };

    var unlinkPreconditions = containerStatus(container, 'running');
    var stopPrecondition = containerStatus(container, 'started');
    var removePrecondition = containerStatus(container, 'added');

    container.contains.forEach(function(contained) {
      var status = containerStatus({
        id: contained
      }, 'started');
      stopPrecondition = _.merge(stopPrecondition, status);

      detachOp.subTasks.splice(1, 0, {
        cmd: 'detach',
        id: contained
      });
    });

    if (opts.mode === 'safe') {
      allParentsIds(origin, container).forEach(function(id) {

        detachOp.subTasks.unshift({
          cmd: 'unlink',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });

        detachOp.subTasks.push({
          cmd: 'link',
          id: id,
          parent: origin.topology.containers[id].containedBy
        });
      });
    }

    planner.addTask({
      cmd: 'detach',
      id: container.id
    }, {
      preconditions: containerStatus(container, 'detached'),
      subTasks: [{ cmd: 'nop' }]
    });

    planner.addTask({
      cmd: 'detach',
      id: container.id
    }, detachOp);

    planner.addTask(unlinkSubTask, {
      preconditions: unlinkPreconditions,
      effects: containerStatus(container, { running: false })
    });

    planner.addTask(unlinkSubTask, {
      preconditions: containerStatus(container, { running: false }),
      subTasks: [{ cmd: 'nop' }]
    });

    planner.addTask(stopSubTask, {
      preconditions: containerStatus(container, 'started'),
      effects: containerStatus(container, 'added')
    });

    planner.addTask(stopSubTask, {
      preconditions: containerStatus(container, {
        running: false,
        started: false
      }),
      subTasks: [{ cmd: 'nop' }]
    });

    planner.addTask(removeSubTask, {
      preconditions: removePrecondition,
      effects: containerStatus(container, 'detached')
    });

    planner.addTask(removeSubTask, {
      preconditions: containerStatus(container, 'detached'),
      subTasks: [{ cmd: 'nop' }]
    });
  });
}


module.exports = generateDetachTasks;
