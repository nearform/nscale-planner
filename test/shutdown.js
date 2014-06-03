
var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")
  , _       = require("lodash")
  , fixture = require("./fixture")

describe("shutdown planning", function() {

  var instance

    , elbDefinition = fixture.elbDefinition
    , amiDefinition = fixture.amiDefinition
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

})
