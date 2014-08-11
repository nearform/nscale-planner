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

/** @module main */

var TaskPlanner            = require('taskplanner');
var _                      = require('lodash');
var assert                 = require('assert');
var xtend                  = require('xtend');
var linkFilter             = require('./lib/linkUnlinkFilter');
var generateCommands       = require('./lib/generateCommands');
var generateConfigureTasks = require('./lib/generateConfigureTasks');
var generateDetachTasks    = require('./lib/generateDetachTasks');

/**
 * Defaults for the planner() function.
 *
 * See the code code for the actual values
 *
 */
var defaults               = {
  mode: 'quick',
  noLinkUnlinkRemove: false
};

/**
 * Creates a new planner
 *
 * @param {object} origin - The origin system definition
 * @param {object} dest - The destination system definition
 * @param {object} opts - The options
 */
function planner(origin, dest, opts)  {

  var tasks   = new TaskPlanner();
  var cmds    = generateCommands(origin, dest);
  var state   = _.cloneDeep(origin);
  var result;

  opts = xtend(defaults, opts);

  assert(opts.mode === 'quick' || opts.mode === 'safe', 'unknown mode');

  tasks.addTask({ cmd: 'nop' }, {});
  generateDetachTasks(tasks, origin, opts);
  generateDetachTasks(tasks, dest, opts); // needed because of safe mode
  generateConfigureTasks(tasks, origin, dest, opts);

  _.forIn(state.topology.containers, function(container) {
    container.running = true;
    container.started = true;
    container.added = true;
  });

  _.forIn(dest.topology.containers, function(container) {
    var containers = state.topology.containers;

    if (!containers[container.id]) {
      containers[container.id] = {
        id: container.id,
        containedBy: container.containedBy,
        running: false,
        started: false,
        added: false
      };
    }
  });

  result = cmds.reduce(function(acc, cmd) {
    var plan = tasks.plan(state, cmd);
    if (!plan) {
      throw new Error('unable to generate ' + cmd.cmd + ' for id ' + cmd.id);
    }
    return acc.concat(plan);
  }, []).filter(function(cmd) {
    return cmd && cmd.cmd !== 'nop';
  });

  if (!opts.noLinkUnlinkRemove) {
    result = linkFilter(result);
  }

  return result;
}

module.exports = planner;
