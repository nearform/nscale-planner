
// auto generated from test/whiteshet.js
var dest = {
  "name": "single instance",
  "namespace": "single instance",
  "id": "81c5e3a3-e5c3-11e3-92d1-7f23035e9fec",
  "containerdefinitions": [
    {
      "name": "Virtual Machine",
      "type": "aws-ami",
      "id": "81c3e7d1-e5c3-11e3-92d1-7f23035e9fec"
    },
    {
      "name": "doc-srv",
      "type": "docker",
      "id": "81c3e7d2-e5c3-11e3-92d1-7f23035e9fec"
    },
    {
      "name": "Elastic Load Balancer",
      "type": "aws-elb",
      "id": "81c3e7d0-e5c3-11e3-92d1-7f23035e9fec"
    }
  ],
  "topology": {
    "containers": {
      "81c5e3a0-e5c3-11e3-92d1-7f23035e9fec": {
        "id": "81c5e3a0-e5c3-11e3-92d1-7f23035e9fec",
        "containerDefinitionId": "81c3e7d1-e5c3-11e3-92d1-7f23035e9fec",
        "contains": [
          "81c5e3a1-e5c3-11e3-92d1-7f23035e9fec"
        ],
        "specific": {
          "ipaddress": "10.74.143.154"
        }
      },
      "81c5e3a1-e5c3-11e3-92d1-7f23035e9fec": {
        "id": "81c5e3a1-e5c3-11e3-92d1-7f23035e9fec",
        "containerDefinitionId": "81c3e7d1-e5c3-11e3-92d1-7f23035e9fec",
        "containedBy": "81c5e3a0-e5c3-11e3-92d1-7f23035e9fec",
        "contains": [
          "81c5e3a2-e5c3-11e3-92d1-7f23035e9fec"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "81c5e3a2-e5c3-11e3-92d1-7f23035e9fec": {
        "id": "81c5e3a2-e5c3-11e3-92d1-7f23035e9fec",
        "containerDefinitionId": "81c3e7d1-e5c3-11e3-92d1-7f23035e9fec",
        "containedBy": "81c5e3a1-e5c3-11e3-92d1-7f23035e9fec",
        "contains": [],
        "specific": {
          "ipaddress": "10.74.143.151"
        }
      }
    }
  }
}

var orig = {
        "name": "white sheet"
      , "namespace": "white sheet"
      , "id": "81c5e4a5-e5c3-11e3-92d1-7f23035e9fec"
      , "containerDefinitions": []
      , "topology": {
            "containers": {}
        }
    }

  , planner = require('../')
  , plan = planner(orig, dest)

console.log(JSON.stringify(plan, null, 2))
