// Description
//   Debug utilities.

module.exports = (robot) => {

  robot.respond(/room\s+name/, (res) => {
    res.send(`Room name: \`${res.message.room}\``)
  })

}
