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

var planner = require('../');
var expect  = require('must');
var _       = require('lodash');
var fixture = require('./fixture');

describe('shutdown planning', function() {

  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;
  var origin        = buildSheet('shudown planning');

  it('should create a plan that stops a machine', function() {

    var machine1  = defineMachine(amiDefinition);
    var dest      = buildSheet('single instance');
    var currOrig  = _.cloneDeep(origin);
    var plan;

    currOrig.topology.containers[machine1.id] = machine1;

    plan = planner(currOrig, dest);

    expect(plan).to.eql([{
      cmd: 'unlink',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'stop',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'remove',
      id: machine1.id,
      parent: machine1.id
    }]);
  });

  it('should create a plan that stops two machines, one inside another', function() {

    var machine1  = defineMachine(amiDefinition);
    var machine2  = defineMachine(dockDef, machine1);
    var dest      = buildSheet('basic container');
    var currOrig  = _.cloneDeep(origin);
    var plan;

    currOrig.topology.containers[machine1.id] = machine1;
    currOrig.topology.containers[machine2.id] = machine2;

    plan = planner(currOrig, dest);

    expect(plan).to.eql([{
      cmd: 'unlink',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'unlink',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'stop',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'remove',
      id: machine2.id,
      parent: machine1.id
    }, {
      cmd: 'stop',
      id: machine1.id,
      parent: machine1.id
    }, {
      cmd: 'remove',
      id: machine1.id,
      parent: machine1.id
    }]);
  });
});
