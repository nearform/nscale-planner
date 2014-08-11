'use strict';

var planner = require('../');
var expect  = require('must');
var _       = require('lodash');
var fixture = require('./fixture');

describe('dirty sheet planning with safe mode', function() {

  var elbDefinition = fixture.elbDefinition;
  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;

  it('should create a plan that unlinks and re-links the AWS instances to the ELB', function() {

    var machine1        = defineMachine(elbDefinition);
    var machine2Origin  = defineMachine(amiDefinition, machine1);
    var machine2Dest    = _.cloneDeep(machine2Origin);
    var machine3        = defineMachine(dockDef, machine2Origin);
    var machine4        = defineMachine(dockDef, machine2Dest);
    var dest            = buildSheet('full setup');
    var origin          = buildSheet('dirty sheet');
    var plan;
    var expected;

    origin.topology.containers[machine1.id] = machine1;
    origin.topology.containers[machine2Origin.id] = machine2Origin;
    origin.topology.containers[machine3.id] = machine3;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2Dest.id] = machine2Dest;
    dest.topology.containers[machine4.id] = machine4;

    plan = planner(origin, dest, { mode: 'safe' });

    expected = [{
      cmd: 'unlink',
      id: machine2Origin.id,
      parent: machine1.id
    }, {
      cmd: 'unlink',
      id: machine3.id,
      parent: machine2Origin.id
    }, {
      cmd: 'stop',
      id: machine3.id,
      parent: machine2Origin.id
    }, {
      cmd: 'remove',
      id: machine3.id,
      parent: machine2Origin.id
    }, {
      cmd: 'add',
      id: machine4.id,
      parent: machine2Origin.id
    }, {
      cmd: 'start',
      id: machine4.id,
      parent: machine2Origin.id
    }, {
      cmd: 'link',
      id: machine4.id,
      parent: machine2Origin.id
    }, {
      cmd: 'link',
      id: machine2Dest.id,
      parent: machine1.id
    }];

    expect(plan).to.eql(expected);
  });

  it('should create a plan that moves a machine from an host to another, unlinking first', function() {

    var machine0      = defineMachine(elbDefinition);
    var machine1Orig  = defineMachine(amiDefinition, machine0);
    var machine1Dest  = _.cloneDeep(machine1Orig);
    var machine2Orig  = defineMachine(amiDefinition, machine0);
    var machine2Dest  = _.cloneDeep(machine2Orig);
    var machine3Orig  = defineMachine(dockDef, machine1Orig);
    var machine3Dest  = _.cloneDeep(machine3Orig);
    var dest          = buildSheet('start and stop');
    var origin        = buildSheet('dirty sheet');
    var plan;
    var expected;

    origin.topology.containers[machine0.id] = machine0;
    origin.topology.containers[machine1Orig.id] = machine1Orig;
    origin.topology.containers[machine2Orig.id] = machine2Orig;
    origin.topology.containers[machine3Orig.id] = machine3Orig;

    machine3Dest.containedBy = machine2Dest.id;
    machine2Dest.contains.push(machine3Dest.id);
    machine1Dest.contains = [];

    dest.topology.containers[machine0.id] = machine0;
    dest.topology.containers[machine1Dest.id] = machine1Dest;
    dest.topology.containers[machine2Dest.id] = machine2Dest;
    dest.topology.containers[machine3Dest.id] = machine3Dest;

    plan = planner(origin, dest, { mode: 'safe' });

    expected = [{
      cmd: 'unlink',
      id: machine2Dest.id,
      parent: machine0.id
    }, {
      cmd: 'unlink',
      id: machine1Orig.id,
      parent: machine0.id
    }, {
      cmd: 'unlink',
      id: machine3Orig.id,
      parent: machine1Orig.id
    }, {
      cmd: 'stop',
      id: machine3Orig.id,
      parent: machine1Orig.id
    }, {
      cmd: 'remove',
      id: machine3Orig.id,
      parent: machine1Orig.id
    }, {
      cmd: 'link',
      id: machine1Orig.id,
      parent: machine0.id
    }, {
      cmd: 'add',
      id: machine3Orig.id,
      parent: machine2Orig.id
    }, {
      cmd: 'start',
      id: machine3Orig.id,
      parent: machine2Orig.id
    }, {
      cmd: 'link',
      id: machine3Orig.id,
      parent: machine2Orig.id
    }, {
      cmd: 'link',
      id: machine2Dest.id,
      parent: machine0.id
    }];

    expect(plan).to.eql(expected);
  });
});
