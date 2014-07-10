
var TaskPlanner = require('taskplanner')
  , _           = require('lodash')
  , assert      = require('assert')
  , xtend       = require('xtend')
  , defaults    = {
      mode: 'quick'
    }

function planner(origin, dest, opts)  {

  var tasks     = new TaskPlanner()

    , cmds      = generateCommands(origin, dest)

    , state     = _.cloneDeep(origin)

    , skipNext  = false

  opts = xtend(defaults, opts);

  assert(opts.mode === 'quick' || opts.mode === 'safe', 'unknown mode')

  tasks.addTask({ cmd: 'nop' }, {})
  generateOriginTasks(tasks, origin, opts)
  generateDestTasks(tasks, origin, dest, opts)

  _.forIn(state.topology.containers, function(container) {
    container.running = true
    container.started = true
    container.added = true
  })

  _.forIn(dest.topology.containers, function(container) {
    var containers = state.topology.containers

    if (!containers[container.id]) {
      containers[container.id] = {
          id: container.id
        , running: false
        , started: false
        , added: false
      }
    }
  })


  return cmds.reduce(function(acc, cmd) {
    var plan = tasks.plan(state, cmd)
    if (!plan) throw new Error('unable to generate ' + cmd.cmd + ' for id ' + cmd.id)
    return acc.concat(plan)
  }, []).filter(function(cmd) {
    return cmd && cmd.cmd !== 'nop'
  }).filter(function(cmd, i, cmds) {

    if (skipNext) {
      skipNext = false
      return false
    }

    if (!cmds[i + 1])
      return true

    if (cmds[i + 1].id !== cmd.id)
      return true

    var unlinkLink = (cmd.cmd === 'unlink' && cmds[i + 1].cmd === 'link')
      , linkUnlink = (cmd.cmd === 'link' && cmds[i + 1].cmd === 'unlink')

    if (linkUnlink || unlinkLink) {
      skipNext = true
      return false
    }

    return true
  });
}

function generateCommands(origin, dest) {
  var destCmds    = _.chain(dest.topology.containers)
                     .values()
                     .filter(function(container) {
                       return container.containedBy === container.id || !container.containedBy
                     })
                     .map(function(container) {
                       return {
                           cmd: 'configure'
                         , id: container.id
                       }
                     })
                     .value()

    , originCmds  = _.chain(origin.topology.containers)
                     .values()
                     .map(function(container) {
                       if (!dest.topology.containers[container.id])
                         return {
                             cmd: 'detach'
                           , id: container.id
                         }

                       return null
                     }).filter(function(container) {
                       return container != null;
                     })
                    .value()

  return destCmds.concat(originCmds)
}

function containerStatus(original, status) {

  var state = {
          topology: {
              containers: {}
          }
      }

    , container = {
          id: original.id
      }

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

  state.topology.containers[container.id] = container

  return state
}

function generateDestTasks(planner, origin, dest, opts) {

  _.forIn(dest.topology.containers, function(container) {

    var addSubTask = {
            cmd: 'add'
          , id: container.id
        }
      , startSubTask = {
            cmd: 'start'
          , id: container.id
        }
      , linkSubTask = {
            cmd: 'link'
          , id: container.id
        }
      , configureOp = {
            preconditions: containerStatus(container, 'detached')
          , subTasks: [addSubTask, startSubTask, linkSubTask]
        }
      , configureNop = {
          preconditions: containerStatus(container, 'started')
        , subTasks: [{ cmd: 'nop' }]
        }
      , addPreconditions = containerStatus(container, 'detached')
      , linkPreconditions = containerStatus(container, 'started')

    // let's detach all 'old' containers
    if (origin.topology.containers[container.id]) {
      var ops = origin.topology.containers[container.id].contains.filter(function(contained) {
        return container.contains.indexOf(contained) === -1
      }).map(function(contained) {
        // the current contained is NOT included in the dest status
        // so we detach it
        return {
            cmd: 'detach'
          , id: contained
        }
      })

      if (ops.length > 0) {

        // we add it only top the nop tasks because it is already there
        configureNop.subTasks = ops
      }

      if (opts.mode === 'safe') {

        ops.unshift({
            cmd: 'unlink'
          , id: container.id
        })

        allParentsIds(dest, container).forEach(function(id) {
          var op = configureOp

          ops.unshift({
              cmd: 'unlink'
            , id: id
          })

          ops.push({
              cmd: 'link'
            , id: id
          })
        });

        ops.push({
            cmd: 'link'
          , id: container.id
        })
      }
    }

    // the children container must be configured before linking
    container.contains.forEach(function(contained) {
      linkPreconditions = _.merge(linkPreconditions, containerStatus({ id: contained }, 'running'))
      // we need ot add those before the link

      configureOp.subTasks.splice(configureOp.subTasks.length - 1, 0, {
          cmd: 'configure'
        , id: contained
      })

      configureNop.subTasks.push({
          cmd: 'configure'
        , id: contained
      })
    })

    if (opts.mode === 'safe') {
      // we should unlink the parent before doing anything
      // and link back after
      allParentsIds(dest, container).forEach(function(id) {

        var op = configureOp

        op.subTasks.unshift({
            cmd: 'unlink'
          , id: id
        })

        op.subTasks.push({
            cmd: 'link'
          , id: id
        })
      });
    }

    // if a container is already running, there is nothing to do
    planner.addTask({
        cmd: 'configure'
      , id: container.id
    }, configureNop)

    // real configure task
    planner.addTask({
        cmd: 'configure'
      , id: container.id
    }, configureOp)

    planner.addTask(addSubTask, {
        preconditions: addPreconditions
      , effects: containerStatus(container, 'added')
    })

    planner.addTask(startSubTask, {
        preconditions: containerStatus(container, 'added')
      , effects: containerStatus(container, 'started')
    })

    planner.addTask(linkSubTask, {
        preconditions: linkPreconditions
      , effects: containerStatus(container, 'running')
    })

    planner.addTask(linkSubTask, {
        preconditions: containerStatus(container, 'running')
    })
  })
}

function generateOriginTasks(planner, origin, opts) {

  _.forIn(origin.topology.containers, function(container) {

    var stopSubTask = {
            cmd: 'stop'
          , id: container.id
        }
      , removeSubTask = {
            cmd: 'remove'
          , id: container.id
        }
      , unlinkSubTask = {
            cmd: 'unlink'
          , id: container.id
        }
      , detachOp = {
            preconditions: containerStatus(container, 'running')
          , subTasks: [unlinkSubTask, stopSubTask, removeSubTask]
        }
      , unlinkPreconditions = containerStatus(container, 'running')
      , stopPrecondition = containerStatus(container, 'started')
      , removePrecondition = containerStatus(container, 'added')

    container.contains.forEach(function(contained) {
      stopPrecondition = _.merge(stopPrecondition, containerStatus({ id: contained }, 'started'))
      detachOp.subTasks.splice(1, 0, {
          cmd: 'detach'
        , id: contained
      })
    })

    if (opts.mode === 'safe') {
      // TODO we should unlink the parent before doing anything
      // and link back after
    }

    planner.addTask({
        cmd: 'detach'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'detached')
      , subTasks: [{ cmd: 'nop' }]
    })

    planner.addTask({
        cmd: 'detach'
      , id: container.id
    }, detachOp)

    planner.addTask(unlinkSubTask, {
        preconditions: unlinkPreconditions
      , effects: containerStatus(container, 'started')
    })

    planner.addTask(unlinkSubTask, {
        preconditions: containerStatus(container, 'started')
      , subTasks: [{ cmd: 'nop' }]
    })

    planner.addTask(stopSubTask, {
        preconditions: containerStatus(container, 'started')
      , effects: containerStatus(container, 'added')
    })

    planner.addTask(removeSubTask, {
        preconditions: removePrecondition
      , effects: containerStatus(container, 'detached')
    })
  })
}

function allParentsIds(context, container, parents) {
  var isLeaf = parents === undefined

  parents = parents || []

  // doing this before pushing skips the root
  if (!container.containedBy)
    return parents

  if (!isLeaf)
    parents.push(container.id);

  // let's order them by tree order
  return allParentsIds(context, context.topology.containers[container.containedBy], parents);
}

module.exports = planner
