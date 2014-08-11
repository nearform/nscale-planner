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

/** @module lib/allParentsIds */

/**
 * Returns all parents of the passed container, minus the root.
 *
 * @param {object} context - the system definition in which to perform the search
 * @param {object} container - the container to search
 */
function allParentsIds(context, container, parents) {
  var isLeaf = parents === undefined;

  parents = parents || [];

  // doing this before pushing skips the root
  if (!container.containedBy || container.containedBy === container.id) {
    return parents;
  }

  if (!isLeaf) {
    parents.push(container.id);
  }

  // let's order them by tree order
  return allParentsIds(context, context.topology.containers[container.containedBy], parents);
}

module.exports = allParentsIds;
