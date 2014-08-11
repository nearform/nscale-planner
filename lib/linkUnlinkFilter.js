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

/** @module lib/linkUnlinkFilter */

/**
 * Removes consequent link/unlink (or unlink/link) commands with the same id
 *
 * @param {array} list - the list of commands
 */
function linkUnlinkFilter(list) {
  var skipNext;
  var needsFiltering = true;

  function doFilter(cmd, i, cmds) {
    if (skipNext) {
      skipNext = false;
      return false;
    }

    if (!cmds[i + 1]) {
      return true;
    }

    if (cmds[i + 1].id !== cmd.id) {
      return true;
    }

    var unlinkLink = (cmd.cmd === 'unlink' && cmds[i + 1].cmd === 'link');
    var linkUnlink = (cmd.cmd === 'link' && cmds[i + 1].cmd === 'unlink');

    if (linkUnlink || unlinkLink) {
      needsFiltering = true;
      skipNext = true;
      return false;
    }

    return true;
  }

  while (needsFiltering) {
    needsFiltering = false;
    skipNext = false;

    list = list.filter(doFilter);
  }

  return list;
}

module.exports = linkUnlinkFilter;
