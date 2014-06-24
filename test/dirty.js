
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

  it("should create a plan that starts a machine, inside another", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , dest = buildSheet("start inside another")

      , plan

      , origin = buildSheet("dirty sheet")


   origin.topology.containers[machine1.id] = machine1

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2

   plan = planner(origin, dest)

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

      , origin = buildSheet("dirty sheet")

   origin.topology.containers[machine1.id] = machine1

   dest.topology.containers[machine2.id] = machine2

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "unlink"
     , id: machine1.id
   }, {
       cmd: "stop"
     , id: machine1.id
   }, {
       cmd: "remove"
     , id: machine1.id
   }, {
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

  it("should create a plan that stops an AMI with a Docker and starts two similar ones", function() {

    var machine1Origin  = defineMachine(elbDefinition)

      , machine1Dest    = _.cloneDeep(machine1Origin)

      , machine2 = defineMachine(amiDefinition, machine1Origin)

      , machine3 = defineMachine(dockDef, machine2)

      , machine4 = defineMachine(amiDefinition, machine1Dest)

      , machine5 = defineMachine(dockDef, machine4)

      , dest = buildSheet("full setup")

      , origin = buildSheet("dirty sheet")

      , plan

   origin.topology.containers[machine1Origin.id] = machine1Origin
   origin.topology.containers[machine2.id] = machine2
   origin.topology.containers[machine3.id] = machine3

   dest.topology.containers[machine1Dest.id] = machine1Dest
   dest.topology.containers[machine4.id] = machine4
   dest.topology.containers[machine5.id] = machine5

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "unlink"
     , id: machine2.id
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
       cmd: "stop"
     , id: machine2.id
   }, {
       cmd: "remove"
     , id: machine2.id
   }, {
       cmd: "add"
     , id: machine4.id
   }, {
       cmd: "start"
     , id: machine4.id
   }, {
       cmd: "add"
     , id: machine5.id
   }, {
       cmd: "start"
     , id: machine5.id
   }, {
       cmd: "link"
     , id: machine5.id
   }, {
       cmd: "link"
     , id: machine4.id
   }])
  })

  it("should create a plan that moves a machine from an host to another", function() {

    var machine1Orig = defineMachine(amiDefinition)

      , machine1Dest = _.cloneDeep(machine1Orig)

      , machine2Orig = defineMachine(amiDefinition)

      , machine2Dest = _.cloneDeep(machine2Orig)

      , machine3Orig = defineMachine(dockDef, machine1Orig)

      , machine3Dest = _.cloneDeep(machine3Orig)

      , dest = buildSheet("start and stop")

      , plan

      , origin = buildSheet("dirty sheet")

   origin.topology.containers[machine1Orig.id] = machine1Orig
   origin.topology.containers[machine2Orig.id] = machine2Orig
   origin.topology.containers[machine3Orig.id] = machine3Orig

   machine3Dest.containedBy = machine2Dest.id
   machine2Dest.contains.push(machine3Dest.id)
   machine1Dest.contains = []

   dest.topology.containers[machine1Dest.id] = machine1Dest
   dest.topology.containers[machine2Dest.id] = machine2Dest
   dest.topology.containers[machine3Dest.id] = machine3Dest

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "unlink"
     , id: machine3Orig.id
   }, {
       cmd: "stop"
     , id: machine3Orig.id
   }, {
       cmd: "remove"
     , id: machine3Orig.id
   }, {
       cmd: "add"
     , id: machine3Orig.id
   }, {
       cmd: "start"
     , id: machine3Orig.id
   }, {
       cmd: "link"
     , id: machine3Orig.id
   }])
  })
})
