export const youtubeHomeFixture = `
<!DOCTYPE html>
<html>
<head><title>YouTube</title></head>
<body>
  <ytd-masthead id="masthead">
    <div id="search">Search Bar</div>
    <div id="voice-search-button">Mic</div>
    <div id="buttons">
      <ytd-button-renderer id="create-btn">
        <button aria-label="Create">+</button>
      </ytd-button-renderer>
      <ytd-notification-topbar-button-renderer id="notification-button">
        Bell
      </ytd-notification-topbar-button-renderer>
      <ytd-topbar-menu-button-renderer id="profile-btn">
        <button id="avatar-btn">Avatar</button>
      </ytd-topbar-menu-button-renderer>
    </div>
  </ytd-masthead>
  
  <ytd-app>
    <!-- Guide Navigation Drawer -->
    <tp-yt-app-drawer id="guide">
      <ytd-guide-renderer id="guide-renderer">
        <div id="guide-wrapper">
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
        </div>
      </ytd-guide-renderer>
    </tp-yt-app-drawer>

    <!-- Main Browse / Home Feed -->
    <ytd-page-manager id="page-manager">
      <ytd-browse page-subtype="home">
        <!-- Category chips bar -->
        <ytd-feed-filter-chip-bar-renderer id="category-chips">
          <div id="chips-wrapper">
            <span class="chip">All</span>
            <span class="chip">Gaming</span>
            <span class="chip">Music</span>
          </div>
        </ytd-feed-filter-chip-bar-renderer>

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

          <ytd-watch-metadata>
            <!-- Actions Toolbar -->
            <div id="actions">
              <div id="top-level-buttons-computed">
                <!-- Keep: Like and Dislike -->
                <like-button-view-model id="like-btn">
                  <button aria-label="Like this video">21K</button>
                </like-button-view-model>

                <!-- Hide: Share -->
                <ytd-button-renderer id="share-btn">
                  <button aria-label="Share">Share</button>
                </ytd-button-renderer>

                <!-- Hide: Ask (AI) -->
                <yt-button-view-model id="ask-btn">
                  <button aria-label="Ask">Ask</button>
                </yt-button-view-model>

                <!-- Keep: Save to playlist -->
                <ytd-button-renderer id="save-btn">
                  <button aria-label="Save to playlist">Save</button>
                </ytd-button-renderer>

                <!-- Hide: More actions -->
                <ytd-menu-renderer>
                  <ytd-popup-button-renderer id="more-actions-btn">
                    <button aria-label="More actions">...</button>
                  </ytd-popup-button-renderer>
                </ytd-menu-renderer>
              </div>
            </div>

            <!-- Video Description -->
            <div id="description" class="style-scope ytd-watch-metadata">
              <div id="description-inner">
                <ytd-text-inline-expander id="desc-expander">
                  Detailed video description text and links...
                </ytd-text-inline-expander>
              </div>
            </div>
          </ytd-watch-metadata>
          
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

export const instagramHomeFixture = `
<!DOCTYPE html>
<html>
<head><title>Instagram</title></head>
<body>
  <!-- Navigation Sidebar -->
  <nav id="main-nav">
    <!-- Home (keep visible) -->
    <a href="/" id="nav-home">
      <svg aria-label="Home"><path></path></svg>
      <span>Home</span>
    </a>

    <!-- Reels (hide) -->
    <a href="/reels/" id="nav-reels">
      <svg aria-label="Reels"><path></path></svg>
      <span>Reels</span>
    </a>

    <!-- Messages (keep in nav) -->
    <a href="/direct/inbox/" id="nav-messages">
      <svg aria-label="Messages"><path></path></svg>
      <span>Messages</span>
    </a>

    <!-- Search (hide) -->
    <div role="button" id="nav-search">
      <svg aria-label="Search"><path></path></svg>
      <span>Search</span>
    </div>

    <!-- Notifications (keep in nav) -->
    <a href="#" id="nav-notifications">
      <svg aria-label="Notifications"><path></path></svg>
      <span>Notifications</span>
    </a>

    <!-- Create (hide) -->
    <div role="button" id="nav-create">
      <svg aria-label="New post"><path></path></svg>
      <span>Create</span>
    </div>

    <!-- Profile (keep in nav) -->
    <a href="/user_profile/" id="nav-profile">
      <span>Profile</span>
    </a>

    <!-- More (hide) -->
    <div role="button" id="nav-more">
      <svg aria-label="Settings"><path></path></svg>
      <span>More</span>
    </div>

    <!-- Also from Meta / Threads (hide) -->
    <a href="https://threads.net" id="nav-threads">
      <svg aria-label="Threads"><path></path></svg>
      <span>Also from Meta</span>
    </a>
  </nav>

  <!-- Main Feed Area -->
  <main role="main">
    <section id="feed-section">
      <article id="post-1">Post 1</article>
      <article id="post-2">Post 2</article>
    </section>

    <!-- Right Sidebar: Profile Switcher & Suggested for you -->
    <div role="complementary" id="right-sidebar">
      <div id="user-switch">Switch account</div>
      <div id="suggested-users">
        <h3>Suggested for you</h3>
        <a href="/explore/people/">See all</a>
      </div>
      <div id="footer-meta">About - Help - Press - Meta</div>
    </div>
  </main>

  <!-- Floating Messages Widget (Bottom Right) -->
  <div data-pagelet="IGDChatTabsRootContent" id="floating-chat-widget">
    <div role="button" id="floating-msg-btn">
      <svg aria-label="Messages"><path></path></svg>
      <span>Messages</span>
    </div>
  </div>
</body>
</html>
`;

