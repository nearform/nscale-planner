
'use strict';

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
