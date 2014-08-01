var planner = require("../../")
  , expect  = require("must")
  , fs      = require("fs")
  , path    = require("path")
  , base    = path.join(__dirname, "data")

function read(name, type) {
  var toRead = path.join(base, name + "." + type + ".json");

  return JSON.parse(fs.readFileSync(toRead));
}

function _test(name, opts) {
  var origin    = read(name, "origin")
    , dest      = read(name, "dest")
    , expected  = read(name, (opts && opts.mode || "") + "plan")
    , plan      = planner(origin, dest, opts)

  console.log('expected', JSON.stringify(expected, null, 2))
  console.log('actual', JSON.stringify(plan, null, 2))

  expect(plan).to.eql(expected)
}

function _title(name, opts) {
  var title = "must plan correctly for " + name

  if (opts && opts.mode)
    title += " with " + opts.mode + " mode"

  return title
}

function test(name, opts) {
  it(_title(name, opts), _test.bind(null, name, opts))
}

test.only = function(name, opts) {
  it.only(_title(name, opts), _test.bind(null, name, opts))
}

test.skip = function(name, opts) {
  it.skip(_title(name, opts), _test.bind(null, name, opts))
}

describe("integration tests", function() {
  test("oj3")
  test("oj3", { mode: 'safe' })
  test("dc")
})
