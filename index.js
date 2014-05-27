
var TaskPlanner = require('taskplanner')
  , _           = require('lodash')

function planner(origin, dest)  {

  var tasks   = generateTasks(dest)

    , cmds    = generateCommands(origin, dest)

    , state   = _.cloneDeep(origin)

  _.forIn(dest.topology.containers, function(container) {
    var containers = state.topology.containers

    if (!containers[container.id]) {
      containers[container.id] = {
          id: container.id
        , status: 'detached'
      }
    } else {
      containers[container.id].status = 'running'
    }
  })

  return cmds.reduce(function(acc, cmd) {
    return acc.concat(tasks.plan(state, cmd))
  }, []).filter(function(cmd) {
    return cmd.cmd !== 'nop'
  })
}

function generateCommands(origin, dest) {
  // TODO add stopping/removing instances
  return _.chain(dest.topology.containers)
    .values()
    .map(function(container) {
      return {
          cmd: 'configure'
        , id: container.id
      }
    })
    .value()
}

function containerStatus(original, status) {
  var state = {
          topology: {
              containers: {}
          }
      }

    , container = {
          id: original.id
        , status: status
      }

  state.topology.containers[container.id] = container

  return state
}

function generateTasks(dest) {

  var planner = new TaskPlanner()

  planner.addTask({ cmd: 'nop' }, {})

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

    if (container.contained) {
      configureOp.subTasks[0].parent = container.contained
      addPreconditions = _.merge(addPreconditions, containerStatus(container.contained, 'running'))
      configureOp.subTasks.unshift({
          cmd: 'configure'
        , id: container.contained
      })
    }

    container.contains.forEach(function(contained) {
      linkPreconditions = _.merge(linkPreconditions, containerStatus({ id: contained }, 'running'))
      configureOp.subTasks.splice(2, 0, {
          cmd: 'configure'
        , id: contained
      })
    })

    planner.addTask({
        cmd: 'configure'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'running')
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

  return planner
}

module.exports = planner
