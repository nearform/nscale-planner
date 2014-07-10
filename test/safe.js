
var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")
  , _       = require("lodash")
  , fixture = require("./fixture")

describe("dirty sheet planning with safe mode", function() {

  var instance

    , elbDefinition = fixture.elbDefinition
    , amiDefinition = fixture.amiDefinition
    , dockDef       = fixture.dockerDefinition
    , defineMachine = fixture.defineMachine
    , buildSheet    = fixture.buildSheet

  it("should create a plan that unlinks and re-links the AWS instances to the ELB", function() {

    var machine1 = defineMachine(elbDefinition)

      , machine2Origin = defineMachine(amiDefinition, machine1)

      , machine2Dest    = _.cloneDeep(machine2Origin)

      , machine3 = defineMachine(dockDef, machine2Origin)

      , machine4 = defineMachine(dockDef, machine2Dest)

      , dest = buildSheet("full setup")

      , origin = buildSheet("dirty sheet")

      , plan

   origin.topology.containers[machine1.id] = machine1
   origin.topology.containers[machine2Origin.id] = machine2Origin
   origin.topology.containers[machine3.id] = machine3

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2Dest.id] = machine2Dest
   dest.topology.containers[machine4.id] = machine4

   plan = planner(origin, dest, { mode: 'safe', noLinkUnlinkRemove: true })

   expected = [{
       cmd: "unlink"
     , id: machine2Origin.id
   }, {
       cmd: "unlink"
     , id: machine3.id
   }, {
       cmd: "stop"
     , id: machine3.id
   }, {
       cmd: "remove"
     , id: machine3.id
   }, {
       cmd: "add"
     , id: machine4.id
   }, {
       cmd: "start"
     , id: machine4.id
   }, {
       cmd: "link"
     , id: machine4.id
   }, {
       cmd: "link"
     , id: machine2Dest.id
   }]

   expect(plan).to.eql(expected)
  })

  it("should create a plan that moves a machine from an host to another, unlinking first", function() {

    var machine0     = defineMachine(elbDefinition)

      , machine1Orig = defineMachine(amiDefinition, machine0)

      , machine1Dest = _.cloneDeep(machine1Orig)

      , machine2Orig = defineMachine(amiDefinition, machine0)

      , machine2Dest = _.cloneDeep(machine2Orig)

      , machine3Orig = defineMachine(dockDef, machine1Orig)

      , machine3Dest = _.cloneDeep(machine3Orig)

      , dest = buildSheet("start and stop")

      , origin = buildSheet("dirty sheet")

      , plan

      , expected

   origin.topology.containers[machine0.id] = machine0
   origin.topology.containers[machine1Orig.id] = machine1Orig
   origin.topology.containers[machine2Orig.id] = machine2Orig
   origin.topology.containers[machine3Orig.id] = machine3Orig

   machine3Dest.containedBy = machine2Dest.id
   machine2Dest.contains.push(machine3Dest.id)
   machine1Dest.contains = []

   dest.topology.containers[machine0.id] = machine0
   dest.topology.containers[machine1Dest.id] = machine1Dest
   dest.topology.containers[machine2Dest.id] = machine2Dest
   dest.topology.containers[machine3Dest.id] = machine3Dest

   plan = planner(origin, dest, { mode: "safe" })

   expected = [{
       cmd: "unlink"
     , id: machine1Orig.id
   }, {
       cmd: "unlink"
     , id: machine3Orig.id
   }, {
       cmd: "stop"
     , id: machine3Orig.id
   }, {
       cmd: "remove"
     , id: machine3Orig.id
   }, {
       cmd: "link"
     , id: machine1Orig.id
   }, {
       cmd: "unlink"
     , id: machine2Dest.id
   }, {
       cmd: "add"
     , id: machine3Orig.id
   }, {
       cmd: "start"
     , id: machine3Orig.id
   }, {
       cmd: "link"
     , id: machine3Orig.id
   }, {
       cmd: "link"
     , id: machine2Dest.id
   }]

   expect(plan).to.eql(expected)
  })
})
