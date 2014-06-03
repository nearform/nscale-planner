
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

  it("should create a plan that stops an AMI with a Docker and starts two similar one", function() {

    var machine1 = defineMachine(elbDefinition)

      , machine2 = defineMachine(amiDefinition, machine1)

      , machine3 = defineMachine(dockDef, machine2)

      , machine4 = defineMachine(amiDefinition, machine1)

      , machine5 = defineMachine(dockDef, machine4)

      , dest = buildSheet("full setup")

      , origin = buildSheet("dirty sheet")

      , plan

   origin.topology.containers[machine1.id] = machine1
   origin.topology.containers[machine2.id] = machine2
   origin.topology.containers[machine3.id] = machine3

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine4.id] = machine4
   dest.topology.containers[machine5.id] = machine5

   plan = planner(origin, dest)

   expect(plan).to.eql([{
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
   }, {
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
   }])
  })
})
