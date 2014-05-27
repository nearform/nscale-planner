
var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")
  , _       = require("lodash")

describe("dirty sheet planning", function() {

  var instance

    , elbDefinition = {
          "name": "Elastic Load Balancer"
        , "type": "aws-elb"
        , "id": uuid.v1()
      }

    , amiDefinition = {
          "name": "Virtual Machine"
        , "type": "aws-ami"
        , "id": uuid.v1()
      }

    , dockDef = {
          "name": "doc-srv"
        , "type": "docker"
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

  function defineMachine(definition, containedBy) {
    var result = {
        "id": uuid.v1()
      , "containerDefinitionId": amiDefinition.id
      , "containedBy": (containedBy || {}).id
      , "contains": []
      , "specific": {
            "ipaddress": "10.74.143.152"
        }
    }

    if (containedBy) {
      containedBy.contains.push(result.id)
    }

    return result
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
