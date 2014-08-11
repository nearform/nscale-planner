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

/** @module lib/generateCommands */

var _ = require('lodash');

/**
 * Generate the configure and detach commands for all root elements.
 *
 * @param {object} origin - The origin system definition
 * @param {object} dest - The destination system definition
 */
function generateCommands(origin, dest) {
  var destCmds = _.chain(dest.topology.containers)
    .values()
    .filter(function(container) {
      return container.containedBy === container.id || !container.containedBy;
    })
    .map(function(container) {
      return {
        cmd: 'configure',
        id: container.id
      };
    })
    .value();

  var originCmds = _.chain(origin.topology.containers)
    .values()
    .map(function(container) {
      if (!dest.topology.containers[container.id]) {
        return {
          cmd: 'detach',
          id: container.id
        };
      }

      return null;
    }).filter(function(container) {
      return container !== null;
    })
    .value();

  return destCmds.concat(originCmds);
}

module.exports = generateCommands;
