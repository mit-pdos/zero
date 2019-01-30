// Description
//   Post getfit stats to the chat
//
// Configuration:
//   HUBOT_GETFIT_TEAM - the team name.
//   HUBOT_GETFIT_ROOM - the room to post announcements in.
//
// Commands:
//   hubot getfit stats - announce stats

const CronJob = require('cron').CronJob
const fetch = require('node-fetch')

const SCHEDULE = '0 0 12 * * *'
const TIME_ZONE = 'America/New_York'
const API_URL = 'https://getfit.mit.edu/team-fitness/api/get_challenge_info'

module.exports = (robot) => {

  const config = require('hubot-conf')('getfit', robot)

  robot.respond(/getfit\s+stats/, async (res) => {
    try {
      const msg = await parseStats()
      res.send(msg.join('\n'))
    } catch (err) {
      res.send('Error fetching stats: ' + err)
    }
  })

  new CronJob(SCHEDULE, async () => {
    const room = config('room')
    try {
      const msg = ['*MIT GetFit Stats*', '\n'].concat(await parseStats()).join('\n')
      robot.send({room: room}, msg)
    } catch (err) {
      // ignore
    }
  }, null, true, TIME_ZONE)

  async function parseStats() {
    const response = await fetch(API_URL)
    const data = await response.json()
    const teamName = config('team')
    const allTeams = data.overall_team_ranking
    const team = allTeams.find(team => team.team_name === teamName)
    const allMembers = data.team_progress.team_member_totals
    const members = allMembers.filter(member => member.team_name === teamName)
    members.sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
    const msg = [ `*${teamName}*`
                , ''
                , `*Rank*: ${team.rank}`
                , `*Total*: ${team.team_total} minutes`
                , ''
                ]
    msg.push(...members.map(member => {
      const name = member.user_display_name
      const thisWeek = member.total_challenge_minutes
      const goal = member.challenge_goal
      const total = member.total_minutes
      const rank = member.rank
      return `*${name}*: ${thisWeek}/${goal} this week, ${total} minutes total, rank ${rank}`
    }))
    return msg
  }

}
