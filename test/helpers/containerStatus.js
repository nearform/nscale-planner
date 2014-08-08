'use strict';

var containerStatus = require('../../lib/containerStatus');
var expect          = require('must');
var fixture         = require('../fixture');
var _               = require('lodash');

describe('containerStatus helper', function() {

  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;

  describe('with an object', function() {

    [{
      running: true
    }, {
      started: false
    }, {
      started: true,
      running: false
    }].forEach(function(state) {

      it('should accept ' + JSON.stringify(state), function() {
        var mac1      = defineMachine(dockDef);
        var result    = containerStatus(mac1, _.cloneDeep(state));
        var expected  = {
          topology: {
            containers: {}
          }
        };

        expected.topology.containers[mac1.id] = state;
        expected.topology.containers[mac1.id].id = mac1.id;
        state.containedBy = mac1.containedBy;

        expect(result).to.eql(expected);
      });
    });
  });

  describe('with a string', function() {
    function buildTest(state, identifier) {
      it('should support the ' + identifier + ' state', function() {
        var mac1      = defineMachine(dockDef);
        var expected  = {
          topology: {
            containers: {
            }
          }
        };
        var result    = containerStatus(mac1, identifier);

        expected.topology.containers[mac1.id] = state;
        expected.topology.containers[mac1.id].id = mac1.id;

        if (state.added !== false) {
          state.containedBy = mac1.containedBy;
        }

        expect(result).to.eql(expected);
      });
    }

    _.forIn({
      detached: {
        added: false,
        started: false,
        running: false
      },
      added: {
        added: true
      },
      started: {
        started: true
      },
      running: {
        running: true
      }
    }, buildTest);
  });
});
