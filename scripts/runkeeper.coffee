# Description
#   Post runs to the chat!
#
#   To set this up, create a Runkeeper user and set RUNKEEPER_COOKIE to that
#   user's cookie. The cookie can be retrieved by logging in with your web
#   browser as the bot user and seeing what cookie header your browser sends
#   when loading pages.
#
#   To watch new users, add that user as a friend and then use the bot's watch
#   command.
#
#   Because Runkeeper doesn't have an API, this script is based on web
#   scraping. That means that it might unexpectedly break at any point :/
#
# Configuration:
#   HUBOT_RUNKEEPER_ROOM - the room to post in.
#   HUBOT_RUNKEEPER_COOKIE - cookie for bot user.
#
# Commands:
#   hubot runkeeper check "<name>" "<username>" - manually check activities of a user
#   hubot runkeeper watch "<name>" "<username>" - start watching a user
#   hubot runkeeper list - list users being watched
#   hubot runkeeper remove <id> - remove <id> from watch list

cheerio = require 'cheerio'

POLL_INTERVAL = 5 * 60 * 1000 # in milliseconds
BASE_URL = 'https://runkeeper.com'

module.exports = (robot) ->
  config = require('hubot-conf')('runkeeper', robot)

  posted = {}
  watching = []
  robot.brain.on 'loaded', () ->
    if robot.brain.data.runkeeper
      rkdata = robot.brain.data.runkeeper
      posted = rkdata.posted
      watching = rkdata.watching
    else
      robot.brain.data.runkeeper = {posted: posted, watching: watching}

  httpGet = (location, followRedirect, callback) ->
    robot.http(BASE_URL + location)
      .header('pragma', 'no-cache')
      .header('cache-control', 'no-cache')
      .header('cookie', config('cookie', ''))
      .get() (err, httpResponse, body) ->
        if err
          callback err, httpResponse, body
        else
          if followRedirect and httpResponse.statusCode == 302
            httpGet httpResponse.headers.location, false, callback
          else
            callback err, httpResponse, body

  pastTense = (activity) ->
    switch activity
      when 'run' then 'ran'
      when 'walk' then 'walked'
      when 'hike' then 'hiked'
      when 'bike' then 'biked'
      else activity

  checkUser = (name, username, callback) ->
    httpGet "/user/#{username}/activitylist", true, (err, httpResponse, body) ->
      if not err and httpResponse.statusCode == 200
        $ = cheerio.load(body)

        identifier = $('.mainContentColumn .userHeader h2')
        if identifier.length != 1
          callback null, 'cannot parse body'
          return
        identifier = identifier.text()
        if posted[username] == identifier
          callback null, 'already posted'
          return
        posted[username] = identifier

        activity = identifier.split(' ')[6]
        distance = $('.mainContentColumn .statsBar #totalDistance .value').text()
        distanceUnits = $('.mainContentColumn .statsBar #totalDistance h5').text()
        duration = $('.mainContentColumn .statsBar #totalDuration .value').text()
        pace = $('.mainContentColumn .statsBar #averagePace .value').text()

        msg = "*#{name}* #{pastTense activity} #{distance}#{distanceUnits} in #{duration} (#{pace} pace)"

        callback msg, null
      else
        if err
          callback null, err
        else
          callback null, 'got http code ' + httpResponse.statusCode

  check = () ->
    room = config('room')
    for elem, index in watching
      checkUser elem.name, elem.username, (msg, err) ->
        if msg
          robot.send {room: room}, msg

  setInterval check, POLL_INTERVAL

  # for debugging purposes
  robot.respond /runkeeper\s+check\s+"(.*)"\s+"(.*)"/, (res) ->
    name = res.match[1]
    username = res.match[2]
    res.send "Checking user #{name} (#{username})..."
    checkUser name, username, (msg, err) ->
      if msg
        res.send msg
      else
        res.send 'error: ' + err

  robot.respond /runkeeper\s+watch\s+"(.*)"\s+"(.*)"/, (res) ->
    name = res.match[1]
    username = res.match[2]
    watching.push({name: name, username: username})
    res.send "Watching user #{name} (#{username})"

  robot.respond /runkeeper\s+list/, (res) ->
    msgs = []
    for elem, index in watching
      msgs.push "#{index}: #{elem.name} (#{elem.username})"
    res.send msgs.join '\n'

  robot.respond /runkeeper\s+remove\s+(\d+)/, (res) ->
    index = parseInt(res.match[1])
    if not (0 <= index and index < watching.length)
      res.send "No person with index #{index}"
      return
    removed = watching[index]
    watching.splice index, 1
    res.send "Stopped watching #{removed.name} (#{removed.username})"
