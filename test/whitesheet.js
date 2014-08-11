
'use strict';

var planner = require('../');
var expect  = require('must');
var fixture = require('./fixture');

describe('white sheet planning', function() {

  var elbDefinition = fixture.elbDefinition;
  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;
  var origin        = buildSheet('white sheet');

  it('should create a plan that starts a machine', function() {

    var machine = defineMachine(amiDefinition);
    var dest    = buildSheet('single instance');
    var plan;

    dest.topology.containers[machine.id] = machine;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine.id,
      parent: machine.id
    }, {
      cmd: 'start',
      id: machine.id,
      parent: machine.id
    }, {
      cmd: 'link',
      id: machine.id,
      parent: machine.id
    }]);
  });

  it('should create a plan that starts two machines', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(amiDefinition);
    var dest      = buildSheet('two instances');
    var plan;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2.id] = machine2;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'link',
      id: machine1.id,
      parent: machine1.id
    }, {
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
    }]);
  });

  it('should create a plan that starts two machines, one contained in the other', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(dockDef, machine1);
    var dest      = buildSheet('basic container');
    var plan;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2.id] = machine2;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine1.id,
      parent: machine1.id
    }, {
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
    }, {
      cmd: 'link',
      id: machine1.id,
      parent: machine1.id
    }]);
  });

  it('should create a plan that starts three machines, two docker and one ami', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(dockDef, machine1);
    var machine3  = defineMachine(dockDef, machine1);
    var dest      = buildSheet('two dockers');
    var plan;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2.id] = machine2;
    dest.topology.containers[machine3.id] = machine3;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine1.id,
      parent: machine1.id
    }, {
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
    }, {
      cmd: 'add',
      id: machine3.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine3.id,
      parent: machine1.id
    }, {
      cmd: 'link',
      id: machine3.id,
      parent: machine1.id
    }, {
      cmd: 'link',
      id: machine1.id,
      parent: machine1.id
    }]);
  });

  it('should create a plan that starts three machines, all contained in one another', function() {

    var machine1  = defineMachine(elbDefinition);
    var machine2  = defineMachine(amiDefinition, machine1);
    var machine3  = defineMachine(dockDef, machine2);
    var dest      = buildSheet('full setup');
    var plan;

    dest.topology.containers[machine1.id] = machine1;
    dest.topology.containers[machine2.id] = machine2;
    dest.topology.containers[machine3.id] = machine3;

    plan = planner(origin, dest);

    expect(plan).to.eql([{
      cmd: 'add',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'add',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'start',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'add',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'start',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'link',
      id: machine3.id,
      parent: machine2.id
    }, {
      cmd: 'link',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'link',
      id: machine1.id,
      parent: machine1.id
    }]);
  });
});
