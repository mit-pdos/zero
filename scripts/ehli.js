// Configuration:
//   HUBOT_EHLI_ROOMS - comma-separated list of rooms

module.exports = (robot) => {

  const config = require('hubot-conf')('ehli', robot)

  robot.hear(/(.|\s+)*/, (res) => {
    if (Math.random() < 0.9) {
      return
    }
    const room = res.message.room
    let msg = res.match[0]
    if (!(config('room') || '').split(',').includes(room)) {
      return
    }
    if (msg.includes('\n')) {
      // don't bother with multi-line messages
      return
    }
    let lastMsg
    let limit = 10 // haven't thought hard enough about whether there can be infinite expansion
    do {
      lastMsg = msg
      for (const [re, replacement] of REPLACEMENT_TABLE) {
        if (msg.match(re)) {
          msg = msg.replace(re, replacement)
        }
      }
      limit--
    } while (limit > 0 && msg !== lastMsg)
    if (msg !== res.match[0]) {
      res.send(`Did you mean: "${msg}"`)
    }
  })

}

// https://itcommunity.stanford.edu/ehli
const REPLACEMENT_TABLE = [
  [/\baddict\b/i, "person with a substance use disorder"],
  [/\baddicted\b/i, "hooked"],
  [/\bbasket\s+case\b/i, "nervous"],
  [/\bblind\s+review\b/i, "anonymous review"],
  [/\bblind\s+study\b/i, "masked study"],
  [/\bcommitted\s+suicide\b/i, "died by suicide"],
  [/\bconfined\s+to\s+a\s+wheelchair\b/i, "person who uses a wheelchair"],
  [/\bcrazy\b/i, "surprising"],
  [/\bcripple\b/i, "person with a disability"],
  [/\bcrippled\b/i, "disabled"],
  [/\bdumb\b/i, "non-vocal"],
  [/\bhandicap\s+parking\b/i, "accessible parking"],
  [/\bhandicapped\s+space\b/i, "accessible space"],
  [/\bhandicapped\b/i, "person with a disability"],
  [/\binsane\b/i, "surprising"],
  [/\blame\b/i, "boring"],
  [/\bmentally\s+ill\b/i, "person living with a mental health condition"],
  [/\bOCD\b/i, "detail-oriented"],
  [/\bparaplegic\b/i, "person with a spinal cord injury"],
  [/\bquadriplegic\b/i, "person with a spinal cord injury"],
  [/\bretard\b/i, "person with a cognitive disability"],
  [/\bretarded\b/i, "boring"],
  [/\bsanity\s+check\b/i, "confidence check"],
  [/\bspaz\b/i, "clumsy"],
  [/\bstand\s+up\s+meeting\b/i, "quick meeting"],
  [/\btone\s+deaf\b/i, "unenlightened"],
  [/\bwalk-in\b/i, "drop-in"],
  [/\bwheelchair\s+bound\b/i, "person who uses a wheelchair"],
  [/\bgray\s+beard\b/i, "<the person's name>"],
  [/\bsenile\b/i, "person suffering from senility"],
  [/\bPhilippine\s+Islands\b/i, "Philippines"],
  [/\bBrave\b/i, "<censored>"],
  [/\bbury\s+the\s+hatchet\b/i, "call for peace"],
  [/\bchief\b/i, "<the person's name>"],
  [/\bGeronimo\b/i, "<censored>"],
  [/\bguru\b/i, "expert"],
  [/\blow\s+man\s+on\s+the\s+totem\s+pole\b/i, "lacking seniority"],
  [/\bon\s+the\s+warpath\b/i, "mad"],
  [/\bPocahontas\b/i, "<the person's name>"],
  [/\bpow\s+wow\b/i, "meet"],
  [/\bpowwow\b/i, "meet"],
  [/\bspirit\s+animal\b/i, "favorite animal"],
  [/\btoo\s+many\s+chiefs\b/i, "a lack of clear direction"],
  [/\bnot\s+enough\s+indians\b/i, "a lack of clear direction"],
  [/\btribal\s+knowledge\b/i, "institutional knowledge"],
  [/\btribe\b/i, "friends"],
  [/\bpreferred\s+pronouns\b/i, "pronouns"],
  [/\bballs\s+to\s+the\s+wall\b/i, "accelerate efforts"],
  [/\bballsy\b/i, "bold"],
  [/\bchairman\b/i, "chairperson"],
  [/\bchairwoman\b/i, "chairperson"],
  [/\bcongressman\b/i, "congressperson"],
  [/\bcongresswoman\b/i, "congressperson"],
  [/\bfireman\b/i, "firefighter"],
  [/\bfiremen\b/i, "firefighters"],
  [/\bfreshman\b/i, "frosh"],
  [/\bgentlemen\b/i, "everyone"],
  [/\bguys\b/i, "folks"],
  [/\bhave\s+the\s+balls\s+to\b/i, "bold"],
  [/\bhe\b/i, "they"],
  [/\bhermaphrodite\b/i, "intersex person"],
  [/\bladies\b/i, "everyone"],
  [/\blandlord\b/i, "property owner"],
  [/\blandlady\b/i, "property owner"],
  [/\bmailman\b/i, "mail person"],
  [/\bman\b/i, "staff"],
  [/\bman\s+hours\b/i, "person hours"],
  [/\bman-in-the-middle\b/i, "person-in-the-middle"],
  [/\bmankind\b/i, "people"],
  [/\bmanmade\b/i, "made by hand"],
  [/\bmanpower\b/i, "workforce"],
  [/\bpoliceman\b/i, "police officer"],
  [/\bpolicemen\b/i, "police officers"],
  [/\bpolicewoman\b/i, "police officer"],
  [/\bpolicewomen\b/i, "police officers"],
  [/\bseminal\b/i, "leading"],
  [/\bshe\b/i, "they"],
  [/\bshemale\b/i, "transgender"],
  [/\btranny\b/i, "transgender person"],
  [/\btrannie\b/i, "transgender person"],
  [/\btransgendered\b/i, "transgender"],
  [/\btranssexual\b/i, "transgender person"],
  [/\byou\s+guys\b/i, "folks"],
  [/\babort\b/i, "cancel"],
  [/\bAmerican\b/i, "US Citizen"],
  [/\bchild\s+prostitute\b/i, "child who has been trafficked"],
  [/\bcircle\s+the\s+wagons\b/i, "take a defensive position"],
  [/\bhalf-breed\b/i, "person of multiple ethnicities"],
  [/\bHispanic\b/i, "Latinx"],
  [/\bIndian\s+giver\b/i, "person who takes something back that was given"],
  [/\bIndian\s+summer\b/i, "late summer"],
  [/\bKaren\b/i, "demanding or entitled White woman"],
  [/\bOriental\b/i, "person of Asian descent"],
  [/\bpeanut\s+gallery\b/i, "audience"],
  [/\bpeople\s+of\s+color\b/i, "BIPOC"],
  [/\bstraight\b/i, "heterosexual"],
  [/\bstupid\b/i, "boring"],
  [/\bsurvivor\b/i, "person who has experienced"],
  [/\btarbaby\b/i, "difficult problem"],
  [/\bthug\b/i, "suspect"],
  [/\buser\b/i, "client"],
  [/\bvictim\b/i, "person who has experienced"],
  [/\bbarrio\b/i, "<specific name of neighborhood>"],
  [/\bblack\s+hat\b/i, "malicious"],
  [/\bblack\s+mark\b/i, "something that is held against one"],
  [/\bblack\s+sheep\b/i, "outcast"],
  [/\bblackballed\b/i, "banned"],
  [/\bblackbox\b/i, "hidden"],
  [/\bblacklist\b/i, "denylist"],
  [/\bblacklisted\b/i, "disallowed"],
  [/\bbrown\s+bag\b/i, "lunch and learn"],
  [/\bcakewalk\b/i, "easy"],
  [/\bgangbusters\b/i, "very successful"],
  [/\bghetto\b/i, "<neighborhood's name>"],
  [/\bgrandfather\b/i, "legacy"],
  [/\bgrandfathered\b/i, "legacy status"],
  [/\bgray\s+hat\s+hacker\b/i, "hacktivist"],
  [/\bmaster\s+list\b/i, "list of record"],
  [/\bmaster\b/i, "primary"],
  [/\bred\s+team\b/i, "cyber offense team"],
  [/\bscalper\b/i, "reseller"],
  [/\bScrum\s+Master\b/i, "agile lead"],
  [/\bslave\s+labor\b/i, "unfair work practices"],
  [/\bslave\b/i, "secondary"],
  [/\bsold\s+down\s+the\s+river\b/i, "betrayed"],
  [/\btarball\b/i, "tar archive"],
  [/\bto\s+call\s+a\s+spade\s+a\s+spade\b/i, "to call something what it is"],
  [/\buppity\b/i, "arrogant"],
  [/\bwebmaster\b/i, "web product owner"],
  [/\bweb\s+master\b/i, "web product owner"],
  [/\bwhite\s+hat\s+hacker\b/i, "ethical hacker"],
  [/\bwhite\s+paper\b/i, "position paper"],
  [/\bwhite\s+team\b/i, "cyber exercise cell"],
  [/\bwhitebox\b/i, "visible"],
  [/\bwhitelist\b/i, "allowlist"],
  [/\bwhitespace\b/i, "empty space"],
  [/\byellow\s+team\b/i, "DevSecOps team"],
  [/\bconvict\b/i, "person who was incarcerated"],
  [/\bdisabled\s+person\b/i, "person with a disability"],
  [/\bhomeless\s+person\b/i, "person without housing"],
  [/\bimmigrant\b/i, "person who has immigrated"],
  [/\bprisoner\b/i, "person who is incarcerated"],
  [/\bprostitute\b/i, "person who engages in sex work"],
  [/\babusive\s+relationship\b/i, "relationship with an abusive person"],
  [/\bbeating\s+a\s+dead\s+horse\b/i, "refusing to let something go"],
  [/\bcrack\s+the\s+whip\b/i, "double down"],
  [/\bgo\s+off\s+the\s+reservation\b/i, "disagree with the group"],
  [/\bkilling\s+two\s+birds\s+with\s+one\s+stone\b/i, "accomplishing two things at once"],
  [/\bkilling\s+it\b/i, "doing a great job"],
  [/\bmore\s+than\s+one\s+way\s+to\s+skin\s+a\s+cat\b/i, "multiple ways to accomplish the task"],
  [/\bpull\s+the\s+trigger\b/i, "give it a go"],
  [/\brule\s+of\s+thumb\b/i, "standard rule"],
  [/\btake\s+a\s+shot\s+at\b/i, "give it a go"],
  [/\byour\s+best\s+shot\s+at\b/i, "give it a go"],
  [/\btake\s+a\s+stab\s+at\b/i, "give it a go"],
  [/\btrigger\s+warning\b/i, "content note"],
  [/\bwar\s+room\b/i, "situation room"],
  [/\bwhipped\s+into\s+shape\b/i, "organized"],
  [/\bwife\s+beater\b/i, "white ribbed tank top"],
]
