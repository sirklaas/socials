/** Target channel ids for image prompt generation (Claude) — used in Visuals step */
export const CHANNEL_DEFS = [
    { id: 'blog', labelKey: 'chBlog', insta: false },
    { id: 'insta_post', labelKey: 'chInstaPost', insta: true },
    { id: 'reel', labelKey: 'chReel', insta: true },
    { id: 'carousel', labelKey: 'chCarousel', insta: true },
    { id: 'facebook_from_insta', labelKey: 'chFacebookFromInsta', insta: false },
    { id: 'youtube_long', labelKey: 'chYoutubeLong', insta: false },
    { id: 'youtube_short', labelKey: 'chYoutubeShort', insta: false },
    { id: 'tiktok', labelKey: 'chTiktok', insta: false },
    { id: 'linkedin', labelKey: 'chLinkedin', insta: false },
    { id: 'bluesky', labelKey: 'chBluesky', insta: false },
];
