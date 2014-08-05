
var linkFilter    = require('../../lib/linkUnlinkFilter')
  , expect        = require("must")

describe('filter couples of link/unlink and unlink/link', function() {

  it('should remove link/unlink couples', function() {
    var plan = [{
            cmd: 'link'
          , id: '41'
        }, {
            cmd: 'link'
          , id: '42'
        }, {
            cmd: 'unlink'
          , id: '42'
        }]
      , expected = [{
            cmd: 'link'
          , id: '41'
        }]

    expect(linkFilter(plan)).to.eql(expected)
  })

  it('should remove unlink/link couples', function() {
    var plan = [{
            cmd: 'link'
          , id: '41'
        }, {
            cmd: 'unlink'
          , id: '42'
        }, {
            cmd: 'link'
          , id: '42'
        }]
      , expected = [{
            cmd: 'link'
          , id: '41'
        }]

    expect(linkFilter(plan)).to.eql(expected)
  })

  it('should not remove couples with different ids', function() {
    var plan = [{
            cmd: 'link'
          , id: '41'
        }, {
            cmd: 'link'
          , id: '42'
        }, {
            cmd: 'unlink'
          , id: '43'
        }]

    expect(linkFilter(plan)).to.eql(plan)
  })
})
