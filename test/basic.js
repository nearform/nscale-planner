

var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")

describe("white sheet planning", function() {

  var instance

    , amiDefinition = {
          "name": "Virtual Machine"
        , "type": "aws-ami"
        , "id": uuid.v1()
      }

    , origin = {
          "name": "white sheet"
        , "namespace": "white sheet"
        , "id": uuid.v1()
        , "containerDefinitions": []
        , "topology": {
              "containers": {}
          }
      }

  function defineMachine(definition) {
    return {
        "id": uuid.v1()
      , "containerDefinitionId": amiDefinition.id
      , "specific": {
            "ipaddress": "10.74.143.152"
        }
    };
  }

  it("should create a plan that starts a machine", function() {

    var machine = defineMachine(amiDefinition)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amidefinition ]
          , "topology": {
                "containers": {}
            }
        }

      , plan

   dest.topology.containers[machine.id] = machine

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine.id
   }, {
       cmd: "start"
     , id: machine.id
   }, {
       cmd: "link"
     , id: machine.id
   }])
  })
})
