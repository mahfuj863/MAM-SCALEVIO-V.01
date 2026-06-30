// ============================================================
// MAM SCALEVIO — blog.js v2.0
// Dynamically loads blog posts from:
//   1. Google Sheets (if admin has connected the sheet URL)
//   2. localStorage (posts added via admin in local/demo mode)
//   3. blog.json (static fallback)
// ============================================================

var blogPosts = [];

var STATIC_FALLBACK = [
    {
        id: "1",
        title: "How to Optimize Your Amazon PPC in 2026",
        excerpt: "Discover the latest strategies for lowering ACOS and increasing your conversion rates through advanced campaign structures.",
        category: "ppc",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
        date: "May 1, 2026",
        readTime: "6 min read"
    },
    {
        id: "2",
        title: "Mastering the EU Marketplace: DE, IT, ES, FR",
        excerpt: "A complete guide to navigating VAT, localization, and compliance when expanding your brand across European territories.",
        category: "eu",
        image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&auto=format&fit=crop",
        date: "April 10, 2026",
        readTime: "8 min read"
    },
    {
        id: "3",
        title: "The Secret to High-Converting A+ Content",
        excerpt: "Visual storytelling is key. Learn how to design modules that build trust and stop the scroll on mobile and desktop.",
        category: "seo",
        image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&auto=format&fit=crop",
        date: "April 5, 2026",
        readTime: "5 min read"
    }
];

// Normalize a post so category is lowercase
function normalizePost(p) {
    return {
        id: p.id || '',
        title: p.title || '',
        excerpt: p.excerpt || '',
        category: (p.category || 'general').toLowerCase(),
        image: p.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        date: p.date || '',
        readTime: p.readTime || '5 min read'
    };
}

// Load from Google Sheets API
function loadFromSheets(apiUrl) {
    return fetch(apiUrl + '?action=getPosts')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var posts = data.posts || [];
            return posts.map(normalizePost);
        });
}

// Load from localStorage (local/demo admin mode)
function loadFromLocal() {
    var stored = localStorage.getItem('mam_posts');
    if (stored) {
        try {
            var posts = JSON.parse(stored);
            if (Array.isArray(posts) && posts.length > 0) {
                return posts.map(normalizePost);
            }
        } catch(e) {}
    }
    return null;
}

// Load from static blog.json
function loadFromJSON() {
    return fetch('blog.json')
        .then(function(r) { return r.json(); })
        .then(function(data) { return data.map(normalizePost); })
        .catch(function() { return STATIC_FALLBACK.map(normalizePost); });
}

// Master fetch function — tries each source in order
function fetchBlogPosts() {
    var sheetUrl = '';
    try { sheetUrl = localStorage.getItem('mam_sheet_url') || ''; } catch(e) {}

    if (sheetUrl) {
        return loadFromSheets(sheetUrl).then(function(posts) {
            if (posts.length > 0) { blogPosts = posts; return; }
            // Sheet empty — try local then JSON
            var local = loadFromLocal();
            if (local && local.length > 0) { blogPosts = local; return; }
            return loadFromJSON().then(function(p) { blogPosts = p; });
        }).catch(function() {
            // Sheet fetch failed — try local then JSON
            var local = loadFromLocal();
            if (local && local.length > 0) { blogPosts = local; return; }
            return loadFromJSON().then(function(p) { blogPosts = p; });
        });
    }

    var local = loadFromLocal();
    if (local && local.length > 0) {
        blogPosts = local;
        return Promise.resolve();
    }

    return loadFromJSON().then(function(p) { blogPosts = p; });
}

// Also load website content (hero/bio) from Google Sheets if connected
function applyDynamicContent() {
    var sheetUrl = '';
    try { sheetUrl = localStorage.getItem('mam_sheet_url') || ''; } catch(e) {}

    if (!sheetUrl) {
        // Try localStorage content
        var stored = localStorage.getItem('mam_content');
        if (stored) {
            try { applyContentToPage(JSON.parse(stored)); } catch(e) {}
        }
        return;
    }

    fetch(sheetUrl + '?action=getContent')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.content) applyContentToPage(data.content);
        }).catch(function() {
            var stored = localStorage.getItem('mam_content');
            if (stored) {
                try { applyContentToPage(JSON.parse(stored)); } catch(e) {}
            }
        });
}

function applyContentToPage(c) {
    if (!c) return;

    // Hero title
    var heroTitle = document.getElementById('heroTitle') || document.querySelector('.hero-headline');
    if (heroTitle && c.heroTitle) heroTitle.textContent = c.heroTitle;

    // Hero subtitle / typed text
    var heroSub = document.getElementById('heroSubtitle') || document.querySelector('.hero-sub');
    if (heroSub && c.heroSubtitle) heroSub.textContent = c.heroSubtitle;

    // About bio
    var bio = document.getElementById('aboutBio') || document.querySelector('.about-bio');
    if (bio && c.bio) bio.textContent = c.bio;
}

// Render blog cards to #blogGrid
window.renderBlogs = function(filter, search) {
    filter = filter || 'all';
    search = search || '';

    var blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    // Show skeleton loader
    blogGrid.innerHTML = [1, 2, 3].map(function() {
        return '<div class="blog-card skeleton-card" style="height:340px; border-radius:18px; background:rgba(255,255,255,0.04); animation: shimmer 1.5s infinite alternate;"></div>';
    }).join('');

    var doRender = function() {
        var filtered = blogPosts.slice();

        if (filter !== 'all') {
            filtered = filtered.filter(function(p) { return p.category === filter; });
        }

        if (search) {
            var s = search.toLowerCase();
            filtered = filtered.filter(function(p) {
                return p.title.toLowerCase().indexOf(s) > -1 ||
                       p.excerpt.toLowerCase().indexOf(s) > -1;
            });
        }

        if (filtered.length === 0) {
            blogGrid.innerHTML = '<div class="no-results" style="text-align:center; padding:60px; color:rgba(255,255,255,0.4); font-size:1rem;">No articles found matching your criteria.</div>';
            return;
        }

        blogGrid.innerHTML = filtered.map(function(post) {
            return '<article class="blog-card reveal">' +
                '<div class="blog-img-box">' +
                    '<img src="' + post.image + '" alt="' + post.title + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop\'">' +
                    '<span class="blog-category">' + post.category.toUpperCase() + '</span>' +
                '</div>' +
                '<div class="blog-card-body">' +
                    '<h3>' + post.title + '</h3>' +
                    '<p>' + post.excerpt + '</p>' +
                    '<div class="blog-card-footer">' +
                        '<span>' + post.date + '</span>' +
                        '<span>' + post.readTime + '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
        }).join('');

        // Trigger reveal animations on newly inserted cards
        if (window.IntersectionObserver) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08 });
            blogGrid.querySelectorAll('.blog-card').forEach(function(el) { observer.observe(el); });
        }
    };

    if (blogPosts.length > 0) {
        doRender();
    } else {
        fetchBlogPosts().then(doRender);
    }
};

// Auto-apply dynamic content when DOM ready
document.addEventListener('DOMContentLoaded', function() {
    applyDynamicContent();
});
