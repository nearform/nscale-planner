
var TaskPlanner = require('taskplanner')
  , _           = require('lodash')
  , assert      = require('assert')

function planner(origin, dest)  {

  var tasks = new TaskPlanner()

    , cmds    = generateCommands(origin, dest)

    , state   = _.cloneDeep(origin)

  tasks.addTask({ cmd: 'nop' }, {})
  generateOriginTasks(tasks, origin)
  generateDestTasks(tasks, dest)

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
  })
}

function generateCommands(origin, dest) {
  var destCmds    = _.chain(dest.topology.containers)
                     .values()
                     .map(function(container) {
                       var origConts = origin.topology.containers

                       if (origConts[container.id] && origConts[container.id].containedBy != container.containedBy) {
                         return [{
                             cmd: 'detach'
                           , id: container.id
                         }, {
                             cmd: 'configure'
                           , id: container.id
                         }]
                       } else {
                         return {
                             cmd: 'configure'
                           , id: container.id
                         }
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

  return originCmds.concat(destCmds)
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

function generateDestTasks(planner, dest) {

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
      , addPreconditions = containerStatus(container, 'detached')
      , linkPreconditions = containerStatus(container, 'started')
      , parent = dest.topology.containers[container.containedBy]

    // the parent must be configured
    if (parent) {
      addPreconditions = _.merge(addPreconditions, containerStatus(parent, 'started'))
      configureOp.subTasks.unshift({
          cmd: 'configure'
        , id: parent.id
      })
    }

    // the children container must be configured before linking
    container.contains.forEach(function(contained) {
      linkPreconditions = _.merge(linkPreconditions, containerStatus({ id: contained }, 'running'))
      // we need ot add those before the link
      configureOp.subTasks.splice(configureOp.subTasks.length - 1, 0, {
          cmd: 'configure'
        , id: contained
      })
    })

    // if a container is already running, there is nothing to do
    planner.addTask({
        cmd: 'configure'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'started')
      , subTasks: [{ cmd: 'nop' }]
    })

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
  })
}

function generateOriginTasks(planner, origin) {

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

    if (container.contained) {
      unlinkPreconditions = _.merge(unlinkPreconditions, containerStatus(container.contained, 'started'))
      detachOp.subTasks.splice(1, 0, {
          cmd: 'detach'
        , id: container.contained
      })
    }

    container.contains.forEach(function(contained) {
      stopPrecondition = _.merge(stopPrecondition, containerStatus({ id: contained }, 'started'))
      detachOp.subTasks.splice(1, 0, {
          cmd: 'detach'
        , id: contained
      })
    })

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

module.exports = planner
