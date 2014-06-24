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
    var origin  = read(name, "origin")
      , dest    = read(name, "dest")
      , plan    = read(name, "plan")

    expect(planner(origin, dest)).to.eql(plan)
  })
}

describe("integration tests", function() {
  test("oj3")
})
