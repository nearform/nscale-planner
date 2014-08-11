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

/** @module lib/containerStatus */

var _ = require('lodash');

/**
 * Creates a container status to be used as a precondition
 *
 * Valid values for the status parameters are:
 * - a string, such as 'detached', 'added', 'started', 'running'
 * - an object, such as { added: true, started: true, running: false }
 *
 * @param {object} original - the container
 * @param {object|string} status - the status to set.
 * @param {object} parent - the parent container's id.
 */
function containerStatus(original, status, parent) {

  var state = {
    topology: {
      containers: {}
    }
  };

  var container = {
    id: original.id
  };

  if (parent === null) {
    // nothing to do
  } else if (parent !== undefined) {
    container.containedBy = parent;
  } else {
    container.containedBy = original.containedBy;
  }

  if (typeof status === 'string') {

    switch(status) {
      case 'detached':
        container.added   = false;
        container.started = false;
        container.running = false;
        break;
      case 'added':
        container.added   = true;
        break;
      case 'started':
        container.started = true;
        break;
      case 'running':
        container.running = true;
        break;

      default:
        throw new Error('unknown state');
    }

  } else {
    _.forIn(status, function(value, key) {
      container[key] = value;
    });
  }

  if (container.added === false) {
    delete container.containedBy;
  }

  state.topology.containers[container.id] = container;

  return state;
}

module.exports = containerStatus;
