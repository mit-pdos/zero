# Description:
#   Utilities
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot restart - Restarts the bot.

module.exports = (robot) ->

  robot.respond /restart/i, (res) ->
    setTimeout () ->
      process.exit 0
    , 500 # give process some time to send the message
