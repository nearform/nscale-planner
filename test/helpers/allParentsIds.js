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

var allParentsIds = require('../../lib/allParentsIds');
var expect  = require('must');
var fixture = require('../fixture');

describe('allParentsIds helper', function() {
  var elbDefinition = fixture.elbDefinition;
  var amiDefinition = fixture.amiDefinition;
  var dockDef       = fixture.dockerDefinition;
  var defineMachine = fixture.defineMachine;
  var buildSheet    = fixture.buildSheet;
  var add           = fixture.addToSheet;

  it('should not find any parent on a root machine', function() {
    var machine1    = defineMachine(amiDefinition);
    var sheet       = buildSheet();

    add(sheet, machine1);
    expect(allParentsIds(sheet, machine1)).to.eql([]);
  });

  it('should exclude the root machine', function() {
    var root        = defineMachine(elbDefinition);
    var machine1    = defineMachine(amiDefinition, root);
    var sheet       = buildSheet();

    add(sheet, machine1);
    add(sheet, root);
    expect(allParentsIds(sheet, machine1)).to.eql([]);
  });

  it('should list the instances', function() {
    var root        = defineMachine(elbDefinition);
    var machine1    = defineMachine(amiDefinition, root);
    var machine2    = defineMachine(dockDef, machine1);
    var sheet       = buildSheet();

    add(sheet, root);
    add(sheet, machine1);
    add(sheet, machine2);

    expect(allParentsIds(sheet, machine2)).to.eql([machine1.id]);
  });
});
