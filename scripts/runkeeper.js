// Description
//   Post runs to the chat!
//
//   To set this up, create a Runkeeper user and set RUNKEEPER_COOKIE to that
//   user's cookie. The cookie can be retrieved by logging in with your web
//   browser as the bot user and seeing what cookie header your browser sends
//   when loading pages.
//
//   To watch new users, add that user as a friend and then use the bot's watch
//   command.
//
//   Because Runkeeper doesn't have an API, this script is based on web
//   scraping. That means that it might unexpectedly break at any point :/
//
// Configuration:
//   HUBOT_RUNKEEPER_ROOM - the room to post in.
//   HUBOT_RUNKEEPER_ERROR_ROOM - the room to report errors in.
//   HUBOT_RUNKEEPER_COOKIE - cookie for bot user.
//
// Commands:
//   hubot runkeeper check "<name>" "<username>" - manually check activities of a user
//   hubot runkeeper watch "<name>" "<username>" - start watching a user
//   hubot runkeeper list - list users being watched
//   hubot runkeeper remove <id> - remove <id> from watch list

const cheerio = require('cheerio')

const POLL_INTERVAL = 5 * 60 * 1000 // in milliseconds
const BASE_URL = 'https://runkeeper.com'

module.exports = (robot) => {

  const config = require('hubot-conf')('runkeeper', robot)

  let posted = {}
  let watching = []
  robot.brain.on('loaded', () => {
    if (robot.brain.data.runkeeper) {
      const rkdata = robot.brain.data.runkeeper
      posted = rkdata.posted
      watching = rkdata.watching
    } else {
      robot.brain.data.runkeeper = {posted, watching}
    }
  })

  const httpGet = (location, followRedirect, callback) => {
    robot.http(BASE_URL + location)
      .header('pragma', 'no-cache')
      .header('cache-control', 'no-cache')
      .header('cookie', config('cookie', ''))
      .get()((err, httpResponse, body) => {
        if (err) {
          callback(err, httpResponse, body)
        } else {
          if (followRedirect && (httpResponse.statusCode === 302)) {
            httpGet(httpResponse.headers.location, false, callback)
          } else {
            callback(err, httpResponse, body)
          }
        }
    })
  }

  const pastTense = (activity) => {
    switch (activity) {
      case 'run': return 'ran'
      case 'walk': return 'walked'
      case 'hike': return 'hiked'
      case 'bike': return 'biked'
      default: return activity
    }
  }

  const checkUser = (name, username, skipCheck, callback) => {
    httpGet(`/user/${username}/activitylist`, true, (err, httpResponse, body) => {
      if (!err && (httpResponse.statusCode === 200)) {
        const $ = cheerio.load(body)

        let identifier = $('.mainContentColumn .userHeader h2')
        if (identifier.length !== 1) {
          callback(null, 'cannot parse body')
          return
        }
        identifier = identifier.text()
        if (!skipCheck) {
          if (posted[username] === identifier) {
            callback(null, 'already posted')
            return
          }
          posted[username] = identifier
        }

        const activity = identifier.split(' ')[6]
        const distance = $('.mainContentColumn .statsBar #totalDistance .value').text()
        const distanceUnits = $('.mainContentColumn .statsBar #totalDistance h5').text()
        const duration = $('.mainContentColumn .statsBar #totalDuration .value').text()
        const pace = $('.mainContentColumn .statsBar #averagePace .value').text()
        const speed = $('.mainContentColumn .statsBar #averageSpeed .value').text()

        let msg
        if (distance) {
          if (pace) {
            msg = `*${name}* ${pastTense(activity)} ${distance}${distanceUnits} in ${duration} (${pace} pace)`
          } else if (speed) {
            msg = `*${name}* ${pastTense(activity)} ${distance}${distanceUnits} in ${duration} (${speed} ${distanceUnits}/h)`
          } else {
            msg = `*${name}* ${pastTense(activity)} ${distance}${distanceUnits} in ${duration}`
          }
        } else {
          msg = `*${name}* ${pastTense(activity)} for ${duration}`
        }
        callback(msg, null)
      } else {
        if (err) {
          callback(null, err)
        } else {
          callback(null, `got http code ${httpResponse.statusCode}`)
        }
      }
    })
  }

  const check = () => {
    const room = config('room')
    const errorRoom = config('error.room')
    watching.forEach((elem, index) => {
      checkUser(elem.name, elem.username, false, (msg, err) => {
        if (msg) {
          robot.send({room}, msg)
        } else {
          if (errorRoom && err !== 'already posted') {
            robot.send({room: errorRoom}, `Error checking Runkeeper username ${elem.username}: ${err}`)
          }
        }
      })
    })
  }

  setInterval(check, POLL_INTERVAL)

  // for debugging purposes
  robot.respond(/runkeeper\s+check\s+"(.*)"\s+"(.*)"/, (res) => {
    const name = res.match[1]
    const username = res.match[2]
    res.send(`Checking user ${name} (${username})...`)
    checkUser(name, username, true, (msg, err) => {
      if (msg) {
        res.send(msg)
      } else {
        res.send(`error: ${err}`)
      }
    })
  })

  robot.respond(/runkeeper\s+watch\s+"(.*)"\s+"(.*)"/, (res) => {
    const name = res.match[1]
    const username = res.match[2]
    watching.push({name, username})
    res.send(`Watching user ${name} (${username})`)
  })

  robot.respond(/runkeeper\s+list/, (res) => {
    const msgs = watching.map((elem, index) => `${index}: ${elem.name} (${elem.username})`)
    res.send(msgs.join('\n'))
  })

  return robot.respond(/runkeeper\s+remove\s+(\d+)/, function(res) {
    const index = parseInt(res.match[1])
    if (!((0 <= index) && (index < watching.length))) {
      res.send(`No person with index ${index}`)
      return
    }
    const removed = watching[index]
    watching.splice(index, 1)
    res.send(`Stopped watching ${removed.name} (${removed.username})`)
  })

}
