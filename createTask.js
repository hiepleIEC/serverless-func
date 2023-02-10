const discordApi = require("../discordApi");

module.exports = async () => {
  const content = `__**Color Sort**__ \`[release/aab]\` \`##327 - 14.9.0\``;
  const infoEmbed = {
    title: 'Information',
    color: discordApi.COLORS.GREEN,
    fields: [
      ...[{
        name: 'App Name',
        value: `Color Sort`,
        inline: true,
      }],
      ...[{
        name: 'Version Name',
        value: `14.9.0`,
        inline: true
      }],
      ...[{
        name: '\u200B',
        value: `\u200B`,
        inline: true,
      }],
      ...[{
        name: 'Bundle ID',
        value: `com.gma.ball.sort.color.water.puzzle`,
        inline: false
      }],
      ...[{
        name: 'Version Code',
        value: `327`,
        inline: true
      }],
      ...[{
        name: 'Pipeline IID',
        value: `106`,
        inline: true
      }],
      ...[{
        name: 'Target SDK Version',
        value: `31`,
        inline: true
      }],
      ...[{
        name: 'Google Billing',
        value: '4.0.0',
        inline: true
      }],
      ...[{
        name: 'Debuggable',
        value: "False",
        inline: true
      }],
      ...[{
        name: '64bit',
        value: "True",
        inline: true
      }],
      ...[{
        name: 'x86',
        value: "False",
        inline: true
      }],
      ...[{
        name: 'armv7',
        value: "⚠️False⚠️",
        inline: true
      }],
      ...[{
        name: 'Signature',
        value: "⚠️Debug⚠️",
        inline: true
      }],
      ...[{
        name: 'Branch',
        value: `release/aab`,
        inline: true
      }],
      ...[{
        name: 'Commit',
        value: `adecdbe8`,
        inline: true
      }],
      ...[{
        name: 'Unity Version',
        value: `2020.3.38f1`,
        inline: true
      }],
      ...[{
        name: 'Changes',
        value: `- Merge branch 'dev/android' into release/aab\n - Merge branch 'dev/main' into dev/android\n- fix event Cheat`
      },
      ],
      ...[{
        name: 'AAB',
        value: `[Download AAB](https://apk-from-aab.s3.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-327.aab?AWSAccessKeyId=AKIA4E3VQTS4XZVF5HBD&Signature=n1%2F9zccbTSH3FkX0qwReNIKEvH4%3D&Expires=1673867951)`,
        inline: true,
      }],
      ...[{
        name: 'APK',
        value: `[Download APK](https://apk-from-aab.s3.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-327.aab?AWSAccessKeyId=AKIA4E3VQTS4XZVF5HBD&Signature=n1%2F9zccbTSH3FkX0qwReNIKEvH4%3D&Expires=1673867951)`,
        inline: true,
      }],
      ...[{
        name: '\u200B',
        value: `\u200B`,
        inline: true,
      }],
      ...[{
        name: 'Pipeline',
        value: `[Gitlab Pipeline](https://gitlab.com/iecgames/x-sort-puzzle/ball-sort-color-water-puzzle-v-2/-/pipelines/741627810)`,
        inline: true,
      }],
      ...[{
        name: 'Android Manifest',
        value: `[Download Manifest](https://apk-from-aab.s3.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-327-AndroidManifest.xml?AWSAccessKeyId=AKIA4E3VQTS4XZVF5HBD&Signature=ll5xS%2Frl%2B0uB1PN0yuUaXbPl6Uo%3D&Expires=1673867952)`,
        inline: true,
      }],
      ...[{
        name: '\u200B',
        value: `\u200B`,
        inline: true,
      }],
      ...[{
        name: 'Packages Manifest',
        value: `[manifest.json](https://apk-from-aab.s3.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-327-manifest.json?AWSAccessKeyId=AKIA4E3VQTS4XZVF5HBD&Signature=nTIsHt8IuZr73stPs32V8yR%2FafI%3D&Expires=1673867952)`,
        inline: true,
      }],
      ...[{
        name: 'Main Template',
        value: `[mainTemplate.gradle](https://apk-from-aab.s3.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-327-mainTemplate.gradle.txt?AWSAccessKeyId=AKIA4E3VQTS4XZVF5HBD&Signature=vwsFzA52BSSTidqFC9bPYI9VtXc%3D&Expires=1673867952)`,
        inline: true,
      }],
      ...[{
        name: '\u200B',
        value: `\u200B`,
        inline: true,
      }],
    ]
  }


  let mgsContent = `Gitlab Build **SUCCESS** ${content}.\n> Triggered by: @Văn NH`;

  const resetLinkEmbed = {
    title: 'If the link expired in the future, send the following message to Bot',
    fields: [
      ...[{
        name: 'APK',
        value: `!reset-aab-link !reset-aab-link ball-sort-color-water-puzzle-v-2-Color Sort-327.apk`,
        //inline: true,
      }],
      ...[{
        name: 'AAB',
        value: `!reset-aab-link !reset-aab-link ball-sort-color-water-puzzle-v-2-Color Sort-327.aab`,
        //inline: true,
      }]
    ]
  }

  infoEmbed.thumbnail = {
    url: `https://ccb-public.s3.ap-southeast-1.amazonaws.com/ball-sort-color-water-puzzle-v-2-Color%20Sort-c74417c7514795e45898bde83c6018d8.png`
  };

  return {
    options: {
      content: mgsContent,
      embeds: [resetLinkEmbed, infoEmbed],
    },
  }
}
