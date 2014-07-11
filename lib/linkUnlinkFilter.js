

function linkUnlinkFilter(list) {
  var skipNext  = false

  return list.filter(function(cmd, i, cmds) {

    if (skipNext) {
      skipNext = false
      return false
    }

    if (!cmds[i + 1])
      return true

    if (cmds[i + 1].id !== cmd.id)
      return true

    var unlinkLink = (cmd.cmd === 'unlink' && cmds[i + 1].cmd === 'link')
      , linkUnlink = (cmd.cmd === 'link' && cmds[i + 1].cmd === 'unlink')

    if (linkUnlink || unlinkLink) {
      skipNext = true
      return false
    }

    return true
  })
}

module.exports = linkUnlinkFilter
