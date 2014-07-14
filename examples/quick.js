
// auto generated from test/safe.js
var origin = {
  "name": "dirty sheet",
  "namespace": "dirty sheet",
  "id": "55d307f5-0b20-11e4-8fd4-bb3e6c674c36",
  "containerDefinitions": [
    {
      "name": "Virtual Machine",
      "type": "aws-ami",
      "id": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36"
    },
    {
      "name": "Elastic Load Balancer",
      "type": "aws-elb",
      "id": "55d21d90-0b20-11e4-8fd4-bb3e6c674c36"
    },
    {
      "name": "doc-srv",
      "type": "docker",
      "id": "55d21d92-0b20-11e4-8fd4-bb3e6c674c36"
    }
  ],
  "topology": {
    "containers": {
      "55d307f0-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f0-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "contains": [
          "55d307f1-0b20-11e4-8fd4-bb3e6c674c36"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "55d307f1-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f1-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "containedBy": "55d307f0-0b20-11e4-8fd4-bb3e6c674c36",
        "contains": [
          "55d307f2-0b20-11e4-8fd4-bb3e6c674c36"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "55d307f2-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f2-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "containedBy": "55d307f1-0b20-11e4-8fd4-bb3e6c674c36",
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
  "id": "55d307f4-0b20-11e4-8fd4-bb3e6c674c36",
  "containerDefinitions": [
    {
      "name": "Virtual Machine",
      "type": "aws-ami",
      "id": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36"
    },
    {
      "name": "Elastic Load Balancer",
      "type": "aws-elb",
      "id": "55d21d90-0b20-11e4-8fd4-bb3e6c674c36"
    },
    {
      "name": "doc-srv",
      "type": "docker",
      "id": "55d21d92-0b20-11e4-8fd4-bb3e6c674c36"
    }
  ],
  "topology": {
    "containers": {
      "55d307f0-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f0-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "contains": [
          "55d307f1-0b20-11e4-8fd4-bb3e6c674c36"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "55d307f1-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f1-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "containedBy": "55d307f0-0b20-11e4-8fd4-bb3e6c674c36",
        "contains": [
          "55d307f3-0b20-11e4-8fd4-bb3e6c674c36"
        ],
        "specific": {
          "ipaddress": "10.74.143.152"
        }
      },
      "55d307f3-0b20-11e4-8fd4-bb3e6c674c36": {
        "id": "55d307f3-0b20-11e4-8fd4-bb3e6c674c36",
        "containerDefinitionId": "55d21d91-0b20-11e4-8fd4-bb3e6c674c36",
        "containedBy": "55d307f1-0b20-11e4-8fd4-bb3e6c674c36",
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
