
'use strict';

var planner = require('../');
var expect  = require('must');
var _       = require('lodash');
var fixture = require('./fixture');

describe('shutdown planning', function() {

  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;
  var origin        = buildSheet('shudown planning');

  it('should create a plan that stops a machine', function() {

    var machine1  = defineMachine(amiDefinition);
    var dest      = buildSheet('single instance');
    var currOrig  = _.cloneDeep(origin);
    var plan;

    currOrig.topology.containers[machine1.id] = machine1;

    plan = planner(currOrig, dest);

    expect(plan).to.eql([{
      cmd: 'unlink',
      id: machine1.id
    }, {
      cmd: 'stop',
      id: machine1.id
    }, {
      cmd: 'remove',
      id: machine1.id
    }]);
  });

  it('should create a plan that stops two machines, one inside another', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(dockDef, machine1);
    var dest      = buildSheet('basic container');
    var currOrig  = _.cloneDeep(origin);
    var plan;

    currOrig.topology.containers[machine1.id] = machine1;
    currOrig.topology.containers[machine2.id] = machine2;

    plan = planner(currOrig, dest);

    expect(plan).to.eql([{
      cmd: 'unlink',
      id: machine1.id
    }, {
      cmd: 'unlink',
      id: machine2.id
    }, {
      cmd: 'stop',
      id: machine2.id
    }, {
      cmd: 'remove',
      id: machine2.id
    }, {
      cmd: 'stop',
      id: machine1.id
    }, {
      cmd: 'remove',
      id: machine1.id
    }]);
  });
});
