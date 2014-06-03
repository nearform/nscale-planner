
// auto generated from test/dirty.js
var origin = {
  "name": "dirty sheet",
  "namespace": "dirty sheet",
  "id": "e14f1db6-eb26-11e3-b86a-ef8012ae58c1",
  "containerDefinitions": [
    {
      "name": "Virtual Machine",
      "type": "aws-ami",
      "id": "e14be961-eb26-11e3-b86a-ef8012ae58c1"
    },
    {
      "name": "Elastic Load Balancer",
      "type": "aws-elb",
      "id": "e14be960-eb26-11e3-b86a-ef8012ae58c1"
    },
    {
      "name": "doc-srv",
      "type": "docker",
      "id": "e14be962-eb26-11e3-b86a-ef8012ae58c1"
    }
  ],
  "topology": {
    "containers": {
      "e14f1db0-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db0-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [
          "e14f1db1-eb26-11e3-b86a-ef8012ae58c1"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "e14f1db1-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db1-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "containedBy": "e14f1db0-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [
          "e14f1db2-eb26-11e3-b86a-ef8012ae58c1"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "e14f1db2-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db2-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "containedBy": "e14f1db1-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      }
    }
  }
}

var dest = {
  "name": "full setup",
  "namespace": "full setup",
  "id": "e14f1db5-eb26-11e3-b86a-ef8012ae58c1",
  "containerDefinitions": [
    {
      "name": "Virtual Machine",
      "type": "aws-ami",
      "id": "e14be961-eb26-11e3-b86a-ef8012ae58c1"
    },
    {
      "name": "Elastic Load Balancer",
      "type": "aws-elb",
      "id": "e14be960-eb26-11e3-b86a-ef8012ae58c1"
    },
    {
      "name": "doc-srv",
      "type": "docker",
      "id": "e14be962-eb26-11e3-b86a-ef8012ae58c1"
    }
  ],
  "topology": {
    "containers": {
      "e14f1db0-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db0-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [
          "e14f1db3-eb26-11e3-b86a-ef8012ae58c1"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "e14f1db3-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db3-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "containedBy": "e14f1db0-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [
          "e14f1db4-eb26-11e3-b86a-ef8012ae58c1"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "e14f1db4-eb26-11e3-b86a-ef8012ae58c1": {
        "id": "e14f1db4-eb26-11e3-b86a-ef8012ae58c1",
        "containerDefinitionId": "e14be961-eb26-11e3-b86a-ef8012ae58c1",
        "containedBy": "e14f1db3-eb26-11e3-b86a-ef8012ae58c1",
        "contains": [],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      }
    }
  }
}

var planner = require('../')
  , plan = planner(origin, dest)

console.log(JSON.stringify(plan, null, 2))
