export const youtubeHomeFixture = `
<!DOCTYPE html>
<html>
<head><title>YouTube</title></head>
<body>
  <div id="masthead-container">
    <div id="search">Search Bar</div>
  </div>
  
  <ytd-app>
    <!-- Guide Navigation Drawer -->
    <div id="guide">
      <ytd-guide-renderer>
        <ytd-guide-section-renderer>
          <ytd-guide-entry-renderer id="entry-home">
            <a href="/" title="Home">Home</a>
          </ytd-guide-entry-renderer>
          <ytd-guide-entry-renderer id="entry-shorts">
            <a href="/shorts/123" title="Shorts">Shorts</a>
          </ytd-guide-entry-renderer>
          <ytd-guide-entry-renderer id="entry-subs">
            <a href="/feed/subscriptions" title="Subscriptions">Subscriptions</a>
          </ytd-guide-entry-renderer>
        </ytd-guide-section-renderer>
      </ytd-guide-renderer>
    </div>

    <!-- Main Browse / Home Feed -->
    <ytd-browse page-subtype="home">
      <ytd-rich-grid-renderer id="home-grid">
        <div id="contents" class="ytd-rich-grid-renderer">
          <ytd-rich-item-renderer id="video-card-1">
            <div id="video-title">Regular Video 1</div>
          </ytd-rich-item-renderer>

          <!-- Shorts Shelf on Home Feed -->
          <ytd-rich-section-renderer id="shorts-shelf-section">
            <ytd-rich-shelf-renderer is-shorts id="shelf-shorts">
              <span>Shorts Shelf</span>
            </ytd-rich-shelf-renderer>
          </ytd-rich-section-renderer>

          <ytd-rich-item-renderer id="video-card-2">
            <div id="video-title">Regular Video 2</div>
          </ytd-rich-item-renderer>
        </div>
      </ytd-rich-grid-renderer>
    </ytd-browse>
  </ytd-app>
</body>
</html>
`;

export const youtubeWatchFixture = `
<!DOCTYPE html>
<html>
<head><title>Video Title - YouTube</title></head>
<body>
  <ytd-app>
    <ytd-watch-flexy>
      <!-- Primary Player Column -->
      <div id="primary">
        <div id="player">Video Player</div>
        <div id="primary-inner">
          <div id="above-the-fold">Title & Channel Info</div>
          
          <!-- Comments Section -->
          <ytd-comments id="comments" class="ytd-watch-flexy">
            <div id="header">1,420 Comments</div>
            <div id="contents">Comment Items...</div>
          </ytd-comments>
        </div>
      </div>

      <!-- Secondary Recommendations Sidebar -->
      <div id="secondary">
        <div id="related" class="ytd-watch-flexy">
          <div id="items">Related Video 1, 2, 3...</div>
        </div>
      </div>
    </ytd-watch-flexy>
  </ytd-app>
</body>
</html>
`;

export const redditFeedFixture = `
<!DOCTYPE html>
<html>
<head><title>Reddit Feed</title></head>
<body>
  <div id="main-content">
    <shreddit-feed>
      <article id="organic-post-1">
        <h2>Interesting Discussion Post</h2>
      </article>

      <!-- Promoted / Sponsored Ad Post -->
      <shreddit-ad-post id="ad-post-1" data-testid="ad-post">
        <h2>Sponsored Product Ad</h2>
      </shreddit-ad-post>

      <article id="organic-post-2">
        <h2>Another Great Post</h2>
      </article>

      <div class="promotedlink" id="ad-post-2" data-promoted="true">
        Promoted Link
      </div>
    </shreddit-feed>
  </div>

  <aside aria-label="Recent Posts" id="recent-posts-sidebar">
    <shreddit-recent-posts id="recent-posts-widget">
      <h3>Recent Posts</h3>
    </shreddit-recent-posts>
  </aside>
</body>
</html>
`;
