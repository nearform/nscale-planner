'use strict';

var TaskPlanner            = require('taskplanner');
var _                      = require('lodash');
var assert                 = require('assert');
var xtend                  = require('xtend');
var linkFilter             = require('./lib/linkUnlinkFilter');
var generateCommands       = require('./lib/generateCommands');
var generateConfigureTasks = require('./lib/generateConfigureTasks');
var generateDetachTasks    = require('./lib/generateDetachTasks');
var defaults               = {
  mode: 'quick',
  noLinkUnlinkRemove: false
};

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
