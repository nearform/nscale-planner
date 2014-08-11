'use strict';

var planner = require('../');
var expect  = require('must');
var _       = require('lodash');
var fixture = require('./fixture');

describe('dirty sheet planning', function() {

  var elbDefinition = fixture.elbDefinition;
  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;

  it('should create a plan that starts a machine, inside another', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(dockDef, machine1);
    var dest      = buildSheet('start inside another');
    var origin    = buildSheet('dirty sheet');
    var plan;

    origin.topology.containers[machine1.id] = machine1;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2.id] = machine2;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'link',
      id: machine2.id,
      parent: machine1.id
    }]);
  });

  it('should create a plan that starts and stops two unrelated machines', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(amiDefinition);
    var dest      = buildSheet('start and stop');
    var origin    = buildSheet('dirty sheet');
    var plan;

    origin.topology.containers[machine1.id] = machine1;

    dest.topology.containers[machine2.id] = machine2;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine2.id,
      parent: machine2.id
    }, {
      cmd: 'start',
      id: machine2.id,
      parent: machine2.id
    }, {
      cmd: 'link',
      id: machine2.id,
      parent: machine2.id
    }, {
      cmd: 'unlink',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'stop',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'remove',
      id: machine1.id,
      parent: machine1.id
    }]);
  });

  it('should create a plan that stops an AMI with a Docker and starts two similar ones', function() {

    var machine1Origin  = defineMachine(elbDefinition);
    var machine1Dest    = _.cloneDeep(machine1Origin);
    var machine2        = defineMachine(amiDefinition, machine1Origin);
    var machine3        = defineMachine(dockDef, machine2);
    var machine4        = defineMachine(amiDefinition, machine1Dest);
    var machine5        = defineMachine(dockDef, machine4);
    var dest            = buildSheet('full setup');
    var origin          = buildSheet('dirty sheet');
    var plan;

    origin.topology.containers[machine1Origin.id] = machine1Origin;
    origin.topology.containers[machine2.id] = machine2;
    origin.topology.containers[machine3.id] = machine3;

    dest.topology.containers[machine1Dest.id] = machine1Dest;
    dest.topology.containers[machine4.id] = machine4;
    dest.topology.containers[machine5.id] = machine5;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'unlink',
      id: machine2.id,
      parent: machine1Origin.id
    }, {
      cmd: 'unlink',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'stop',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'remove',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'stop',
      id: machine2.id,
      parent: machine1Origin.id
    }, {
      cmd: 'remove',
      id: machine2.id,
      parent: machine1Origin.id
    }, {
      cmd: 'add',
      id: machine4.id,
      parent: machine1Origin.id
    }, {
      cmd: 'start',
      id: machine4.id,
      parent: machine1Origin.id
    }, {
      cmd: 'add',
      id: machine5.id,
      parent: machine4.id
    }, {
      cmd: 'start',
      id: machine5.id,
      parent: machine4.id
    }, {
      cmd: 'link',
      id: machine5.id,
      parent: machine4.id
    }, {
      cmd: 'link',
      id: machine4.id,
      parent: machine1Origin.id
    }]);
  });

  it('should create a plan that moves a machine from an host to another', function() {

    var machine1Orig  = defineMachine(amiDefinition);
    var machine1Dest  = _.cloneDeep(machine1Orig);
    var machine2Orig  = defineMachine(amiDefinition);
    var machine2Dest  = _.cloneDeep(machine2Orig);
    var machine3Orig  = defineMachine(dockDef, machine1Orig);
    var machine3Dest  = _.cloneDeep(machine3Orig);
    var dest          = buildSheet('start and stop');
    var plan;
    var origin        = buildSheet('dirty sheet');

   origin.topology.containers[machine1Orig.id] = machine1Orig;
   origin.topology.containers[machine2Orig.id] = machine2Orig;
   origin.topology.containers[machine3Orig.id] = machine3Orig;

   machine3Dest.containedBy = machine2Dest.id;
   machine2Dest.contains.push(machine3Dest.id);
   machine1Dest.contains = [];

   dest.topology.containers[machine1Dest.id] = machine1Dest;
   dest.topology.containers[machine2Dest.id] = machine2Dest;
   dest.topology.containers[machine3Dest.id] = machine3Dest;

   plan = planner(origin, dest);

   expect(plan).to.eql([{
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
   }]);
  });

  it('should create a plan that moves a machine from an host to another (reversed)', function() {

    var machine1Orig  = defineMachine(amiDefinition);
    var machine1Dest  = _.cloneDeep(machine1Orig);
    var machine2Orig  = defineMachine(amiDefinition);
    var machine2Dest  = _.cloneDeep(machine2Orig);
    var machine3Orig  = defineMachine(dockDef, machine2Orig);
    var machine3Dest  = _.cloneDeep(machine3Orig);
    var dest          = buildSheet('start and stop');
    var origin        = buildSheet('dirty sheet');
    var plan;

   origin.topology.containers[machine1Orig.id] = machine1Orig;
   origin.topology.containers[machine2Orig.id] = machine2Orig;
   origin.topology.containers[machine3Orig.id] = machine3Orig;

   machine3Dest.containedBy = machine1Dest.id;
   machine1Dest.contains.push(machine3Dest.id);
   machine2Dest.contains = [];

   dest.topology.containers[machine1Dest.id] = machine1Dest;
   dest.topology.containers[machine2Dest.id] = machine2Dest;
   dest.topology.containers[machine3Dest.id] = machine3Dest;

   plan = planner(origin, dest);

   expect(plan).to.eql([{
     cmd: 'unlink',
     id: machine3Orig.id,
     parent: machine2Orig.id
   }, {
     cmd: 'stop',
     id: machine3Orig.id,
     parent: machine2Orig.id
   }, {
     cmd: 'remove',
     id: machine3Orig.id,
     parent: machine2Orig.id
   }, {
     cmd: 'add',
     id: machine3Orig.id,
     parent: machine1Orig.id
   }, {
     cmd: 'start',
     id: machine3Orig.id,
     parent: machine1Orig.id
   }, {
     cmd: 'link',
     id: machine3Orig.id,
     parent: machine1Orig.id
   }]);
  });

  it('should work in a deep-first manner by default', function() {

    var machine1      = defineMachine(elbDefinition);
    var machine2Orig  = defineMachine(amiDefinition, machine1);
    var machine2Dest  = _.cloneDeep(machine2Orig);
    var machine3Orig  = defineMachine(amiDefinition, machine1);
    var machine3Dest  = _.cloneDeep(machine3Orig);
    var machine4      = defineMachine(dockDef, machine2Orig);
    var machine5      = defineMachine(dockDef, machine3Orig);
    var machine6      = defineMachine(dockDef, machine2Dest);
    var machine7      = defineMachine(dockDef, machine3Dest);
    var dest          = buildSheet('full setup');
    var origin        = buildSheet('dirty sheet');

    var plan;

   origin.topology.containers[machine1.id] = machine1;
   origin.topology.containers[machine2Orig.id] = machine2Orig;
   origin.topology.containers[machine3Orig.id] = machine3Orig;
   origin.topology.containers[machine4.id] = machine4;
   origin.topology.containers[machine5.id] = machine5;

   dest.topology.containers[machine1.id] = machine1;
   dest.topology.containers[machine2Dest.id] = machine2Dest;
   dest.topology.containers[machine3Dest.id] = machine3Dest;
   dest.topology.containers[machine6.id] = machine6;
   dest.topology.containers[machine7.id] = machine7;

   plan = planner(origin, dest);

   expect(plan).to.eql([{
     cmd: 'unlink',
     id: machine4.id,
     parent: machine2Orig.id
   }, {
     cmd: 'stop',
     id: machine4.id,
     parent: machine2Orig.id
   }, {
     cmd: 'remove',
     id: machine4.id,
     parent: machine2Orig.id
   }, {
     cmd: 'add',
     id: machine6.id,
     parent: machine2Orig.id
   }, {
     cmd: 'start',
     id: machine6.id,
     parent: machine2Orig.id
   }, {
     cmd: 'link',
     id: machine6.id,
     parent: machine2Orig.id
   }, {
     cmd: 'unlink',
     id: machine5.id,
     parent: machine3Orig.id
   }, {
     cmd: 'stop',
     id: machine5.id,
     parent: machine3Orig.id
   }, {
     cmd: 'remove',
     id: machine5.id,
     parent: machine3Orig.id
   }, {
     cmd: 'add',
     id: machine7.id,
     parent: machine3Orig.id
   }, {
     cmd: 'start',
     id: machine7.id,
     parent: machine3Orig.id
   }, {
     cmd: 'link',
     id: machine7.id,
     parent: machine3Orig.id
   }]);
  });

  it('should remove and start a container', function() {

    var machine1        = defineMachine(elbDefinition);
    var machine2Origin  = defineMachine(amiDefinition, machine1);
    var machine2Dest    = _.cloneDeep(machine2Origin);
    var machine3        = defineMachine(dockDef, machine2Origin);
    var machine4        = defineMachine(dockDef, machine2Dest);
    var dest            = buildSheet('full setup');
    var origin          = buildSheet('dirty sheet');
    var plan;

    origin.topology.containers[machine1.id] = machine1;
    origin.topology.containers[machine2Origin.id] = machine2Origin;
    origin.topology.containers[machine3.id] = machine3;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2Dest.id] = machine2Dest;
    dest.topology.containers[machine4.id] = machine4;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
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
    }]);
  });
});
