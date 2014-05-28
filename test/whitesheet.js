
var planner = require("../")
  , expect  = require("must")
  , uuid    = require("uuid")
  , fixture = require("./fixture")

describe("white sheet planning", function() {

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

  it("should create a plan that starts a machine", function() {

    var machine = defineMachine(amiDefinition)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition ]
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

  it("should create a plan that starts two machines", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(amiDefinition)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition ]
          , "topology": {
                "containers": {}
            }
        }

      , plan

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine1.id
   }, {
       cmd: "start"
     , id: machine1.id
   }, {
       cmd: "link"
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

  it("should create a plan that starts two machines, one contained in the other", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition ]
          , "topology": {
                "containers": {}
            }
        }

      , plan

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine1.id
   }, {
       cmd: "start"
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
   }, {
       cmd: "link"
     , id: machine1.id
   }])
  })

  it("should create a plan that starts three machines, two docker and one ami", function() {

    var machine1 = defineMachine(amiDefinition)

      , machine2 = defineMachine(dockDef, machine1)

      , machine3 = defineMachine(dockDef, machine1)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition ]
          , "topology": {
                "containers": {}
            }
        }

      , plan

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2
   dest.topology.containers[machine3.id] = machine3

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine1.id
   }, {
       cmd: "start"
     , id: machine1.id
   }, {
       cmd: "add"
     , id: machine3.id
   }, {
       cmd: "start"
     , id: machine3.id
   }, {
       cmd: "link"
     , id: machine3.id
   }, {
       cmd: "add"
     , id: machine2.id
   }, {
       cmd: "start"
     , id: machine2.id
   }, {
       cmd: "link"
     , id: machine2.id
   }, {
       cmd: "link"
     , id: machine1.id
   }])
  })

  it("should create a plan that starts three machines, all contained in one another", function() {

    var machine1 = defineMachine(elbDefinition)

      , machine2 = defineMachine(amiDefinition, machine1)

      , machine3 = defineMachine(dockDef, machine2)

      , dest = {
            "name": "single instance"
          , "namespace": "single instance"
          , "id": uuid.v1()
          , "containerdefinitions": [ amiDefinition, dockDef, elbDefinition ]
          , "topology": {
                "containers": {}
            }
        }

      , plan

   dest.topology.containers[machine1.id] = machine1
   dest.topology.containers[machine2.id] = machine2
   dest.topology.containers[machine3.id] = machine3

   plan = planner(origin, dest)

   expect(plan).to.eql([{
       cmd: "add"
     , id: machine1.id
   }, {
       cmd: "start"
     , id: machine1.id
   }, {
       cmd: "add"
     , id: machine2.id
   }, {
       cmd: "start"
     , id: machine2.id
   }, {
       cmd: "add"
     , id: machine3.id
   }, {
       cmd: "start"
     , id: machine3.id
   }, {
       cmd: "link"
     , id: machine3.id
   }, {
       cmd: "link"
     , id: machine2.id
   }, {
       cmd: "link"
     , id: machine1.id
   }])
  })
})
