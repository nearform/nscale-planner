'use strict';

var allParentsIds = require('../../lib/allParentsIds');
var expect  = require('must');
var fixture = require('../fixture');

describe('allParentsIds helper', function() {
  var elbDefinition = fixture.elbDefinition;
  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;
  var add           = fixture.addToSheet;

  it('should not find any parent on a root machine', function() {
    var machine1    = defineMachine(amiDefinition);
    var sheet       = buildSheet();

    add(sheet, machine1);
    expect(allParentsIds(sheet, machine1)).to.eql([]);
  });

  it('should exclude the root machine', function() {
    var root        = defineMachine(elbDefinition);
    var machine1    = defineMachine(amiDefinition, root);
    var sheet       = buildSheet();

    add(sheet, machine1);
    add(sheet, root);
    expect(allParentsIds(sheet, machine1)).to.eql([]);
  });

  it('should list the instances', function() {
    var root        = defineMachine(elbDefinition);
    var machine1    = defineMachine(amiDefinition, root);
    var machine2    = defineMachine(dockDef, machine1);
    var sheet       = buildSheet();

    add(sheet, root);
    add(sheet, machine1);
    add(sheet, machine2);

    expect(allParentsIds(sheet, machine2)).to.eql([machine1.id]);
  });
});
