nfd-planner
===========

Plan your deployments, easily!

```js

var  amiDefinition = {
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

  , machine = {
        "id": uuid.v1()
      , "containerDefinitionId": amiDefinition.id
      , "specific": {
            "ipaddress": "10.74.143.152"
        }
    }

  , dest = {
        "name": "single instance"
      , "namespace": "single instance"
      , "id": uuid.v1()
      , "containerdefinitions": [ amidefinition ]
      , "topology": {
            "containers": {}
        }
    }

dest.topology.containers[machine.id] = machine

console.log(planner(origin, dest))
//prints
//[{
//   cmd: "add"
// , id: machine.id
//}, {
//   cmd: "start"
// , id: machine.id
//}, {
//   cmd: "link"
// , id: machine.id
//}]

```

See examples/whitesheet.js for an example with an ELB, an AMI and 2
docker instances.

See examples/dirty.js for an example that spin up an AMI with a new
docker instance within an ELB.
docker instances.

### Safe deployment

The default mode of planning is `'quick'`, which means that the
parent is not _unlinked_ before operating. This is quicker than `'safe'`
mode that _unlink_ the parent before operating, i.e. it removes an AMI
instance from the ELB. Usage:

```js
planner(origin, dest, { mode: 'safe' })
```

