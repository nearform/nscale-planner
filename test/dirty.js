
var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")
  , _       = require("lodash")
  , fixture = require("./fixture")

describe("dirty sheet planning", function() {

  var instance

    , elbDefinition = fixture.elbDefinition
    , amiDefinition = fixture.amiDefinition
    , dockDef       = fixture.dockerDefinition
    , defineMachine = fixture.defineMachine
    , buildSheet    = fixture.buildSheet

    , origin = buildSheet("dirty sheet")

  it("should create a plan that starts a machine, inside another", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , dest = buildSheet("start inside another")

      , plan

      , currOrig = _.cloneDeep(origin)


   currOrig.topology.containers[machine1.id] = machine1

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2

   plan = planner(currOrig, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine2.id
   }, {
       cmd: "start"
     , id: machine2.id
   }, {
       cmd: "link"
     , id: machine2.id
   }])
  })

  it("should create a plan that stops and starts a machine", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(amiDefinition)

      , dest = buildSheet("start and stop")

      , plan

      , currOrig = _.cloneDeep(origin)


   currOrig.topology.containers[machine1.id] = machine1

   dest.topology.containers[machine2.id] = machine2

   plan = planner(currOrig, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine2.id
   }, {
       cmd: "start"
     , id: machine2.id
   }, {
       cmd: "link"
     , id: machine2.id
   }, {
       cmd: "unlink"
     , id: machine1.id
   }, {
       cmd: "stop"
     , id: machine1.id
   }, {
       cmd: "remove"
     , id: machine1.id
   }])
  })
})
