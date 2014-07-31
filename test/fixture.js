
var uuid = require("uuid")

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

  , dockerDefinition = {
        "name": "doc-srv"
      , "type": "docker"
      , "id": uuid.v1()
    }

function defineMachine(definition, containedBy) {
  var id      = uuid.v1()
    , result  = {
      "id": id
    , "containerDefinitionId": amiDefinition.id
    , "containedBy": containedBy && containedBy.id || id
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

function buildSheet(name) {
  return {
      "name": name
    , "namespace": name
    , "id": uuid.v1()
    , "containerDefinitions": [amiDefinition, elbDefinition, dockerDefinition]
    , "topology": {
          "containers": {}
      }
  }
}

function addToSheet(sheet, container) {
  sheet.topology.containers[container.id] = container
}

module.exports.elbDefinition    = elbDefinition
module.exports.amiDefinition    = amiDefinition
module.exports.dockerDefinition = dockerDefinition
module.exports.defineMachine    = defineMachine
module.exports.buildSheet       = buildSheet
module.exports.addToSheet       = addToSheet
