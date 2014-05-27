
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
  }, [])
}

function generateCommands(origin, dest) {
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

  _.forIn(dest.topology.containers, function(container) {

    planner.addTask({
        cmd: 'configure'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'detached')
      , subTasks: [{
            cmd: 'add'  // TODO add parent detection
          , id: container.id
        }, {
            cmd: 'start'
          , id: container.id
        }, {
            cmd: 'link'
          , id: container.id
        }]
    })

    planner.addTask({
        cmd: 'add'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'detached')
      , effects: containerStatus(container, 'added')
    })

    planner.addTask({
        cmd: 'start'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'added')
      , effects: containerStatus(container, 'started')
    })

    planner.addTask({
        cmd: 'link'
      , id: container.id
    }, {
        preconditions: containerStatus(container, 'started')
      , effects: containerStatus(container, 'running')
    })
  })

  return planner
}

module.exports = planner
