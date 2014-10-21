nscale-planner&nbsp;&nbsp;&nbsp;[![Build Status](https://travis-ci.org/nearform/nscale-planner.png)](https://travis-ci.org/nearform/nscale-planner)
=============

Plan your deployments, easily!
This module is not though of being used _alone_, but rather it is a
internal dependency of [nscale](http://github.com/nearform/nscale).

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

machine.containedBy = machine.id

dest.topology.containers[machine.id] = machine

console.log(planner(origin, dest))
//prints
//[{
//   cmd: "add"
// , id: machine.id
// , parent: machine1.id
//}, {
//   cmd: "start"
// , id: machine.id
// , parent: machine1.id
//}, {
//   cmd: "link"
// , id: machine.id
// , parent: machine1.id
//}]

```

See examples/whitesheet.js for an example with an ELB, an AMI and 2
docker instances.

See examples/dirty.js for an example that spin up an AMI with a new
docker instance within an ELB.
docker instances.

For the sake of simplicity, each commands includes the parent id.
This is where the command will be executed most of the time.

### Safe deployment

The default mode of planning is `'quick'`, which means that the
parent is not _unlinked_ before operating. This is quicker than `'safe'`
mode that _unlink_ the parent before operating, i.e. it removes an AMI
instance from the ELB. Usage:

```js
planner(origin, dest, { mode: 'safe' })
```

## License

Artistic License 2.0.

