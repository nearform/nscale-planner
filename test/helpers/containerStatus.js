
var containerStatus = require('../../lib/containerStatus')
  , expect          = require("must")
  , fixture         = require("../fixture")
  , _               = require('lodash')

describe('containerStatus helper', function() {

  var dockDef       = fixture.dockerDefinition
    , defineMachine = fixture.defineMachine

  describe('with an object', function() {

    [{
        running: true
    }, {
        started: false
    }, {
        started: true
      , running: false
    }].forEach(function(state) {

      it('should accept ' + JSON.stringify(state), function() {
        var mac1      = defineMachine(dockDef)
          , expected  = {
              topology: {
                  containers: {
                  }
              }
            }
          , result    = containerStatus(mac1, _.cloneDeep(state))

        expected.topology.containers[mac1.id] = state
        expected.topology.containers[mac1.id].id = mac1.id

        expect(result).to.eql(expected)
      })
    })
  })

  describe('with a string', function() {

    _.forIn({
        detached: {
            added: false
          , started: false
          , running: false
        }
      , added: {
            added: true
        }
      , started: {
            started: true
        }
      , running: {
            running: true
        }
      },

      function(state, identifier) {
        it('should support the ' + identifier + ' state', function() {
          var mac1      = defineMachine(dockDef)
            , expected  = {
                topology: {
                    containers: {
                    }
                }
              }
            , result    = containerStatus(mac1, identifier)

          expected.topology.containers[mac1.id] = state
          expected.topology.containers[mac1.id].id = mac1.id

          expect(result).to.eql(expected)
        })
      })
  })
})
