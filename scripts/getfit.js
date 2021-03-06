// Description
//   Post getfit stats to the chat
//
// Configuration:
//   HUBOT_GETFIT_TEAM - the team name.
//   HUBOT_GETFIT_ROOM - the room to post announcements in.
//   HUBOT_GETFIT_COOKIE - cookie for HTTP request
//   HUBOT_GETFIT_ENABLED - 'true' if the bot should announce stats
//
// Commands:
//   hubot getfit stats - announce stats

const CronJob = require('cron').CronJob
const fetch = require('node-fetch')

const SCHEDULE = '0 50 23 * * *'
const REMIND_SCHEDULE = '0 0 20 * * 1'
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
    if (config('enabled') !== 'true') {
      return
    }
    const room = config('room')
    try {
      const msg = (await parseStats()).join('\n')
      robot.send({room}, msg)
    } catch (err) {
      // ignore
    }
  }, null, true, TIME_ZONE)

  new CronJob(REMIND_SCHEDULE, () => {
    if (config('enabled') !== 'true') {
      return
    }
    const room = config('room')
    const msg = 'Remember to enter your hours for the last week by 11:59pm tonight!'
    robot.send({room}, msg)
  }, null, true, TIME_ZONE)

  async function parseStats() {
    const opts = {
      headers: {
        // note: the only cookie required is the one of the form "SSE...=..."
        cookie: config('cookie')
      }
    }
    const response = await fetch(API_URL, opts)
    const data = await response.json()
    const teamName = config('team')
    const week = data.current_week_index + 1
    const allTeams = data.overall_team_ranking
    const totalTeams = allTeams.filter(team => parseInt(team.week) === week).length
    const team = allTeams.find(team =>
      team.team_name === teamName && parseInt(team.week) === week
    )
    const allMembers = data.team_progress.team_member_totals
    const totalMembers = allMembers.filter(member => parseInt(member.week) === week).length
    const members = allMembers.filter(member =>
      member.team_name === teamName && parseInt(member.week) === week
    )
    members.sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
    const msg = [ `*${teamName}*`
                , ''
                , `*Rank*: ${team.rank} of ${totalTeams}`
                , `*Minutes*: ${team.team_total} this week, ${team.total_challenge_minutes} total`
                , ''
                ]
    msg.push(...members.map(member => {
      const name = member.user_display_name
      const thisWeek = member.total_minutes
      const goal = member.challenge_goal
      const total = member.total_challenge_minutes
      const rank = member.rank
      return `*${name}*: ${thisWeek}/${goal} this week, ${total} minutes total, rank ${rank}`
    }))
    return msg
  }

}
