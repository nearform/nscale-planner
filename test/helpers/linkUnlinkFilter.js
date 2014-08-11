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

var linkFilter  = require('../../lib/linkUnlinkFilter');
var expect      = require('must');

describe('filter couples of link/unlink and unlink/link', function() {

  it('should remove link/unlink couples', function() {
    var plan = [{
      cmd: 'link',
      id: '41'
    }, {
      cmd: 'link',
      id: '42'
    }, {
      cmd: 'unlink',
      id: '42'
    }];

    var expected = [{
      cmd: 'link',
      id: '41'
    }];

    expect(linkFilter(plan)).to.eql(expected);
  });

  it('should remove unlink/link couples', function() {
    var plan = [{
      cmd: 'link',
      id: '41'
    }, {
      cmd: 'unlink',
      id: '42'
    }, {
      cmd: 'link',
      id: '42'
    }];

    var expected = [{
      cmd: 'link',
      id: '41'
    }];

    expect(linkFilter(plan)).to.eql(expected);
  });

  it('should not remove couples with different ids', function() {
    var plan = [{
      cmd: 'link',
      id: '41'
    }, {
      cmd: 'link',
      id: '42'
    }, {
      cmd: 'unlink',
      id: '43'
    }];

    expect(linkFilter(plan)).to.eql(plan);
  });
});
