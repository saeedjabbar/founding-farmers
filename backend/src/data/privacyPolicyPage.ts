import { BlocksContent, heading, paragraph } from './blockHelpers';

export const PRIVACY_POLICY_TITLE = 'Privacy Policy';

export const PRIVACY_POLICY_BODY: BlocksContent = [
  heading(2, 'Who we are'),
  paragraph('Our website address is: https://foundingfarmers.org'),
  heading(2, 'Comments'),
  paragraph(
    "When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection."
  ),
  paragraph(
    'An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.'
  ),
  heading(2, 'Media'),
  paragraph(
    'If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.'
  ),
  heading(2, 'Cookies'),
  paragraph(
    'If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.'
  ),
  paragraph(
    'If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.'
  ),
  paragraph(
    'When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.'
  ),
  paragraph(
    'If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.'
  ),
  heading(2, 'Embedded content from other websites'),
  paragraph(
    'These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.'
  ),
  heading(2, 'How long we retain your data'),
  paragraph(
    'If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue. Refer to our Rules page for retention rules on submitted content and documents.'
  ),
  heading(2, 'What rights you have over your data'),
  paragraph(
    'If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.'
  ),
  heading(2, 'Where your data is sent'),
  paragraph('Visitor comments may be checked through an automated spam detection service.'),
  heading(2, 'Questions'),
  paragraph('Questions or concerns about this Privacy Policy can be sent to transparency@foundingfarmers.org.'),
];
