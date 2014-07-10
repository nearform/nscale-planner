var planner = require("../../")
  , expect  = require("must")
  , fs      = require("fs")
  , path    = require("path")
  , base    = path.join(__dirname, "data")

function read(name, type) {
  var toRead = path.join(base, name + "." + type + ".json");

  return JSON.parse(fs.readFileSync(toRead));
}

function test(name) {

  it("must plan correctly for " + name, function() {
    var origin    = read(name, "origin")
      , dest      = read(name, "dest")
      , expected  = read(name, "plan")
      , plan      = planner(origin, dest)

    expect(plan).to.eql(expected)
  })
}

describe("integration tests", function() {
  test("oj3")
})
