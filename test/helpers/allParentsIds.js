
var allParentsIds = require('../../lib/allParentsIds')
  , expect  = require("must")
  , fixture = require("../fixture")

describe('allParentsIds helper', function() {
  var elbDefinition = fixture.elbDefinition
    , amiDefinition = fixture.amiDefinition
    , dockDef       = fixture.dockerDefinition
    , defineMachine = fixture.defineMachine
    , buildSheet    = fixture.buildSheet
    , add           = fixture.addToSheet

  it('should not find any parent on a root machine', function() {
    var machine1    = defineMachine(amiDefinition)
      , sheet       = buildSheet("start inside another")

    add(sheet, machine1)
    expect(allParentsIds(sheet, machine1)).to.eql([])
  })

  it('should exclude the root machine', function() {
    var root        = defineMachine(elbDefinition)
      , machine1    = defineMachine(amiDefinition, root)
      , sheet       = buildSheet("start inside another")

    add(sheet, machine1)
    add(sheet, root)
    expect(allParentsIds(sheet, machine1)).to.eql([])
  })

  it('should list the instances', function() {
    var root        = defineMachine(elbDefinition)
      , machine1    = defineMachine(amiDefinition, root)
      , machine2    = defineMachine(dockDef, machine1)
      , sheet       = buildSheet("start inside another")

    add(sheet, root)
    add(sheet, machine1)
    add(sheet, machine2)

    expect(allParentsIds(sheet, machine2)).to.eql([machine1.id])
  })
})
