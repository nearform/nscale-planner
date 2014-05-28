
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

    , origin = {
          "name": "white sheet"
        , "namespace": "white sheet"
        , "id": uuid.v1()
        , "containerDefinitions": []
        , "topology": {
              "containers": {}
          }
      }

  it("should create a plan that starts a machine, inside another", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition, dockDef ]
          , "topology": {
                "containers": {}
            }
        }

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

})
