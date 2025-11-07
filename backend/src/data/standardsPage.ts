import {
  BlocksContent,
  heading,
  horizontalRule,
  list,
  paragraph,
} from './blockHelpers';

export const STANDARDS_PAGE_TITLE = 'Founding Farmers Project and Editorial Rules';

export const STANDARDS_PAGE_BODY: BlocksContent = [
  paragraph(
    'Founding Farmers is a collaborative news project in Ulster County, NY. We unite journalists and the public to analyze and share information to keep our leaders accountable the community informed. Below are our editorial rules and project guidelines.'
  ),
  heading(2, '1. Public Information Only', { bold: true }),
  paragraph('Published material will be drawn from information that is public by law or record. This includes:'),
  list([
    { content: [paragraph('Official town communications and notices.')] },
    { content: [paragraph('Records that can be obtained through the Freedom of Information Law (FOIL).')] },
    { content: [paragraph('Town board meeting minutes and agendas.')] },
    { content: [paragraph('Documents voluntarily submitted by the public for publication.')] },
    { content: [paragraph('Communication in online platforms from public officials.')] },
  ]),
  paragraph(
    'The project does not create or distribute private information. Its purpose is to make public records and information easier to access and understand. Personal text messages, personal emails, and phone call transcripts will not be published. Correspondence to or from a public entity will be reviewed and potentially published should it pertain to a public matter. No political statements or bias will be published.'
  ),
  horizontalRule,
  heading(2, '2. Redaction of Personal Identifying Information and Confidentiality', { bold: true }),
  list([
    {
      content: [
        paragraph(
          'Names, residential addresses, phone numbers, and personal email addresses of private individuals will be redacted before publication.'
        ),
      ],
    },
    {
      content: [
        paragraph(
          'The addresses of publicly accessible businesses (such as restaurants, wineries, and farm stands) and public buildings (such as Town Hall, schools, and libraries) will be published.'
        ),
      ],
    },
    {
      content: [
        paragraph('Names of elected officials, appointed officials, and other public figures acting in an official capacity will be published.'),
      ],
    },
    {
      content: [
        paragraph(
          'Documents submitted by the public will be reviewed and redacted before publication. Anonymity will be respected upon request.'
        ),
      ],
    },
    {
      content: [
        paragraph(
          'Examples of acceptable documents include: correspondence received by the town, planning or zoning applications, financial reports, environmental studies, or any record that could otherwise be requested under FOIL.'
        ),
      ],
    },
  ]),
  horizontalRule,
  heading(2, '4. Retention of Emails and Questions', { bold: true }),
  list([
    {
      content: [
        paragraph('Emails sent to submit documents will be retained for ', { text: 'up to 30 days', bold: true }, ', then permanently deleted.'),
      ],
    },
    {
      content: [
        paragraph('Emails sent with questions will also be retained for ', { text: 'up to 30 days', bold: true }, '.'),
      ],
    },
    {
      content: [
        paragraph('Questions of general public interest will be published to the website in a ', { text: 'Q&A format', bold: true }, '.'),
      ],
    },
    {
      content: [
        paragraph('User emails subscribed for updates from the website will be stored indefinitely until unsubscribed.'),
      ],
    },
  ]),
  paragraph({ text: 'Example:', bold: true }),
  list([
    {
      content: [
        paragraph(
          'Question received: ',
          { text: '"What is the timeline for road repairs on 9W?"', italic: true }
        ),
      ],
    },
    {
      content: [
        paragraph(
          'Published on website: ',
          { text: 'Q: What is the timeline for road repairs on 9W?', bold: true }
        ),
        paragraph(
          { text: 'A:', bold: true },
          ' The Town Board discussed road repair work at the March 10 meeting. The project is scheduled to begin in June and conclude by September.'
        ),
      ],
    },
  ]),
  paragraph("In this example, the resident's name and email are not shared."),
  horizontalRule,
  heading(2, '5. Editorial Guidelines', { bold: true }),
  list([
    { content: [paragraph('All information will be presented factually and without editorial bias.')] },
    { content: [paragraph('We avoid speculation, hearsay, or unverified claims.')] },
    { content: [paragraph('We present information in a direct, factual, and objective style.')] },
    {
      content: [
        paragraph(
          'We welcome community submissions of public documents and will review and publish them with appropriate redactions. Redactions will be noted clearly, so the public can distinguish between what is available and what was withheld for privacy.'
        ),
      ],
    },
    {
      content: [
        paragraph(
          "We abide by the Society of Professional Journalist's Code of Ethics and will respect the anonymity of any private source upon review and request."
        ),
      ],
    },
    {
      content: [
        paragraph(
          'Documents and summaries will be published in full transparency, with care taken to provide context when needed.'
        ),
      ],
    },
    { content: [paragraph('No election ads, articles, or campaign information will be published.')] },
    {
      content: [
        paragraph(
          'Opinion posts and interviews with private residents may be considered on a case-by-case basis; these posts will be clearly noted as Opinion pieces.'
        ),
      ],
    },
  ]),
  horizontalRule,
  heading(2, '6. Discussions', { bold: true }),
  list([
    { content: [paragraph('Post comments are moderated and no inflammatory or derogatory comments are permitted.')] },
    {
      content: [
        paragraph(
          'No political bias or comments about political parties are permitted in the comments. For example, the below jargon is prohibited:'
        ),
      ],
      nestedList: list(
        [
          { content: [paragraph('"These democrats can\'t..."')] },
          { content: [paragraph('"These republicans don\'t..."')] },
        ],
        'unordered'
      ),
    },
  ]),
  heading(2, '7. Content Use', { bold: true }),
  list([
    { content: [paragraph('All articles published on Founding Farmers are original works created by our editorial team.')] },
    {
      content: [
        paragraph(
          'Our content is open for resharing, provided that proper credit is given to Founding Farmers and permission is requested before republication.'
        ),
      ],
    },
  ]),
];
