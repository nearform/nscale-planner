/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var planner = require('../../');
var expect  = require('must');
var fs      = require('fs');
var path    = require('path');
var base    = path.join(__dirname, 'data');

function read(name, type) {
  var toRead = path.join(base, name + '.' + type + '.json');

  return JSON.parse(fs.readFileSync(toRead));
}

function _test(name, opts) {
  var origin    = read(name, 'origin');
  var dest      = read(name, 'dest');
  var expected  = read(name, (opts && opts.mode || '') + 'plan');
  var plan      = planner(origin, dest, opts);

  expect(plan).to.eql(expected);
}

function _title(name, opts) {
  var title = 'must plan correctly for ' + name;

  if (opts && opts.mode) {
    title += ' with ' + opts.mode + ' mode';
  }

  return title;
}

function test(name, opts) {
  it(_title(name, opts), _test.bind(null, name, opts));
}

test.only = function(name, opts) {
  it.only(_title(name, opts), _test.bind(null, name, opts));
};

test.skip = function(name, opts) {
  it.skip(_title(name, opts), _test.bind(null, name, opts));
};

describe('integration tests', function() {
  test('oj3');
  test('oj3', { mode: 'safe' });
  test('dc');
});
