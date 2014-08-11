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

var uuid          = require('uuid');

var elbDefinition = {
  name: 'Elastic Load Balancer',
  type: 'aws-elb',
  id: uuid.v1()
};

var amiDefinition = {
  name: 'Virtual Machine',
  type: 'aws-ami',
  id: uuid.v1()
};

var dockerDefinition = {
  name: 'doc-srv',
  type: 'docker',
  id: uuid.v1()
};

function defineMachine(definition, containedBy) {
  var id      = uuid.v1();
  var result  = {
    id: id,
    containerDefinitionId: amiDefinition.id,
    containedBy: containedBy && containedBy.id || id,
    contains: [],
    specific: {
      ipaddress: '10.74.143.152'
    }
  };

  if (containedBy) {
    containedBy.contains.push(result.id);
  }

  return result;
}

function buildSheet(name) {
  name = name || 'sheet';
  return {
    name: name,
    namespace: name,
    id: uuid.v1(),
    containerDefinitions: [amiDefinition, elbDefinition, dockerDefinition],
    topology: {
      containers: {}
    }
  };
}

function addToSheet(sheet, container) {
  sheet.topology.containers[container.id] = container;
}

module.exports.elbDefinition    = elbDefinition;
module.exports.amiDefinition    = amiDefinition;
module.exports.dockerDefinition = dockerDefinition;
module.exports.defineMachine    = defineMachine;
module.exports.buildSheet       = buildSheet;
module.exports.addToSheet       = addToSheet;
