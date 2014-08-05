
var planner = require("../")
  , expect  = require("must")
  , _       = require("lodash")
  , fixture = require("./fixture")

describe("shutdown planning", function() {

  var amiDefinition = fixture.amiDefinition
    , dockDef       = fixture.dockerDefinition
    , defineMachine = fixture.defineMachine
    , buildSheet    = fixture.buildSheet

    , origin = buildSheet("shudown planning")

  it("should create a plan that stops a machine", function() {

    var machine1 = defineMachine(amiDefinition)

      , dest = buildSheet("single instance")

      , plan

      , currOrig = _.cloneDeep(origin)


   currOrig.topology.containers[machine1.id] = machine1

   plan = planner(currOrig, dest)

   expect(plan).to.eql([{
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

  it("should create a plan that stops two machines, one inside another", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , dest = buildSheet("basic container")

      , currOrig = _.cloneDeep(origin)

      , plan

   currOrig.topology.containers[machine1.id] = machine1
   currOrig.topology.containers[machine2.id] = machine2

   plan = planner(currOrig, dest)

   expect(plan).to.eql([{
       cmd: "unlink"
     , id: machine1.id
   }, {
       cmd: "unlink"
     , id: machine2.id
   }, {
       cmd: "stop"
     , id: machine2.id
   }, {
       cmd: "remove"
     , id: machine2.id
   }, {
       cmd: "stop"
     , id: machine1.id
   }, {
       cmd: "remove"
     , id: machine1.id
   }])
  })
})
