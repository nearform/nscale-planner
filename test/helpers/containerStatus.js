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

var containerStatus = require('../../lib/containerStatus');
var expect          = require('must');
var fixture         = require('../fixture');
var _               = require('lodash');

describe('containerStatus helper', function() {

  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;

  describe('with an object', function() {

    [{
      running: true
    }, {
      started: false
    }, {
      started: true,
      running: false
    }].forEach(function(state) {

      it('should accept ' + JSON.stringify(state), function() {
        var mac1      = defineMachine(dockDef);
        var result    = containerStatus(mac1, _.cloneDeep(state));
        var expected  = {
          topology: {
            containers: {}
          }
        };

        expected.topology.containers[mac1.id] = state;
        expected.topology.containers[mac1.id].id = mac1.id;
        state.containedBy = mac1.containedBy;

        expect(result).to.eql(expected);
      });
    });
  });

  describe('with a string', function() {
    function buildTest(state, identifier) {
      it('should support the ' + identifier + ' state', function() {
        var mac1      = defineMachine(dockDef);
        var expected  = {
          topology: {
            containers: {
            }
          }
        };
        var result    = containerStatus(mac1, identifier);

        expected.topology.containers[mac1.id] = state;
        expected.topology.containers[mac1.id].id = mac1.id;

        if (state.added !== false) {
          state.containedBy = mac1.containedBy;
        }

        expect(result).to.eql(expected);
      });
    }

    _.forIn({
      detached: {
        added: false,
        started: false,
        running: false
      },
      added: {
        added: true
      },
      started: {
        started: true
      },
      running: {
        running: true
      }
    }, buildTest);
  });
});
